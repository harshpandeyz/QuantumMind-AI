import re
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    session_id: str = Field(min_length=1, max_length=100)
    message: str = Field(min_length=1, max_length=8000)
    document_ids: List[str] = Field(default_factory=list, max_length=20)
    use_rag: bool = False

    @field_validator("document_ids", mode="before")
    @classmethod
    def validate_doc_ids(cls, v):
        for doc_id in v or []:
            if not re.match(r"^[a-f0-9\-]{36}$", str(doc_id)):
                raise ValueError(f"Invalid document ID format: {doc_id}")
        return v or []


class ChatResponse(BaseModel):
    response: str
    sources: List[str] = Field(default_factory=list)


class EmbeddingDocumentRequest(BaseModel):
    document_id: str = Field(min_length=1, max_length=100)
    file_path: str = Field(min_length=1, max_length=500)


class EmbeddingDocumentResponse(BaseModel):
    document_id: str
    chunk_count: int
    status: str


class RagSearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=2000)
    document_ids: List[str] = Field(default_factory=list)
    top_k: int = Field(default=5, ge=1, le=20)


class RagChunk(BaseModel):
    document_id: str
    chunk: str
    score: float


class RagSearchResponse(BaseModel):
    results: List[RagChunk]
