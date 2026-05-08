import logging
from fastapi import APIRouter, HTTPException

from models.schemas import EmbeddingDocumentRequest, EmbeddingDocumentResponse
from services.embedding_service import embed_batch
from services.rag_service import add_document
from utils.chunker import chunk_text
from utils.pdf_extractor import extract_text

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/embeddings", tags=["embeddings"])


@router.post("/document", response_model=EmbeddingDocumentResponse)
async def embed_document(request: EmbeddingDocumentRequest) -> EmbeddingDocumentResponse:
    logger.info(f"[embeddings] Processing document: {request.document_id} from {request.file_path}")
    
    try:
        logger.debug(f"[embeddings] Extracting text from PDF: {request.file_path}")
        text = extract_text(request.file_path)
        logger.debug(f"[embeddings] Extracted {len(text)} characters from PDF")
        
        logger.debug(f"[embeddings] Chunking text into logical pieces")
        chunks = chunk_text(text)
        logger.info(f"[embeddings] Created {len(chunks)} chunks from document")
        
        logger.debug(f"[embeddings] Embedding {len(chunks)} chunks")
        embeddings = embed_batch(chunks)
        logger.debug(f"[embeddings] Generated embeddings for {len(embeddings)} chunks")
        
        logger.debug(f"[embeddings] Adding document to FAISS index")
        add_document(request.document_id, chunks, embeddings)
        logger.info(f"[embeddings] Document {request.document_id} successfully indexed with {len(chunks)} chunks")
        
        return EmbeddingDocumentResponse(document_id=request.document_id, chunk_count=len(chunks), status="completed")
        
    except Exception as exc:
        logger.error(f"[embeddings] Error processing document {request.document_id}: {exc}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
