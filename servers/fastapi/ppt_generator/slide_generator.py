from typing import Optional
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from api.utils import get_small_model
from ppt_config_generator.models import SlideMarkdownModel
from ppt_generator.fix_validation_errors import get_validated_response
from ppt_generator.models.content_type_models import CONTENT_TYPE_MAPPING

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from ppt_generator.models.llm_models import (
    LLM_CONTENT_TYPE_MAPPING,
    LLMSlideContentModel,
)
from ppt_generator.models.other_models import SlideTypeModel
from ppt_generator.models.slide_model import SlideModel


prompt_template_to_generate_slide_content = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
            Generate structured slide based on provided title and outline, follow mentioned steps and notes and provide structured output.


            # Steps
            1. Analyze the outline and title.
            2. Generate structured slide based on the outline and title.
            3. Generate image prompts and icon queries if mentioned in schema.
            4. Generate graph if mentioned in schema.

            # Notes
            - Slide body should not use words like "This slide", "This presentation".
            - Rephrase the slide body to make it flow naturally.
            - Do not use markdown formatting in slide body.
            - **Icon query** must be a generic single word noun.
            - Example of **Image prompt**: deer in forest, moon in sky, etc.
            - Try to make paragraphs as short as possible.
            {notes}
            """,
        ),
        (
            "user",
            """
            ## Slide Title
            {title}

            ## Slide Outline
            {outline}
        """,
        ),
    ]
)


prompt_template_to_edit_slide_content = ChatPromptTemplate.from_messages(
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


prompt_template_to_select_slide_type = ChatPromptTemplate.from_messages(
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


async def get_slide_content_from_type_and_outline(
    slide_type: int, outline: SlideMarkdownModel
) -> LLMSlideContentModel:
    content_type_model_type = LLM_CONTENT_TYPE_MAPPING[slide_type]
    model = get_small_model().with_structured_output(
        content_type_model_type.model_json_schema()
    )
    chain = prompt_template_to_generate_slide_content | model

    return await get_validated_response(
        chain,
        {
            "title": outline.title,
            "outline": outline.body,
            "notes": content_type_model_type.get_notes(),
        },
        content_type_model_type,
    )


async def get_edited_slide_content_model(
    prompt: str,
    slide_type: int,
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
    chain = prompt_template_to_edit_slide_content | model.with_structured_output(
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

    chain = prompt_template_to_select_slide_type | model.with_structured_output(
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
