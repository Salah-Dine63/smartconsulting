import os
import sys
import time
import uuid
import threading
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from run import run_pipeline

app = FastAPI(title="SmartConsulting Video API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory job store: job_id -> state dict
jobs: dict[str, dict] = {}


class GenerateRequest(BaseModel):
    subject: str
    theme: str = "dark-purple"
    level: str = "intermediate"


# Time-based progress simulation (pipeline takes ~3-5 min)
_PROGRESS_TIMELINE = [
    (0,   8,   5,  "Initializing pipeline..."),
    (8,   60,  18, "Generating script with Gemini..."),
    (60,  100, 40, "Designing slides..."),
    (100, 150, 60, "Rendering slides with Playwright..."),
    (150, 200, 75, "Generating voice narration..."),
    (200, 260, 88, "Assembling video with MoviePy..."),
    (260, 360, 95, "Encoding & finalizing..."),
]


def _progress_simulator(job_id: str, stop: threading.Event):
    start = time.time()
    while not stop.is_set():
        elapsed = time.time() - start
        for t0, t1, pct, step in _PROGRESS_TIMELINE:
            if t0 <= elapsed < t1:
                jobs[job_id]["progress"] = pct
                jobs[job_id]["step"] = step
                break
        time.sleep(3)


def _run_job(job_id: str, subject: str, theme: str, level: str):
    base = f"output/{job_id}"
    jobs[job_id]["status"] = "running"

    stop_event = threading.Event()
    sim = threading.Thread(target=_progress_simulator, args=(job_id, stop_event), daemon=True)
    sim.start()

    try:
        video_path = run_pipeline(
            subject=subject,
            base=base,
            theme=theme,
            level=level,
            force=False,
        )
        stop_event.set()

        thumbnail = Path(base) / "slides" / "thumbnail.png"

        jobs[job_id].update({
            "status": "done",
            "progress": 100,
            "step": "Video ready!",
            "video_url": f"/files/{job_id}/lesson.mp4",
            "thumbnail_url": f"/files/{job_id}/thumbnail.png" if thumbnail.exists() else None,
            "_video_path": str(Path(video_path).resolve()),
            "_base": base,
        })

    except Exception as exc:
        stop_event.set()
        jobs[job_id].update({
            "status": "error",
            "step": f"Pipeline failed: {exc}",
            "error": str(exc),
        })


@app.post("/generate")
def generate(req: GenerateRequest):
    if not req.subject.strip():
        raise HTTPException(status_code=400, detail="subject cannot be empty")

    job_id = uuid.uuid4().hex[:12]
    jobs[job_id] = {
        "id": job_id,
        "subject": req.subject.strip(),
        "theme": req.theme,
        "level": req.level,
        "status": "pending",
        "progress": 0,
        "step": "Queued...",
        "video_url": None,
        "thumbnail_url": None,
        "error": None,
        "created_at": time.time(),
        "_video_path": None,
        "_base": f"output/{job_id}",
    }

    thread = threading.Thread(
        target=_run_job,
        args=(job_id, req.subject.strip(), req.theme, req.level),
        daemon=True,
    )
    thread.start()

    return {"job_id": job_id}


@app.get("/status/{job_id}")
def status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    j = jobs[job_id]
    return {
        "status": j["status"],
        "progress": j["progress"],
        "step": j["step"],
        "video_url": j["video_url"],
        "thumbnail_url": j["thumbnail_url"],
        "error": j["error"],
    }


@app.get("/files/{job_id}/{filename}")
def serve_file(job_id: str, filename: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    j = jobs[job_id]
    base = j["_base"]

    if filename == "lesson.mp4":
        # Prefer the exact path returned by run_pipeline
        raw = j.get("_video_path")
        file_path = Path(raw) if raw else Path(base) / "lesson.mp4"
    elif filename == "thumbnail.png":
        file_path = Path(base) / "slides" / "thumbnail.png"
    else:
        raise HTTPException(status_code=400, detail="Unknown file")

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found yet")

    return FileResponse(str(file_path))


@app.get("/jobs")
def list_jobs():
    return [
        {
            "id": j["id"],
            "subject": j["subject"],
            "theme": j["theme"],
            "level": j["level"],
            "status": j["status"],
            "progress": j["progress"],
            "created_at": j["created_at"],
        }
        for j in sorted(jobs.values(), key=lambda x: x["created_at"], reverse=True)
    ]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
