import logging
import os
import time
from contextlib import asynccontextmanager
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from routers import chat, embeddings, rag, vision
from services.rag_service import initialize_index

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        logger.info("[startup] Initializing FAISS index...")
        initialize_index()
        logger.info("[startup] FAISS index initialized successfully")
    except Exception as exc:
        logger.warning(f"[startup] WARNING: Could not initialize FAISS index: {exc}")
    yield
    logger.info("[shutdown] AI Service shutting down")


app = FastAPI(
    title="QuantumMind AI Service",
    description="LLM, RAG, embeddings, and vision service for QuantumMind AI.",
    version="1.0.0",
    lifespan=lifespan,
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

_allowed_origins = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost,http://localhost:5173").split(",")
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    request_id = f"{datetime.now().isoformat()}_{request.url.path}"

    logger.info(f"[{request_id}] {request.method} {request.url.path} started")

    try:
        response = await call_next(request)
        duration = time.time() - start_time
        logger.info(
            f"[{request_id}] {request.method} {request.url.path} completed in "
            f"{duration:.2f}s with status {response.status_code}"
        )
        return response
    except Exception as exc:
        duration = time.time() - start_time
        logger.error(
            f"[{request_id}] {request.method} {request.url.path} failed after {duration:.2f}s: {exc}",
            exc_info=True,
        )
        raise


app.include_router(chat.router)
app.include_router(embeddings.router)
app.include_router(rag.router)
app.include_router(vision.router)


@app.get("/health")
async def health():
    logger.debug("Health check requested")
    return {"status": "ok"}
