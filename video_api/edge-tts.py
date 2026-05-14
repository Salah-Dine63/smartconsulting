import os
import json
import asyncio
import edge_tts

VOICE = "en-US-GuyNeural"


async def text_to_audio(text: str, output_path: str):
    """Convert a single narration text to an MP3 file."""
    communicate = edge_tts.Communicate(text=text, voice=VOICE)
    await communicate.save(output_path)


async def generate_all_audio(script_path: str, output_dir: str):
    """Read script JSON and generate one MP3 per slide."""
    with open(script_path, "r", encoding="utf-8") as f:
        script = json.load(f)

    os.makedirs(output_dir, exist_ok=True)

    slides = script["slides"]
    total  = len(slides)

    print(f"Generating audio for {total} slides using voice: {VOICE}")
    print(f"Lesson: {script['title']}\n")

    for slide in slides:
        num       = slide["slide_number"]
        narration = slide["narration"]
        out_path  = os.path.join(output_dir, f"audio_{num:03d}.mp3")

        print(f"  Slide {num}/{total}: generating audio...")
        await text_to_audio(narration, out_path)
        print(f"  Saved: audio_{num:03d}.mp3")

    print(f"\nAll audio files saved to: {output_dir}")


def generate_voice(
    script_path: str = "output/script.json",
    output_dir:  str = "output/audio"
):
    """Main entry point — runs the async audio generation."""
    asyncio.run(generate_all_audio(script_path, output_dir))


if __name__ == "__main__":
    generate_voice()