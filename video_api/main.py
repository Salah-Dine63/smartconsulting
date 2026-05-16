import os
import math
import json
import numpy as np
from moviepy import (
    ImageClip, AudioFileClip, AudioArrayClip,
    concatenate_videoclips, CompositeAudioClip,
)
from moviepy.video.fx import FadeIn, FadeOut
from moviepy.audio.fx import AudioFadeIn, AudioFadeOut, MultiplyVolume

FADE      = 0.35   # seconds — fade in/out on every clip
INTRO_DUR = 4.0    # seconds — title card hold time
OUTRO_DUR = 5.0    # seconds — end card hold time


def _silence(duration: float, fps: int = 44100) -> AudioArrayClip:
    frames = int(duration * fps)
    return AudioArrayClip(np.zeros((frames, 2), dtype=np.float32), fps=fps)


def assemble_video(
    slides_dir:  str = "output/slides",
    audio_dir:   str = "output/audio",
    output_path: str = "output/lesson.mp4",
    script_path: str = "output/script.json",
):
    if os.path.exists(output_path):
        print(f"Skipping video assembly (cached): {output_path}")
        return

    with open(script_path, "r", encoding="utf-8") as f:
        script = json.load(f)

    total = len(script["slides"])
    clips = []

    print(f"Assembling: {script['title']}")
    print(f"Slides: {total}\n")

    # ── Intro ──────────────────────────────────
    intro_path = os.path.join(slides_dir, "intro.png")
    if os.path.exists(intro_path):
        clip = (ImageClip(intro_path, duration=INTRO_DUR)
                .with_audio(_silence(INTRO_DUR))
                .with_effects([FadeIn(FADE), FadeOut(FADE)]))
        clips.append(clip)
        print(f"  Intro      — {INTRO_DUR}s")

    # ── Content slides ─────────────────────────
    for slide in script["slides"]:
        num        = slide["slide_number"]
        slide_path = os.path.join(slides_dir, f"slide_{num:03d}.png")
        audio_path = os.path.join(audio_dir,  f"audio_{num:03d}.mp3")

        if not os.path.exists(slide_path):
            raise FileNotFoundError(f"Missing slide: {slide_path}")
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Missing audio: {audio_path}")

        audio = (AudioFileClip(audio_path)
                 .with_effects([AudioFadeIn(FADE), AudioFadeOut(FADE)]))
        clip  = (ImageClip(slide_path, duration=audio.duration)
                 .with_effects([FadeIn(FADE), FadeOut(FADE)])
                 .with_audio(audio))

        print(f"  Slide {num:02d}/{total} — {audio.duration:.1f}s")
        clips.append(clip)

        # Export individual slide video for the frontend module parts
        part_path = os.path.join(os.path.dirname(output_path), f"part_{num:03d}.mp4")
        if not os.path.exists(part_path):
            os.makedirs(os.path.dirname(part_path), exist_ok=True)
            clip.write_videofile(
                part_path,
                fps=1,
                codec="libx264",
                audio_codec="aac",
                logger=None
            )

    # ── Outro ──────────────────────────────────
    outro_path = os.path.join(slides_dir, "outro.png")
    if os.path.exists(outro_path):
        clip = (ImageClip(outro_path, duration=OUTRO_DUR)
                .with_audio(_silence(OUTRO_DUR))
                .with_effects([FadeIn(FADE), FadeOut(FADE)]))
        clips.append(clip)
        print(f"  Outro      — {OUTRO_DUR}s")

    # ── Concatenate ────────────────────────────
    print("\nConcatenating clips...")
    final = concatenate_videoclips(clips, method="compose")

    # ── Background music (optional) ────────────
    music_path = "assets/music.mp3"
    if os.path.exists(music_path):
        try:
            music  = AudioFileClip(music_path)
            m_fps  = int(music.fps)
            frames = music.to_soundarray(fps=m_fps)

            if frames.ndim == 1:
                frames = np.column_stack([frames, frames])

            need   = math.ceil(final.duration * m_fps)
            tiled  = np.tile(frames, (math.ceil(need / len(frames)), 1))[:need]
            bg     = AudioArrayClip((tiled * 0.10).astype(np.float32), fps=m_fps)

            final  = final.with_audio(CompositeAudioClip([final.audio, bg]))
            music.close()
            print("  Background music mixed in at 10% volume.")
        except Exception as e:
            print(f"  Warning: could not mix music — {e}")
    else:
        print("  Tip: drop an MP3 at assets/music.mp3 to add background music.")

    # ── Export ─────────────────────────────────
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    print(f"\nExporting → {output_path}")
    final.write_videofile(
        output_path,
        fps=1,
        codec="libx264",
        audio_codec="aac",
        logger="bar"
    )

    total_dur = sum(c.duration for c in clips)
    print(f"\nDone!  Total length: {total_dur:.1f}s  |  Saved: {output_path}")


if __name__ == "__main__":
    assemble_video()
