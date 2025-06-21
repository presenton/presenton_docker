from langchain_core.prompts import ChatPromptTemplate

from api.utils import get_small_model
from ppt_config_generator.models import (
    PresentationStructureModel,
    PresentationMarkdownModel,
)

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
                You're a professional presentation designer with years of experience in designing clear and engaging presentations.

                # Slide Types
                - **1**: contains title, description and image.
                - **2**: contains title and list of items.
                - **4**: contains title and list of items with images.
                - **5**: contains title, description and a graph.
                - **6**: contains title, description and list of items.
                - **7**: contains title and list of items with icons.
                - **8**: contains title, description and list of items with icons.
                - **9**: contains title, list of items and a graph.

                # Steps
                1. Analyze provided Number of slides, Presentation title, Slides content and Slide types.
                2. Select appropriate slide type for each slide.
                3. Provide output in json format as per given schema.

                # Notes
                - Slide type should be selected based on provided content for slide and notes.
                - Feel free to select slide type with images and icons.
                - Introduction and Conclusion should have type **1**.
                - Don't fall into patterns like always using type 2 and after type 1.
                - Each presentation should have its own unique flow and rhythm.
                - Do not select type **3** for any slide.
                - Do not select type **5** or **9** if outline does not have table.

                **Go through notes and steps and make sure they are all followed. Rule breaks are strictly not allowed.**
            """,
        ),
        (
            "human",
            """
            Number of slides: {n_slides}

            {data}
            """,
        ),
    ]
)


async def generate_presentation_structure(
    presentation_outline: PresentationMarkdownModel,
) -> PresentationStructureModel:

    model = get_small_model().with_structured_output(PresentationStructureModel)
    chain = prompt | model

    return await chain.ainvoke(
        {
            "n_slides": len(presentation_outline.slides),
            "data": presentation_outline.to_string(),
        }
    )
