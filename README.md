
Final All-in-One Floorplan App (Single deploy)

Structure:
- frontend/   -> your frontend source (if React/Vite, contains package.json)
- backend/    -> FastAPI server that serves frontend + /api/process
- Dockerfile  -> multi-stage: builds frontend then runs backend

Build & Run locally with Docker:
- docker build -t floorplan-app .
- docker run -p 8000:8000 floorplan-app
- Open http://localhost:8000

Notes:
- If frontend/package.json exists, Docker will run npm build to produce dist/
- Backend exposes /api/process (POST) and /api/download (GET)
- For accurate scaling, always send plot_width_m and plot_height_m or scale_bar info
