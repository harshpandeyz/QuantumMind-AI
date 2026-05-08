#!/usr/bin/env bash
set -euo pipefail

trap 'kill 0' EXIT

(cd backend && ./mvnw spring-boot:run) &
(cd ai-service && source venv/bin/activate && uvicorn main:app --reload --port 8000) &
(cd frontend && npm run dev) &

wait
