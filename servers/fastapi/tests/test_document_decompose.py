import os
from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)

def test_upload_and_decompose_document():
    # Get the absolute path to the test asset
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, "assets", "impact_of_llms.pdf")
    
    # Step 1: Upload the document
    with open(file_path, "rb") as f:
        upload_response = client.post(
            "/ppt/files/upload",
            files={"documents": ("impact_of_llms.pdf", f, "application/pdf")}
        )
    assert upload_response.status_code == 200
    upload_json = upload_response.json()
    assert "documents" in upload_json
    assert len(upload_json["documents"]) > 0
    
    # Step 2: Decompose the uploaded document
    decompose_response = client.post(
        "/ppt/files/decompose",
        json={"documents": upload_json["documents"]}
    )
    assert decompose_response.status_code == 200
    decompose_json = decompose_response.json()
    assert "documents" in decompose_json
    # Verify the decomposition created a text file for the uploaded document
    assert upload_json["documents"][0] in decompose_json["documents"]
    assert decompose_json["documents"][upload_json["documents"][0]].endswith(".txt")
