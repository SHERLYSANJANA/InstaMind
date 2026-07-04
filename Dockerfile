# =========================================================
# InstaRead — single-container Fly.io deployment
# Stage 1: build React frontend
# Stage 2: run FastAPI backend + serve the built frontend
# =========================================================

# ---------- Stage 1: build React ----------
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# Install deps first (layer caching)
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

# Copy the rest of the frontend source
COPY frontend/ ./

# Build with empty backend URL so all API calls become relative (/api/...)
# This makes the frontend work same-origin with the FastAPI server.
ENV REACT_APP_BACKEND_URL=""
ENV GENERATE_SOURCEMAP=false
ENV CI=false
RUN yarn build


# ---------- Stage 2: FastAPI backend ----------
FROM python:3.11-slim AS runtime

# System deps required by lxml / readability / pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libxml2-dev \
    libxslt-dev \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python deps
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Backend source
COPY backend/ ./

# Copy built React app into ./static (served by FastAPI)
COPY --from=frontend-builder /frontend/build ./static

ENV PORT=8080
ENV PYTHONUNBUFFERED=1
EXPOSE 8080

# Fly sets $PORT; fall back to 8080 for local docker run
CMD sh -c "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8080}"
