import hashlib
import logging
import os
from typing import List

import numpy as np
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_MODEL_INSTANCE = None


def _model():
    global _MODEL_INSTANCE
    if _MODEL_INSTANCE is None:
        try:
            from sentence_transformers import SentenceTransformer
            model_name = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
            logger.info(f"[embedding_service] Loading model: {model_name}")
            _MODEL_INSTANCE = SentenceTransformer(model_name)
            logger.info("[embedding_service] Model loaded successfully")
        except Exception as exc:
            logger.warning(f"[embedding_service] WARNING: Could not load SentenceTransformer: {exc}")
            logger.warning("[embedding_service] Falling back to hash-based embeddings")
            _MODEL_INSTANCE = None
    return _MODEL_INSTANCE


def _fallback_embedding(text: str, dimensions: int = 384) -> np.ndarray:
    vector = np.zeros(dimensions, dtype="float32")
    for token in text.lower().split():
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        index = int.from_bytes(digest[:4], "little") % dimensions
        vector[index] += 1.0
    norm = np.linalg.norm(vector)
    return vector / norm if norm else vector


def embed_text(text: str) -> np.ndarray:
    logger.debug(f"[embedding_service] Embedding text of length {len(text)}")
    model = _model()
    if model is not None:
        try:
            embedding = model.encode(text, normalize_embeddings=True)
            logger.debug("[embedding_service] Text embedded successfully")
            return np.asarray(embedding, dtype="float32")
        except Exception as e:
            logger.error(f"[embedding_service] Error embedding text: {e}")
    return _fallback_embedding(text)


def embed_batch(texts: List[str]) -> List[np.ndarray]:
    if not texts:
        logger.debug("[embedding_service] Empty batch provided")
        return []
    
    logger.debug(f"[embedding_service] Embedding batch of {len(texts)} texts")
    model = _model()
    if model is not None:
        try:
            embeddings = model.encode(texts, normalize_embeddings=True)
            logger.debug("[embedding_service] Batch embedded successfully")
            return [np.asarray(item, dtype="float32") for item in embeddings]
        except Exception as e:
            logger.error(f"[embedding_service] Error embedding batch: {e}")
    
    logger.debug("[embedding_service] Using fallback embeddings for batch")
    return [_fallback_embedding(text) for text in texts]

