import os
from typing import Optional
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI

from api.utils import get_large_model
from ppt_config_generator.models import PresentationMarkdownModel
from ppt_generator.fix_validation_errors import get_validated_response


user_prompt_text = {
    "type": "text",
    "text": """
                **Input:**
                - Prompt: {prompt}
                - Output Language: {language}
                - Number of Slides: {n_slides}
                - Additional Information: {content}
            """,
}


def get_prompt_template():
    return ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                Create a presentation based on the provided prompt, number of slides, output language, and additional informational details.
                Format the output in the specified JSON schema with structured markdown content.
    
                # Steps

                1. Identify key points from the provided prompt, including the topic, number of slides, output language, and additional content directions.
                2. Create a concise and descriptive title reflecting the main topic, adhering to the specified language.
                3. Generate a clear title for each slide.
                4. Develop comprehensive content using markdown structure:
                    * Use bullet points (- or *) for lists.
                    * Use **bold** for emphasis, *italic* for secondary emphasis, and `code` for technical terms.
                5. Provide styling and formatting information for the presentation as notes.
                
                # Notes
                - There must be exact number of slides as specified.
                - Content must be generated for every slide.
                - Images or Icons information provided in **Input** must be included in the **notes**.
                - Notes should cleary define if it is for specific slide or for the presentation.
                - Slide **body** should not contain slide **title**.
                - Slide **title** should not contain "Slide 1", "Slide 2", etc.
                - Slide **title** should not be in markdown format.
                """,
            ),
            (
                "user",
                [user_prompt_text],
            ),
        ],
    )


async def generate_ppt_content(
    prompt: Optional[str],
    n_slides: int,
    language: Optional[str] = None,
    content: Optional[str] = None,
) -> PresentationMarkdownModel:
    model = get_large_model()

    chain = get_prompt_template() | model.with_structured_output(
        PresentationMarkdownModel.model_json_schema()
    )

    response = await get_validated_response(
        chain,
        {
            "prompt": prompt,
            "n_slides": n_slides,
            "language": language or "English",
            "content": content,
        },
        PresentationMarkdownModel,
    )
    return response
