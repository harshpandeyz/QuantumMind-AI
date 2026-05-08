# QuantumMind AI Agent Notes

## Architecture

QuantumMind AI is split into four runtime services:

- `backend/`: Spring Boot API for auth, documents, chat sessions, analytics, persistence, and proxying calls to the AI service.
- `ai-service/`: FastAPI service for LLM chat, streaming, embeddings, RAG search, PDF extraction, and vision analysis.
- `frontend/`: React + Vite UI served locally by Vite or in Docker by nginx.
- `db`: PostgreSQL 16 for relational data. FAISS data is stored in the `faiss_data` Docker volume or `ai-service/faiss_index` locally.

## Runtime Versions

- Java 17
- Spring Boot 3.2
- Python 3.11 in Docker
- Node 20
- PostgreSQL 16

## Environment

Never hardcode secrets. Use:

- Root `.env` for `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, and `CORS_ALLOWED_ORIGINS`.
- `ai-service/.env` for `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_COMPLETIONS_PATH`, `LLM_MODEL`, `EMBEDDING_MODEL`, `FAISS_INDEX_PATH`, and `UPLOAD_DIR`.
- `frontend/.env` only for local Vite overrides such as `VITE_API_URL` and `VITE_AI_URL`.

## Run Commands

Backend:

```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

AI service:

```powershell
cd ai-service
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Docker:

```powershell
Copy-Item .env.example .env
Copy-Item ai-service/.env.example ai-service/.env
docker compose up --build
```

## Implementation Notes

- Keep controllers thin; put business logic in services.
- Keep backend DTOs aligned with frontend API helpers.
- Keep AI service schemas in `ai-service/models/schemas.py`.
- The frontend is React 18 + Vite. Do not add Next.js unless the architecture is intentionally changed everywhere.
- On Windows, prefer `setup.ps1`, `start.ps1`, and `backend\mvnw.cmd`; do not assume Bash or a global Maven install.
- Do not commit `node_modules`, `dist`, `target`, `__pycache__`, `.pytest_cache`, FAISS indexes, uploads, or local `.env` files.
