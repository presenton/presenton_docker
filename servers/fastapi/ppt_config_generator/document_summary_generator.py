import asyncio
import os
from typing import List
from langchain_core.documents import Document
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import BaseMessage
from langchain_text_splitters import CharacterTextSplitter

sysmte_prompt = """
Generate a blog-style summary of the provided document in **more than 2000 words**, focusing on **prominently featuring any numerical data and statistics**. Maintain as much information as possible.

### Output Format

- Provide the summary in a **blog format** with an **engaging introduction** and a **clear structure**.
- Ensure the **logical flow** of the document is preserved.
- Emphasize any **numbers, statistics, and data points**.

### Notes

- **Emphasize numerical data and statistics** in the summary.
- **Retain the main ideas and essential details** from the document.
- Use **engaging language** suitable for a blog audience to enhance readability.
- **Show line-breaks** clearly.
- If **slides structure is mentioned** in document, structure the summary in the same way.
"""

prompt_template = ChatPromptTemplate.from_messages(
    [
        ("system", sysmte_prompt),
        ("user", "{text}"),
    ]
)


async def generate_document_summary(documents: List[Document]):
    model = (
        ChatOpenAI(model="gpt-4.1-nano", max_completion_tokens=8000)
        if os.getenv("LLM") == "openai"
        else ChatGoogleGenerativeAI(model="gemini-2.0-flash", max_output_tokens=8000)
    )
    # text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
    #     encoding_name="cl100k_base", chunk_size=200000, chunk_overlap=0
    # )
    text_splitter = CharacterTextSplitter(chunk_size=200000, chunk_overlap=0)
    chain = prompt_template | model

    coroutines = []
    for document in documents:
        text = document.page_content
        truncated_text = text_splitter.split_text(text)[0]
        coroutine = chain.ainvoke({"text": truncated_text})
        coroutines.append(coroutine)

    completions: List[BaseMessage] = await asyncio.gather(*coroutines)
    combined = "\n\n".join([completion.content for completion in completions])
    return combined
