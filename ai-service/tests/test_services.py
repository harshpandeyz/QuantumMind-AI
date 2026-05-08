import pytest
from utils.chunker import chunk_text
from utils.pdf_extractor import extract_text


def test_chunk_empty_string():
    assert chunk_text("") == []


def test_chunk_returns_list_of_strings():
    result = chunk_text("Hello world. This is a sentence. Another one here.")
    assert isinstance(result, list)
    assert all(isinstance(c, str) for c in result)
    assert len(result) >= 1


def test_chunk_multiple_chunks_created():
    text = " ".join([f"word{i}." for i in range(300)])
    chunks = chunk_text(text, chunk_size=50, overlap=10)
    assert len(chunks) > 1


def test_chunk_overlap_shares_content():
    text = " ".join([f"word{i}." for i in range(200)])
    chunks = chunk_text(text, chunk_size=50, overlap=20)
    if len(chunks) > 1:
        last_words = set(chunks[0].split()[-20:])
        first_words = set(chunks[1].split()[:20])
        assert len(last_words & first_words) > 0


def test_pdf_missing_file_raises():
    with pytest.raises(FileNotFoundError):
        extract_text("/nonexistent/does/not/exist.pdf")
