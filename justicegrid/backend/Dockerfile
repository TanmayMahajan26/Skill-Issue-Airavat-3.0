FROM python:3.11-slim

WORKDIR /app

# Install backend deps
COPY requirements.txt ./backend_requirements.txt
RUN pip install --no-cache-dir -r backend_requirements.txt

# Install AI deps
COPY ai/requirements.txt ./ai_requirements.txt
RUN pip install --no-cache-dir -r ai_requirements.txt

# Copy source
COPY app/ ./app/
COPY ai/ ./ai/
COPY seed/ ./seed/
# Environment
ENV PORT=8000
ENV PYTHONPATH=/app

# Run
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
