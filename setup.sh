#!/usr/bin/env bash
set -euo pipefail

need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "$1 is required but was not found."
    exit 1
  fi
}

need java
need mvn
need python
need node
need npm

java -version
mvn -version
python --version
node --version

mkdir -p backend/uploads ai-service/faiss_index

(cd backend && mvn clean install -DskipTests)
(cd ai-service && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt)
(cd frontend && npm install)

echo "QuantumMind AI setup complete."
echo "Start services with: ./start.sh"
echo "Backend: http://localhost:8080"
echo "AI service: http://localhost:8000"
echo "Frontend: http://localhost:5173"
