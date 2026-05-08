from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from services.vision_service import analyze_image_bytes

router = APIRouter(prefix="/vision", tags=["vision"])


@router.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    question: Optional[str] = Form(None),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are supported")
    try:
        content = await file.read()
        return analyze_image_bytes(content, question or "")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
