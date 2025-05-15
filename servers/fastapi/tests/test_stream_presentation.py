from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
import json

from api.main import app
from api.models import SessionModel

client = TestClient(app)

def mock_stream_response():
    return [
        {"type": "start", "data": "Starting presentation generation"},
        {"type": "slide_start", "data": "Generating slide 1"},
        {"type": "slide_end", "data": "Completed slide 1"},
        {"type": "slide_start", "data": "Generating slide 2"},
        {"type": "slide_end", "data": "Completed slide 2"},
        {"type": "end", "data": "Presentation generation complete"}
    ]

@patch('api.routers.presentation.handlers.generate_stream.PresentationGenerateStreamHandler.get')
def test_presentation_flow(mock_stream):
    # Setup mock for streaming response
    mock_stream.return_value = mock_stream_response()

    # Step 1: Upload document
    test_file_path = "tests/assets/impact_of_llms.pdf"
    with open(test_file_path, "rb") as f:
        upload_response = client.post(
            "/ppt/files/upload",
            files={"documents": ("impact_of_llms.pdf", f, "application/pdf")}
        )
    assert upload_response.status_code == 200
    upload_json = upload_response.json()
    assert "documents" in upload_json
    assert len(upload_json["documents"]) > 0

    # Step 2: Decompose uploaded document
    decompose_response = client.post(
        "/ppt/files/decompose",
        json={"documents": upload_json["documents"]}
    )
    assert decompose_response.status_code == 200
    decompose_json = decompose_response.json()
    assert "documents" in decompose_json
    assert upload_json["documents"][0] in decompose_json["documents"]

    # Step 3: Create presentation
    create_response = client.post(
        "/ppt/create",
        json={
            "prompt": "Create a presentation about LLMs",
            "n_slides": 2,
            "language": "en",
            "documents": upload_json["documents"]
        }
    )
    assert create_response.status_code == 200
    presentation = create_response.json()
    presentation_id = presentation["id"]

    # Step 4: Generate presentation data and get session
    gen_data_response = client.post(
        "/ppt/generate/data",
        json={
            "presentation_id": presentation_id,
            "theme": None,
            "images": None,
            "watermark": True,
            "titles": ["Introduction to LLMs", "Impact of LLMs"]
        }
    )
    assert gen_data_response.status_code == 200
    session_data = gen_data_response.json()
    assert "session" in session_data

    # Step 5: Stream presentation generation
    stream_response = client.get(f"/ppt/generate/stream?presentation_id={presentation_id}&session={session_data['session']}")
    assert stream_response.status_code == 200
    
    # Verify stream events
    events = list(mock_stream_response())
    assert len(events) > 0
    assert events[0]["type"] == "start"
    assert events[-1]["type"] == "end"
    assert any(event["type"] == "slide_start" for event in events)
    assert any(event["type"] == "slide_end" for event in events)


