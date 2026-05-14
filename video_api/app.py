"""
app.py — Gradio web UI for the Video Workflow pipeline.

Launch with:
    python app.py
Then open http://localhost:7860 in your browser.
"""

import os
import sys
import threading

# Ensure local modules are importable
sys.path.insert(0, os.path.dirname(__file__))

import gradio as gr

from themes import list_themes, DEFAULT_THEME


# ─────────────────────────────────────────────────────────────────────────────
#  Pipeline runner (called in a background thread by Gradio)
# ─────────────────────────────────────────────────────────────────────────────

def generate_video(
    subject:  str,
    level:    str,
    theme:    str,
    progress=gr.Progress(track_tqdm=True),
):
    """
    Runs the full pipeline and yields status messages + output paths.
    Returns (video_path, thumbnail_path, timestamps_text, status_message).
    """
    subject = subject.strip()
    if not subject:
        raise gr.Error("Please enter a lesson subject.")

    # Import here so the UI starts even if some deps are missing
    from Script_Gen import generate_script, save_script
    from Movie      import generate_voice
    from Slide_gen  import generate_slides
    from main       import assemble_video
    from run        import generate_timestamps, clear_outputs, _paths

    base = "output"
    p    = _paths(base)

    # Clear previous outputs so we start fresh for a new subject
    clear_outputs(base)

    try:
        # ── 1. Script ──────────────────────────────
        progress(0.05, desc="[1/5] Generating script with Gemini...")
        script = generate_script(subject, level=level)
        save_script(script, p["script"])
        n_slides = len(script["slides"])

        # ── 2. Audio ───────────────────────────────
        progress(0.20, desc=f"[2/5] Generating audio ({n_slides} narrations)...")
        generate_voice(script_path=p["script"], output_dir=p["audio"])

        # ── 3. Slides ──────────────────────────────
        progress(0.45, desc=f"[3/5] Rendering slides (theme: {theme})...")
        generate_slides(
            script_path=p["script"],
            output_dir=p["slides"],
            theme=theme,
        )

        # ── 4. Video ───────────────────────────────
        progress(0.75, desc="[4/5] Assembling video...")
        assemble_video(
            slides_dir  = p["slides"],
            audio_dir   = p["audio"],
            output_path = p["video"],
            script_path = p["script"],
        )

        # ── 5. Timestamps ──────────────────────────
        progress(0.95, desc="[5/5] Generating timestamps...")
        ts = generate_timestamps(
            script_path = p["script"],
            audio_dir   = p["audio"],
            slides_dir  = p["slides"],
            out_path    = p["timestamps"],
        )

        progress(1.0, desc="Done!")

        thumbnail = os.path.join(p["slides"], "thumbnail.png")
        return (
            p["video"],
            thumbnail if os.path.exists(thumbnail) else None,
            ts,
            f"Video generated successfully — {n_slides} slides",
        )

    except Exception as e:
        raise gr.Error(f"Pipeline error: {e}")


# ─────────────────────────────────────────────────────────────────────────────
#  UI Layout
# ─────────────────────────────────────────────────────────────────────────────

_THEME_CSS = """
#gen-btn { background: linear-gradient(135deg, #7F77DD, #5DCAA5) !important;
           color: white !important; font-weight: 700; font-size: 17px;
           border: none; border-radius: 12px; padding: 14px; }
#gen-btn:hover { opacity: 0.9; }
footer { display: none !important; }
"""

with gr.Blocks(
    title="AI Video Lesson Generator",
    theme=gr.themes.Soft(
        primary_hue="violet",
        secondary_hue="teal",
    ),
    css=_THEME_CSS,
) as demo:

    gr.Markdown(
        """
        # 🎓 AI Video Lesson Generator
        Generate a fully narrated, animated educational video from a single sentence.
        """
    )

    with gr.Row():
        # ── LEFT: inputs ─────────────────────────────────────────────────────
        with gr.Column(scale=2):
            subject_box = gr.Textbox(
                label="Lesson subject",
                placeholder='e.g. "Transformer attention mechanism for beginners"',
                lines=2,
            )
            with gr.Row():
                level_dd = gr.Dropdown(
                    label="Audience level",
                    choices=["beginner", "intermediate", "advanced", "expert"],
                    value="intermediate",
                )
                theme_dd = gr.Dropdown(
                    label="Visual theme",
                    choices=list_themes(),
                    value=DEFAULT_THEME,
                )
            gen_btn = gr.Button(
                "Generate Video",
                variant="primary",
                elem_id="gen-btn",
            )
            status_box = gr.Textbox(
                label="Status",
                interactive=False,
                placeholder="Ready. Press Generate to start...",
            )

        # ── RIGHT: outputs ───────────────────────────────────────────────────
        with gr.Column(scale=3):
            video_out = gr.Video(
                label="Generated video",
                height=380,
            )
            with gr.Row():
                thumbnail_out = gr.Image(
                    label="Thumbnail (YouTube-ready)",
                    height=200,
                )
                timestamps_out = gr.Textbox(
                    label="YouTube Timestamps",
                    lines=10,
                    interactive=False,
                    placeholder="Timestamps will appear here...",
                )

    # Wire up
    gen_btn.click(
        fn=generate_video,
        inputs=[subject_box, level_dd, theme_dd],
        outputs=[video_out, thumbnail_out, timestamps_out, status_box],
    )

    gr.Markdown(
        """
        ---
        **Tips**
        - Generation takes ~2-4 minutes depending on the number of slides.
        - Themes: **dark-purple** (default), **ocean**, **corporate**, **minimal**, **forest**
        - Levels: **beginner** = simple language · **expert** = deep technical content
        - For batch generation use the CLI: `python run.py --batch subjects.txt --theme ocean`
        """
    )


# ─────────────────────────────────────────────────────────────────────────────
#  Launch
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        inbrowser=True,
    )
