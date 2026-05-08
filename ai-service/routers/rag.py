from fastapi import APIRouter

from models.schemas import RagChunk, RagSearchRequest, RagSearchResponse
from services.rag_service import search

router = APIRouter(prefix="/rag", tags=["rag"])


@router.post("/search", response_model=RagSearchResponse)
async def rag_search(request: RagSearchRequest) -> RagSearchResponse:
    results = search(request.query, request.document_ids, request.top_k)
    return RagSearchResponse(results=[RagChunk(**item) for item in results])
