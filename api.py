import uvicorn
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}

if __name__ == "__main__":
    # Run the API on port 8000
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
