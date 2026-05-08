# QuantumMind AI

AI-Powered Multimodal Quantum Research Intelligence Platform

## Quick Start - Docker (Recommended)

```bash
git clone <your-repository-url>
cd quantummind
cp .env.example .env
cp ai-service/.env.example ai-service/.env
docker compose up --build
```

Before starting Docker, edit `.env` and set `DB_PASSWORD` and `JWT_SECRET`. Generate a strong JWT secret with:

```bash
openssl rand -hex 32
```

Then edit `ai-service/.env` and set `LLM_API_KEY` to the same provider key you want the AI service to use.

Open `http://localhost` and register at `http://localhost/register`.

## Local Development (Without Docker)

Prerequisites:

- Java 17
- Maven
- Python 3.11
- Node 20
- PostgreSQL 16 with a `quantummind` database

Run:

```bash
./setup.sh
./start.sh
```

Local URLs:

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:8080` |
| AI service | `http://localhost:8000` |
| AI service API docs | `http://localhost:8000/docs` |

## Environment Variables

| Variable | File | Description |
| --- | --- | --- |
| `DB_PASSWORD` | `.env` | PostgreSQL password |
| `JWT_SECRET` | `.env` | Min 64 chars (`openssl rand -hex 32`) |
| `LLM_API_KEY` | `ai-service/.env` | Groq, OpenAI, or Sarvam key |
| `LLM_BASE_URL` | `ai-service/.env` | Default: `https://api.groq.com/openai` |
| `LLM_MODEL` | `ai-service/.env` | Default: `llama3-70b-8192` (use `gpt-4o` for vision) |
| `CORS_ALLOWED_ORIGINS` | `.env` | Default: `http://localhost` |

## Features

- Semantic RAG search over uploaded research PDFs
- Conversational AI with multi-turn session history
- Real-time token streaming (SSE)
- Vision AI for quantum circuit image analysis
- JWT authentication with role-based access
- FAISS vector index with sentence-transformers embeddings
- Analytics dashboard with charts
- Docker-first deployment (4 containers, single command)

## API Reference

### Backend

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register user and return JWT |
| `POST` | `/api/auth/login` | Authenticate and return JWT |
| `GET` | `/api/auth/me` | Return authenticated user |
| `POST` | `/api/chat/sessions` | Create chat session |
| `GET` | `/api/chat/sessions` | List user sessions |
| `GET` | `/api/chat/sessions/{id}/messages` | List session messages |
| `POST` | `/api/chat/sessions/{id}/messages` | Send message to AI |
| `GET` | `/api/chat/sessions/{id}/stream` | Stream a chat response with SSE |
| `POST` | `/api/documents/upload` | Upload PDF |
| `GET` | `/api/documents` | List documents |
| `DELETE` | `/api/documents/{id}` | Delete document |
| `GET` | `/api/documents/{id}/summary` | Read document summary |
| `GET` | `/api/analytics/summary` | Dashboard analytics |
| `GET` | `/actuator/health` | Backend health check |

### AI Service

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | AI service health check |
| `POST` | `/chat` | LLM chat with optional RAG |
| `POST` | `/chat/stream` | Stream LLM output from the AI service |
| `POST` | `/embeddings/document` | Extract, chunk, embed, and index a PDF |
| `POST` | `/rag/search` | Search indexed chunks |
| `POST` | `/vision/analyze` | Analyze uploaded circuit or diagram image |

## Architecture

```text
React + nginx (:80)
        |
        v
Spring Boot API (:8080) ---- PostgreSQL (:5432)
        |
        v
FastAPI AI Service (:8000) ---- FAISS volume
```

## Running Tests

Backend:

```bash
cd backend
mvn test
```

AI service:

```bash
cd ai-service
pip install pytest
pytest tests/ -v
```

## Troubleshooting

- "AI service unavailable": check `LLM_API_KEY` in `ai-service/.env`; run `docker logs ai-service`.
- Documents stuck `PROCESSING`: ai-service takes about 90s to load the embedding model on first start.
- Port 80 in use: change `"80:80"` to `"8181:80"` in `docker-compose.yml`.
- Vision returns no AI analysis: set `LLM_MODEL=gpt-4o` with a vision-capable provider.
- Java OOM: already handled with `-Xmx512m` in `backend/Dockerfile`.

## License
harsh
