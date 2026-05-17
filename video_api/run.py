import os
import json
from pathlib import Path

from Script_Gen import generate_script, save_script
from Slide_gen import generate_slides
from main import assemble_video

def generate_audio(script_path: str, audio_dir: str):
    os.makedirs(audio_dir, exist_ok=True)
    with open(script_path, "r", encoding="utf-8") as f:
        script = json.load(f)
    
    try:
        from gtts import gTTS
        has_tts = True
    except ImportError:
        try:
            import edge_tts
            has_tts = False
        except ImportError:
            has_tts = False

    for slide in script.get("slides", []):
        num = slide["slide_number"]
        audio_path = os.path.join(audio_dir, f"audio_{num:03d}.mp3")
        if os.path.exists(audio_path):
            continue
            
        text = slide.get("narration", "Slide content")
        
        if has_tts:
            try:
                tts = gTTS(text=text, lang='en')
                tts.save(audio_path)
                continue
            except Exception as e:
                print(f"gTTS failed: {e}")
                
        # Fallback to generating silent audio using moviepy
        print(f"Generating silent audio for slide {num}...")
        from moviepy.audio.AudioClip import AudioArrayClip
        import numpy as np
        duration = max(5.0, len(text) / 15.0) # approx 15 chars per sec
        fps = 44100
        frames = int(duration * fps)
        silence = AudioArrayClip(np.zeros((frames, 2), dtype=np.float32), fps=fps)
        silence.write_audiofile(audio_path, fps=fps, logger=None)

def run_pipeline(subject: str, base: str, theme: str = "dark-purple", level: str = "intermediate", force: bool = False):
    os.makedirs(base, exist_ok=True)
    script_path = os.path.join(base, "script.json")
    slides_dir = os.path.join(base, "slides")
    audio_dir = os.path.join(base, "audio")
    output_video = os.path.join(base, "lesson.mp4")

    if force or not os.path.exists(script_path):
        print(f"Generating script for {subject}...")
        script = generate_script(subject, level)
        save_script(script, script_path)

    if force or not os.path.exists(os.path.join(slides_dir, "slide_001.png")):
        print("Generating slides...")
        generate_slides(script_path=script_path, output_dir=slides_dir, theme=theme)

    print("Generating audio...")
    generate_audio(script_path, audio_dir)

    if force or not os.path.exists(output_video):
        print("Assembling video...")
        assemble_video(slides_dir=slides_dir, audio_dir=audio_dir, output_path=output_video, script_path=script_path)

    return output_video

if __name__ == "__main__":
    run_pipeline("Python basics", "output/test", force=True)
