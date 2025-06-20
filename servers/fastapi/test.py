import os
from tests.test_ollama import test_ollama

os.environ["LLM"] = "llama3.1:8b"

test_ollama()
