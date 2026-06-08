FROM python:3.11-slim

# System dependencies for moviepy, playwright, ffmpeg, chromium, etc.
RUN apt-get update && apt-get install -y \
    gcc \
    ffmpeg \
    chromium \
    chromium-driver \
    fonts-liberation \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces requires a non-root user
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Tell Playwright to skip downloading its own browser
# and point it to the system-installed Chromium instead
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium

# Copy all source files and set ownership
COPY --chown=appuser:appuser . .

# Create output directory
RUN mkdir -p output && chown -R appuser:appuser /app

USER appuser

# Expose port (Railway injects $PORT, HF Spaces uses 7860)
EXPOSE 7860

# Start command — listens on Railway's $PORT or falls back to 7860
CMD ["sh", "-c", "uvicorn api:app --host 0.0.0.0 --port ${PORT:-7860}"]
