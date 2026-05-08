import json
import logging
import os
from typing import Dict, List

import httpx
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from models.schemas import ChatRequest, ChatResponse
from services.llm_service import chat_completion
from services.rag_service import build_rag_prompt, search

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])

SYSTEM_PROMPT = (
    "You are QuantumMind AI, a rigorous multimodal quantum research assistant. "
    "Explain assumptions, highlight uncertainty, preserve mathematical precision, "
    "and help researchers reason about papers, experiments, circuits, algorithms, and datasets."
)

# Conversation history: maps session_id to list of messages
_conversation_history: Dict[str, List[Dict[str, str]]] = {}

MAX_HISTORY_TURNS = 10


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    logger.info(f"[chat] New chat request - use_rag={request.use_rag}, documents={len(request.document_ids or [])}")
    
    sources = []
    user_prompt = request.message
    
    try:
        # Get or initialize conversation history for this session
        session_id = getattr(request, 'session_id', 'default')
        if session_id not in _conversation_history:
            _conversation_history[session_id] = []
        
        history = _conversation_history[session_id]
        
        # Apply RAG if enabled
        if request.use_rag and request.document_ids:
            logger.info(f"[chat] Searching documents: {request.document_ids}")
            chunks = search(request.message, request.document_ids, top_k=5)
            sources = list(set([item["document_id"] for item in chunks]))
            user_prompt = build_rag_prompt(request.message, chunks)
            logger.info(f"[chat] RAG prompt built with {len(chunks)} chunks from {len(sources)} documents")
        
        # Build messages with system prompt + history + current message
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
        ]
        
        # Add conversation history (keep last N turns to avoid token overflow)
        messages.extend(history[-2*MAX_HISTORY_TURNS:])
        
        # Add current user message
        messages.append({"role": "user", "content": user_prompt})
        
        logger.info(f"[chat] Calling LLM with {len(messages)} messages (including history)")
        
        response_text = await chat_completion(messages)
        
        # Store messages in history
        history.append({"role": "user", "content": request.message})  # Store original message, not RAG-modified one
        history.append({"role": "assistant", "content": response_text})
        
        # Limit history size
        if len(history) > 2 * MAX_HISTORY_TURNS:
            history[:] = history[-2*MAX_HISTORY_TURNS:]
        
        logger.info(f"[chat] Response generated successfully - {len(response_text)} chars")
        return ChatResponse(response=response_text, sources=sources)
        
    except Exception as exc:
        logger.error(f"[chat] Error in chat: {exc}", exc_info=True)
        error_msg = str(exc)
        # Return a graceful error as a response instead of crashing
        return ChatResponse(
            response=f"The AI service encountered an error: {error_msg}. Please check your LLM API configuration in ai-service/.env",
            sources=[]
        )


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """Streaming SSE endpoint that emits tokens as they arrive from the LLM."""

    async def generate():
        sources = []
        user_prompt = request.message

        if request.use_rag and request.document_ids:
            chunks = search(request.message, request.document_ids, top_k=5)
            sources = list(set(c["document_id"] for c in chunks))
            user_prompt = build_rag_prompt(request.message, chunks)

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]

        api_key = os.getenv("LLM_API_KEY", "")
        base_url = os.getenv("LLM_BASE_URL", "https://api.groq.com/openai").rstrip("/")
        path = os.getenv("LLM_COMPLETIONS_PATH", "/v1/chat/completions")
        model = os.getenv("LLM_MODEL", "llama3-70b-8192")
        url = f"{base_url}{path}"

        if not api_key:
            yield f"data: {json.dumps({'error': 'LLM_API_KEY is not configured'})}\n\n"
            yield f"data: {json.dumps({'done': True, 'sources': sources})}\n\n"
            return

        payload = {"model": model, "messages": messages, "stream": True}
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=120) as client:
                async with client.stream("POST", url, json=payload, headers=headers) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        if line.startswith("data: ") and line.strip() != "data: [DONE]":
                            try:
                                data = json.loads(line[6:])
                                token = (data.get("choices", [{}])[0]
                                             .get("delta", {})
                                             .get("content", ""))
                                if token:
                                    yield f"data: {json.dumps({'token': token})}\n\n"
                            except Exception:
                                continue
        except Exception as ex:
            yield f"data: {json.dumps({'error': str(ex)})}\n\n"

        yield f"data: {json.dumps({'done': True, 'sources': sources})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
