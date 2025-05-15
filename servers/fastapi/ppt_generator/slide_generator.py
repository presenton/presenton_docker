from typing import Optional
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from ppt_generator.fix_validation_errors import get_validated_response
from ppt_generator.models.content_type_models import (
    CONTENT_TYPE_MAPPING,
)

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from ppt_generator.models.other_models import SlideType, SlideTypeModel
from ppt_generator.models.slide_model import SlideModel


prompt_template_from_slide = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
                Edit Slide data based on provided prompt, follow mentioned steps and notes and provide structured output.

                # Notes
                - Provide output in language mentioned in **Input**.
                - The goal is to change Slide data based on the provided prompt.
                - Do not change **Image prompts** and **Icon queries** if not asked for in prompt.
                - Generate **Image prompts** and **Icon queries** if asked to generate or change image or icons in prompt.
                - Ensure there are no line breaks in the JSON.
                - Do not use special characters for highlighting.
                {notes}

                **Go through all notes and steps and make sure they are followed, including mentioned constraints**
            """,
        ),
        (
            "user",
            """
            - Prompt: {prompt}
            - Output Language: {language}
            - Image Prompts and Icon Queries Language: English
            - Theme: {theme}
            - Slide data: {slide_data}
        """,
        ),
    ]
)


prompt_template_from_slide_type = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
            Select a Slide Type based on provided user prompt and current slide data.

            Select slide based on following slide description and make sure it matches user requirement:
            # Slide Types (Slide Type : Slide Description)
                - **1**: contains title, description and image.
                - **2**: contains title and list of items.
                - **4**: contains title and list of items with images.
                - **5**: contains title, description and a graph.
                - **6**: contains title, description and list of items.
                - **7**: contains title and list of items with icons.
                - **8**: contains title, description and list of items with icons.
                - **9**: contains title, list of items and a graph.
                - **10**: contains title, list of inforgraphic charts with supporting information.
                - **11**: contains title, a single inforgraphic chart and description.

            # Notes
            - Do not select different slide type than current unless absolutely necessary as per user prompt.

            **Go through all notes and steps and make sure they are followed, including mentioned constraints**
        """,
        ),
        (
            "user",
            """
            - User Prompt: {prompt}
            - Current Slide Data: {slide_data}
            - Current Slide Type: {slide_type}
        """,
        ),
    ]
)


async def get_edited_slide_content_model(
    prompt: str,
    slide_type: SlideType,
    slide: SlideModel,
    theme: Optional[dict] = None,
    language: Optional[str] = None,
):
    model = (
        ChatOpenAI(model="gpt-4.1-mini")
        if os.getenv("LLM") == "openai"
        else ChatGoogleGenerativeAI(model="gemini-2.0-flash")
    )

    content_type_model_type = CONTENT_TYPE_MAPPING[slide_type]
    chain = prompt_template_from_slide | model.with_structured_output(
        content_type_model_type.model_json_schema()
    )
    slide_data = slide.content.model_dump_json()
    return await get_validated_response(
        chain,
        {
            "prompt": prompt,
            "language": language or "English",
            "theme": theme,
            "slide_data": slide_data,
            "notes": "",
        },
        content_type_model_type,
    )


async def get_slide_type_from_prompt(
    prompt: str,
    slide: SlideModel,
) -> SlideTypeModel:

    model = (
        ChatOpenAI(model="gpt-4.1-mini")
        if os.getenv("LLM") == "openai"
        else ChatGoogleGenerativeAI(model="gemini-2.0-flash")
    )

    chain = prompt_template_from_slide_type | model.with_structured_output(
        SlideTypeModel.model_json_schema()
    )
    slide_data = slide.content.model_dump_json()
    return await get_validated_response(
        chain,
        {
            "prompt": prompt,
            "slide_data": slide_data,
            "slide_type": slide.type,
        },
        SlideTypeModel,
    )
