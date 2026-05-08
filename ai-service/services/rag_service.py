import json
import os
from pathlib import Path
from typing import Dict, List, Optional

import numpy as np
from dotenv import load_dotenv

from services.embedding_service import embed_text

load_dotenv()

try:
    import faiss
except Exception:
    faiss = None

INDEX = None
METADATA: List[Dict[str, str]] = []
DIMENSIONS = 384


def _paths():
    root = Path(os.getenv("FAISS_INDEX_PATH", "./faiss_index"))
    root.mkdir(parents=True, exist_ok=True)
    return root / "index.faiss", root / "metadata.json"


def initialize_index() -> None:
    global INDEX, METADATA
    index_path, metadata_path = _paths()
    METADATA = json.loads(metadata_path.read_text(encoding="utf-8")) if metadata_path.exists() else []
    if faiss is not None and index_path.exists():
        INDEX = faiss.read_index(str(index_path))
    elif faiss is not None:
        INDEX = faiss.IndexFlatIP(DIMENSIONS)
        faiss.write_index(INDEX, str(index_path))
    else:
        INDEX = []
    _save_metadata()


def _save_metadata() -> None:
    index_path, metadata_path = _paths()
    metadata_path.write_text(json.dumps(METADATA, indent=2), encoding="utf-8")
    if faiss is not None and INDEX is not None:
        faiss.write_index(INDEX, str(index_path))


def add_document(doc_id: str, chunks: List[str], embeddings: List[np.ndarray]) -> None:
    global INDEX, METADATA
    if INDEX is None:
        initialize_index()
    if not chunks:
        return
    records = [{"document_id": doc_id, "chunk": chunk} for chunk in chunks]
    if faiss is not None:
        matrix = np.vstack(embeddings).astype("float32")
        INDEX.add(matrix)
    else:
        for record, embedding in zip(records, embeddings):
            record["embedding"] = embedding.tolist()
    METADATA.extend(records)
    _save_metadata()


def search(query: str, document_ids: Optional[List[str]] = None, top_k: int = 5) -> List[Dict[str, object]]:
    if INDEX is None:
        initialize_index()
    if not METADATA:
        return []
    doc_filter = set(document_ids or [])
    query_vector = embed_text(query).astype("float32")
    results: List[Dict[str, object]] = []
    if faiss is not None and hasattr(INDEX, "ntotal") and INDEX.ntotal > 0:
        scores, indexes = INDEX.search(np.expand_dims(query_vector, axis=0), min(top_k * 4, INDEX.ntotal))
        for score, idx in zip(scores[0], indexes[0]):
            if idx < 0 or idx >= len(METADATA):
                continue
            record = METADATA[idx]
            if doc_filter and record["document_id"] not in doc_filter:
                continue
            results.append({"document_id": record["document_id"], "chunk": record["chunk"], "score": float(score)})
            if len(results) >= top_k:
                break
    else:
        for record in METADATA:
            if doc_filter and record["document_id"] not in doc_filter:
                continue
            score = float(np.dot(query_vector, np.asarray(record.get("embedding", []), dtype="float32")))
            results.append({"document_id": record["document_id"], "chunk": record["chunk"], "score": score})
        results.sort(key=lambda item: item["score"], reverse=True)
        results = results[:top_k]
    return results


def build_rag_prompt(query: str, context_chunks: List[Dict[str, object]]) -> str:
    context = "\n\n".join(
        f"Source document {item['document_id']}:\n{item['chunk']}" for item in context_chunks
    )
    return (
        "Use the retrieved research context to answer precisely. "
        "Cite source document ids when relevant.\n\n"
        f"Context:\n{context or 'No context retrieved.'}\n\nQuestion: {query}"
    )
