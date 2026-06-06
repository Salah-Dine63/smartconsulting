FROM python:3.11-slim

# System dependencies for moviepy, playwright, etc.
RUN apt-get update && apt-get install -y \
    gcc \
    ffmpeg \
    chromium \
    chromium-driver \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Set playwright to use system chromium
ENV PLAYWRIGHT_BROWSERS_PATH=/usr/bin

WORKDIR /app

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install playwright chromium
RUN playwright install chromium || true

# Copy all source files
COPY . .

# Create output directory
RUN mkdir -p output

# Expose port
EXPOSE 8000

# Start command
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
