FROM python:3.11-slim

# System dependencies for moviepy, playwright, ffmpeg, etc.
RUN apt-get update && apt-get install -y \
    gcc \
    ffmpeg \
    chromium \
    chromium-driver \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces requires a non-root user
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Set playwright cache path to a shared directory and install chromium
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN playwright install chromium
RUN chmod -R 755 /ms-playwright

# Copy all source files and set ownership
COPY --chown=appuser:appuser . .

# Create output directory
RUN mkdir -p output && chown -R appuser:appuser /app

USER appuser

# HF Spaces REQUIRES port 7860
EXPOSE 7860

# Start command on port 7860 or dynamic PORT
CMD ["sh", "-c", "uvicorn api:app --host 0.0.0.0 --port ${PORT:-7860}"]
