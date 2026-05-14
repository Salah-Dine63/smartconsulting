import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = """You are an expert educational content creator.
Your job is to generate a structured lesson script for a professor-style educational video.

Rules:
- ALWAYS write everything in English — titles, bullets, and narration — regardless of the subject language
- Return ONLY raw JSON, no markdown, no backticks, no explanation, no comments
- Generate exactly 5 to 7 slides
- Each narration should be 3 to 5 sentences, clear and engaging, like a real professor speaking
- Bullets should be short (max 8 words each), 3 to 4 bullets per slide
- The first slide is always an introduction, the last is always a summary
- Adapt the language level to the audience specified in the subject

Visual & content rules:
- Add a "visual" field to every slide — choose the single best match from this list:
    MATH:     matrix, vector, graph, formula
    AI/ML:    neural, ai, brain
    DATA:     chart, statistics
    FINANCE:  finance, stock, trend
    PHYSICS:  wave, signal, circuit
    CS/CODE:  tree, flow
    OTHER:    none
- Add an "equations" array (1-2 LaTeX strings) only for math/physics/engineering slides, else []
  LaTeX rules: use \\frac, Greek letters, x^{2}, x_{n}, \\sum, \\int, \\vec{v}, \\mathbf{A}
  Do NOT use \\begin{matrix} or any multi-line environments
- Add a "code" field (string or null) with a SHORT runnable snippet (max 10 lines) for programming,
  AI, data-science, or any topic where code makes the concept concrete
  Use null if the topic does not benefit from code

JSON format to return:
{
  "title": "Lesson title",
  "subject": "original subject string",
  "slides": [
    {
      "slide_number": 1,
      "title": "Slide title",
      "bullets": ["point 1", "point 2", "point 3"],
      "narration": "Full paragraph the professor says out loud for this slide.",
      "equations": ["\\vec{v} = (v_1, v_2, \\ldots, v_n)"],
      "visual": "vector",
      "code": null
    }
  ]
}"""

def generate_script(subject: str, level: str = "intermediate") -> dict:

    model = genai.GenerativeModel(
        "gemini-2.5-flash",
        system_instruction=SYSTEM_PROMPT
    )

    level_hint = {
        "beginner":     "Use simple everyday language, avoid jargon, lots of analogies.",
        "intermediate": "Assume basic familiarity; explain concepts clearly with examples.",
        "advanced":     "Assume strong background; go deep, use precise terminology.",
        "expert":       "Peer-level depth; include edge cases, nuances, and current research.",
    }.get(level, "Assume basic familiarity; explain concepts clearly with examples.")

    print(f"Generating script for: '{subject}'  [level: {level}] ...")

    response = model.generate_content(
        f"Create a lesson script for the following subject: {subject}\n"
        f"Audience level: {level} — {level_hint}"
    )

    raw = response.text.strip()

    if raw.startswith("```json"):
        raw = raw.replace("```json", "").replace("```", "").strip()
    elif raw.startswith("```"):
        raw = raw.replace("```", "").strip()

    try:
        script = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini returned invalid JSON: {e}\n\nRaw output:\n{raw}")

    if "slides" not in script:
        raise ValueError(f"Invalid JSON structure. Missing 'slides'. Raw output:\n{raw}")

    print(f"Script generated: {len(script['slides'])} slides")
    return script


def save_script(script: dict, output_path: str = "output/script.json"):
    """Save the script dict to a JSON file."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(script, f, indent=2, ensure_ascii=False)
    print(f"Script saved to: {output_path}")


if __name__ == "__main__":
    import sys

    subject = sys.argv[1] if len(sys.argv) > 1 else "LLMs, Enginnering"

    script = generate_script(subject)
    save_script(script)

    print("\n--- Preview ---")
    print(f"Title : {script['title']}")
    for slide in script["slides"]:
        print(f"\nSlide {slide['slide_number']}: {slide['title']}")
        for b in slide["bullets"]:
            print(f"  • {b}")
        print(f"  Narration: {slide['narration'][:80]}...")