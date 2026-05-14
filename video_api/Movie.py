import os
import json
import asyncio
import edge_tts

VOICE = "en-US-AndrewNeural"
RATE  = "-8%"   # slightly slower = clearer and more professor-like
PITCH = "+0Hz"  # keep natural pitch


async def text_to_audio(text: str, output_path: str):
    communicate = edge_tts.Communicate(text=text, voice=VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(output_path)


async def generate_all_audio(script_path: str, output_dir: str):
    with open(script_path, "r", encoding="utf-8") as f:
        script = json.load(f)

    os.makedirs(output_dir, exist_ok=True)

    slides = script["slides"]
    total  = len(slides)

    print(f"Generating audio for {total} slides  |  voice: {VOICE}  rate: {RATE}")
    print(f"Lesson: {script['title']}\n")

    pending = []
    for slide in slides:
        num      = slide["slide_number"]
        out_path = os.path.join(output_dir, f"audio_{num:03d}.mp3")
        if os.path.exists(out_path):
            print(f"  Skipping audio_{num:03d}.mp3 (cached)")
            continue
        print(f"  Queuing slide {num}/{total}...")
        pending.append((num, slide["narration"], out_path))

    if pending:
        await asyncio.gather(*[
            text_to_audio(narration, out_path)
            for _, narration, out_path in pending
        ])
        for num, _, _ in pending:
            print(f"  Done: audio_{num:03d}.mp3")

    print(f"\nAll audio files saved to: {output_dir}")


def generate_voice(
    script_path: str = "output/script.json",
    output_dir:  str = "output/audio"
):
    asyncio.run(generate_all_audio(script_path, output_dir))


if __name__ == "__main__":
    generate_voice()
