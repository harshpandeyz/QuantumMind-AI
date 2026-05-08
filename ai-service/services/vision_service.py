import base64
import os
from io import BytesIO

import httpx
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

VISION_CAPABLE_MODELS = ["gpt-4o", "gpt-4-vision", "llava", "claude", "gemini"]


def _is_vision_model() -> bool:
    model = os.getenv("LLM_MODEL", "").lower()
    return any(m in model for m in VISION_CAPABLE_MODELS)


def analyze_image_bytes(content: bytes, question: str = "") -> dict:
    image = Image.open(BytesIO(content))
    w, h = image.size
    img_type = "quantum_circuit" if w > h * 1.8 else "diagram"

    if _is_vision_model():
        b64 = base64.b64encode(content).decode()
        prompt = question or (
            "Analyze this quantum computing image in detail. "
            "Identify: (1) circuit gates and their positions, (2) qubit count and labels, "
            "(3) entanglement operations, (4) any mathematical annotations or state vectors, "
            "(5) the overall circuit purpose if determinable."
        )
        payload = {
            "model": os.getenv("LLM_MODEL", "llama3-70b-8192"),
            "messages": [{
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}},
                    {"type": "text", "text": prompt}
                ]
            }],
            "max_tokens": 800
        }
        headers = {
            "Authorization": f"Bearer {os.getenv('LLM_API_KEY')}",
            "Content-Type": "application/json"
        }
        url = (
            os.getenv("LLM_BASE_URL", "https://api.groq.com/openai").rstrip("/") +
            os.getenv("LLM_COMPLETIONS_PATH", "/v1/chat/completions")
        )
        try:
            r = httpx.post(url, json=payload, headers=headers, timeout=60)
            r.raise_for_status()
            description = r.json()["choices"][0]["message"]["content"]
        except Exception as ex:
            description = (
                f"Vision analysis failed: {ex}. "
                f"Image info: {w}x{h}px, detected as {img_type}."
            )
    else:
        description = (
            f"Image dimensions: {w}x{h}px. Detected type: {img_type}. "
            "To enable full AI circuit analysis, configure LLM_MODEL to a "
            "vision-capable model such as gpt-4o or llava in ai-service/.env."
        )

    return {
        "description": description,
        "type": img_type,
        "dimensions": f"{w}x{h}",
        "model_used": os.getenv("LLM_MODEL", "none")
    }
