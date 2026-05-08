import re
from typing import List


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    clean = re.sub(r"\s+", " ", text).strip()
    if not clean:
        return []
    sentences = re.split(r"(?<=[.!?])\s+", clean)
    chunks: List[str] = []
    current: List[str] = []
    current_len = 0
    for sentence in sentences:
        words = sentence.split()
        if current and current_len + len(words) > chunk_size:
            chunks.append(" ".join(current))
            current = current[-overlap:] if overlap > 0 else []
            current_len = len(current)
        current.extend(words)
        current_len += len(words)
    if current:
        chunks.append(" ".join(current))
    return chunks
