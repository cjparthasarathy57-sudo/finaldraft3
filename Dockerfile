
# Stage 1 - build frontend (if package.json exists)
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN if [ -f package.json ]; then npm install --legacy-peer-deps; else echo "no package.json"; fi
COPY frontend/ .
RUN if [ -f package.json ]; then npm run build; else mkdir -p dist && cp -r . dist || true; fi

# Stage 2 - backend image
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y build-essential libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt
# Copy backend and built frontend dist
COPY backend /app/backend
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist
ENV PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
