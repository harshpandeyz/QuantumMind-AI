import logging
import os
from typing import List, Dict
import asyncio

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Retry configuration
MAX_RETRIES = 3
RETRY_DELAY = 1.0  # seconds


async def chat_completion(messages: List[Dict[str, str]], stream: bool = False) -> str:
    api_key = os.getenv("LLM_API_KEY", "")
    base_url = os.getenv("LLM_BASE_URL", "https://api.groq.com/openai").rstrip("/")
    completions_path = os.getenv("LLM_COMPLETIONS_PATH", "/v1/chat/completions")
    model = os.getenv("LLM_MODEL", "llama3-70b-8192")
    
    if not api_key:
        logger.error("[llm_service] LLM_API_KEY is not configured")
        raise RuntimeError("LLM_API_KEY is not configured")

    payload = {"model": model, "messages": messages, "stream": stream}
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    timeout = httpx.Timeout(120.0, connect=30.0)
    
    url = f"{base_url}{completions_path}"
    logger.info(f"[llm_service] Calling LLM endpoint: {base_url}{completions_path}, model={model}")
    
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                
            logger.info(f"[llm_service] LLM response successful (attempt {attempt + 1}/{MAX_RETRIES})")
            try:
                return data["choices"][0]["message"]["content"]
            except (KeyError, IndexError, TypeError) as e:
                logger.warning(f"[llm_service] Could not parse LLM response: {e}")
                return str(data)
                
        except asyncio.TimeoutError as e:
            last_error = e
            logger.warning(f"[llm_service] Timeout on attempt {attempt + 1}/{MAX_RETRIES}: {e}")
            if attempt < MAX_RETRIES - 1:
                await asyncio.sleep(RETRY_DELAY)
                
        except httpx.HTTPError as e:
            last_error = e
            logger.error(f"[llm_service] HTTP error on attempt {attempt + 1}/{MAX_RETRIES}: {e}")
            if attempt < MAX_RETRIES - 1:
                await asyncio.sleep(RETRY_DELAY)
                
        except Exception as e:
            last_error = e
            logger.error(f"[llm_service] Unexpected error on attempt {attempt + 1}/{MAX_RETRIES}: {e}")
            if attempt < MAX_RETRIES - 1:
                await asyncio.sleep(RETRY_DELAY)
    
    logger.error(f"[llm_service] All {MAX_RETRIES} retries failed. Last error: {last_error}")
    raise RuntimeError(f"LLM service failed after {MAX_RETRIES} attempts: {last_error}")
