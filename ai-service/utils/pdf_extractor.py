from pathlib import Path


def extract_text(file_path: str) -> str:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"PDF not found: {file_path}")
    try:
        from pypdf import PdfReader
        reader = PdfReader(str(path))
        pages = []
        for page in reader.pages:
            try:
                text = page.extract_text()
                if text and text.strip():
                    pages.append(text)
            except Exception:
                continue
        result = "\n".join(pages).strip()
        if not result:
            return f"[Could not extract text from {path.name}. File may be scanned/image-based.]"
        return result
    except Exception as exc:
        raise RuntimeError(f"Could not read PDF '{path.name}': {exc}") from exc
