from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

file = "tests/assets/impact_of_llms.pdf"

def test_upload_files():
    with open(file, "rb") as f:
        response = client.post(
            "/ppt/files/upload",
            files={"documents": ("impact_of_llms.pdf", f, "application/pdf")},
        )
    assert response.status_code == 200
    response_json = response.json()
    assert "documents" in response_json
    assert "images" in response_json

def test_upload_files_no_files():
    response = client.post("/ppt/files/upload")
    assert response.status_code == 200
    response_json = response.json()
    assert response_json["documents"] == []
    assert response_json["images"] == []