FROM python:3.11-slim

# Install system dependencies
# Note: chromium pulls in its own dependencies automatically
RUN apt-get update && apt-get install -y \
    gcc \
    ffmpeg \
    chromium \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user (required by some hosting platforms)
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Skip Playwright's own browser download — use system Chromium instead
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Copy source files
COPY --chown=appuser:appuser . .

# Create output directory
RUN mkdir -p output && chown -R appuser:appuser /app

USER appuser

EXPOSE 7860

CMD ["sh", "-c", "uvicorn api:app --host 0.0.0.0 --port ${PORT:-7860}"]
