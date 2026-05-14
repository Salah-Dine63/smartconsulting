import os
import re
import sys
import json
import shutil
import argparse
from moviepy import AudioFileClip

from Script_Gen import generate_script, save_script
from Movie      import generate_voice
from Slide_gen  import generate_slides
from main       import assemble_video, INTRO_DUR, OUTRO_DUR
from themes     import list_themes, DEFAULT_THEME


# ─────────────────────────────────────────────────────────────────────────────
#  Output paths for a given base directory
# ─────────────────────────────────────────────────────────────────────────────

def _paths(base: str = "output") -> dict:
    return {
        "script":     os.path.join(base, "script.json"),
        "audio":      os.path.join(base, "audio"),
        "slides":     os.path.join(base, "slides"),
        "video":      os.path.join(base, "lesson.mp4"),
        "timestamps": os.path.join(base, "timestamps.txt"),
    }


def clear_outputs(base: str = "output"):
    for path in _paths(base).values():
        if os.path.exists(path):
            shutil.rmtree(path) if os.path.isdir(path) else os.remove(path)
    print(f"  Cleared all cached outputs in: {base}\n")


# ─────────────────────────────────────────────────────────────────────────────
#  Timestamps generator
# ─────────────────────────────────────────────────────────────────────────────

def generate_timestamps(
    script_path: str = "output/script.json",
    audio_dir:   str = "output/audio",
    slides_dir:  str = "output/slides",
    out_path:    str = "output/timestamps.txt",
) -> str:
    with open(script_path, "r", encoding="utf-8") as f:
        script = json.load(f)

    lines = []
    t     = 0.0

    def fmt(seconds: float) -> str:
        m = int(seconds // 60)
        s = int(seconds  % 60)
        return f"{m}:{s:02d}"

    if os.path.exists(os.path.join(slides_dir, "intro.png")):
        lines.append(f"{fmt(t)} Intro")
        t += INTRO_DUR

    for slide in script["slides"]:
        num        = slide["slide_number"]
        audio_path = os.path.join(audio_dir, f"audio_{num:03d}.mp3")
        lines.append(f"{fmt(t)} {slide['title']}")
        if os.path.exists(audio_path):
            a  = AudioFileClip(audio_path)
            t += a.duration
            a.close()

    if os.path.exists(os.path.join(slides_dir, "outro.png")):
        lines.append(f"{fmt(t)} Outro")

    text = "\n".join(lines)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(text)
    return text


# ─────────────────────────────────────────────────────────────────────────────
#  Single-subject pipeline
# ─────────────────────────────────────────────────────────────────────────────

def run_pipeline(
    subject: str,
    base:    str = "output",
    theme:   str = DEFAULT_THEME,
    level:   str = "intermediate",
    force:   bool = False,
) -> str:
    """Full end-to-end pipeline for one subject. Returns path to video file."""
    p = _paths(base)

    print("=" * 54)
    print("  VIDEO WORKFLOW")
    print(f"  Subject : {subject}")
    print(f"  Level   : {level}  |  Theme: {theme}")
    print("=" * 54)

    if force:
        clear_outputs(base)

    # ── 1. Script ────────────────────────────────────────
    print("\n[1/5] Script generation")
    if os.path.exists(p["script"]):
        with open(p["script"], "r", encoding="utf-8") as f:
            cached = json.load(f)
        if cached.get("subject", "").strip().lower() != subject.strip().lower():
            print("  Subject changed — clearing cache and regenerating...")
            clear_outputs(base)
            script = generate_script(subject, level=level)
            save_script(script, p["script"])
        else:
            print("  Using cached script...")
            script = cached
            print(f"  Loaded: {len(script['slides'])} slides — \"{script['title']}\"")
    else:
        script = generate_script(subject, level=level)
        save_script(script, p["script"])

    # ── 2. Audio ─────────────────────────────────────────
    print("\n[2/5] Audio generation (parallel)")
    generate_voice(script_path=p["script"], output_dir=p["audio"])

    # ── 3. Slides ────────────────────────────────────────
    print("\n[3/5] Slide rendering (parallel) + intro / outro / thumbnail")
    generate_slides(script_path=p["script"], output_dir=p["slides"], theme=theme)

    # ── 4. Video ─────────────────────────────────────────
    print("\n[4/5] Video assembly")
    assemble_video(
        slides_dir  = p["slides"],
        audio_dir   = p["audio"],
        output_path = p["video"],
        script_path = p["script"],
    )

    # ── 5. Timestamps ────────────────────────────────────
    print("\n[5/5] YouTube timestamps")
    ts = generate_timestamps(
        script_path = p["script"],
        audio_dir   = p["audio"],
        slides_dir  = p["slides"],
        out_path    = p["timestamps"],
    )
    print(f"  Saved: {p['timestamps']}\n")
    print("  --- Paste into YouTube description ---")
    print(ts)
    print("  --------------------------------------")

    print("\n" + "=" * 54)
    print("  Done!")
    print(f"  Video     →  {p['video']}")
    print(f"  Thumbnail →  {os.path.join(p['slides'], 'thumbnail.png')}")
    print(f"  Timestamps→  {p['timestamps']}")
    print("=" * 54)

    return p["video"]


# ─────────────────────────────────────────────────────────────────────────────
#  Batch mode
# ─────────────────────────────────────────────────────────────────────────────

def _safe_dir_name(subject: str, idx: int) -> str:
    slug = re.sub(r"[^\w\s-]", "", subject).strip().replace(" ", "_")[:40]
    return f"output/batch_{idx:03d}_{slug}"


def run_batch(
    batch_file: str,
    theme:      str  = DEFAULT_THEME,
    level:      str  = "intermediate",
    force:      bool = False,
):
    with open(batch_file, "r", encoding="utf-8") as f:
        subjects = [ln.strip() for ln in f if ln.strip()]

    if not subjects:
        print("Batch file is empty.")
        return

    print(f"\n  Batch mode — {len(subjects)} subject(s)\n")
    results = []
    for i, subject in enumerate(subjects, 1):
        print(f"\n{'─'*54}\n  [{i}/{len(subjects)}] {subject}\n{'─'*54}")
        base = _safe_dir_name(subject, i)
        try:
            video = run_pipeline(subject, base=base, theme=theme,
                                 level=level, force=force)
            results.append((subject, video, None))
        except Exception as e:
            print(f"  ERROR: {e}")
            results.append((subject, None, str(e)))

    print("\n" + "=" * 54)
    print("  BATCH SUMMARY")
    print("=" * 54)
    for subj, vid, err in results:
        status = f"OK  {vid}" if vid else f"ERR {err}"
        print(f"  {subj[:36]:<36}  {status}")
    print("=" * 54)


# ─────────────────────────────────────────────────────────────────────────────
#  CLI
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Generate an educational video lesson end-to-end.",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument(
        "subject", nargs="?", default=None,
        help='Lesson subject, e.g. "Python decorators for beginners"',
    )
    parser.add_argument(
        "--theme", default=DEFAULT_THEME, choices=list_themes(),
        help=f"Color theme  (default: {DEFAULT_THEME})\n"
             f"Choices: {', '.join(list_themes())}",
    )
    parser.add_argument(
        "--level", default="intermediate",
        choices=["beginner", "intermediate", "advanced", "expert"],
        help="Audience level  (default: intermediate)",
    )
    parser.add_argument(
        "--force", action="store_true",
        help="Ignore cache — regenerate everything from scratch",
    )
    parser.add_argument(
        "--batch", metavar="FILE",
        help="Text file with one subject per line (batch mode)",
    )
    parser.add_argument(
        "--output", default="output", metavar="DIR",
        help="Base output directory  (default: output)",
    )

    args = parser.parse_args()

    if args.batch:
        run_batch(
            batch_file = args.batch,
            theme      = args.theme,
            level      = args.level,
            force      = args.force,
        )
    else:
        if not args.subject:
            parser.error("subject is required (or use --batch FILE).")
        run_pipeline(
            subject = args.subject,
            base    = args.output,
            theme   = args.theme,
            level   = args.level,
            force   = args.force,
        )


if __name__ == "__main__":
    main()
