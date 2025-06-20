import os
from typing import AsyncIterator

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI
from langchain_core.messages import (
    HumanMessage,
    AIMessageChunk,
    AIMessage,
)
from ppt_config_generator.models import PresentationMarkdownModel
from ppt_generator.models.llm_models import LLMPresentationModel

CREATE_PRESENTATION_PROMPT = """
    You're a professional presenter with years of experience in creating clear and engaging presentations. 

    Create a presentation using the provided title, slide titles and body following specified steps and guidelines. 

    Analyze all inputs, to construct each slide with appropriate content and format.


    # Slide Types
    - **1**: contains title, description and image.
    - **2**: contains title and list of items.
    - **4**: contains title and list of items with images.
    - **5**: contains title, description and a graph.
    - **6**: contains title, description and list of items.
    - **7**: contains title and list of items with icons.
    - **8**: contains title, description and list of items with icons.

    # Steps
    1. Analyze provided presentation title, slide titles and body.
    2. Select slide type for each slide.
    3. Output should be in json format as per given schema.
    4. **Adherence to schema should be beyond all the rules mentioned in notes.**

    # Notes
    - Generate output in language mentioned in *Input*.
    - Freely select type with images and icons.
    - Introduction and Conclusion should have *Type 1* if graph is not assigned.
    - Try to select **different types for every slides**.
    - Don't select Type **3** for any slide.
    - Do not include same graph twice in presentation without any changes to the other.
    - Every series in a graph should have data in same unit. Example: all series should be in percentage or all series should be in number of items.
    - Type **9** and **5** should be only picked if graph is available.
    - **Strictly keep the text under given limit.**
    - For slide content follow these rules:
        - Highlighting in markdown format should be used to emphasize numbers and data.
        - Adhere to length contraints in **body** and **description**. Focus on direct communication within character constrainsts than lengthy explanation.
        - **body** and **description** in slides should never exceed character limits of 200 characters.
        - Specify **don't include text in image** in image prompt.
        - All the numbers should be bolded with **bold** tag in body or description of slide.
        - Image prompt should cleary define how image should look like.
        - Image prompt should not ask to generate **numbers, graphs, dashboard and report**.
        - Examples of image prompts: 
            - a travel agent presenting a detailed itinerary with photos of destinations, showcasing specific experiences, highlighting travel highlights
            - a person smiling while traveling, with a beautiful background scenery, such as mountains, beach, or city,  golden hour lighting
            - a humanoid robot standing tall, gazing confidently at the horizon, bathed in warm sunlight, the background showing a futuristic cityscape with sleek buildings and flying vehicles
        - Descriptions should be clear and to the point.
        - Descriptions should not use words like "This slide", "This presentation".
        - If **body** contains items, *choose number of items randomly between mentioned constraints.*
        - **Icon queries** must be a generic **single word noun**.
        - Provide 3 icon query for each icon where,
            - First one should be specific like "Led bulb".
            - Second one should be more generic that first like "bulb".
            - Third one should be simplest like "light".

    **Follow the all the length constraints provided in the schema and notes.**
    **Go through notes and steps and make sure they are all followed. Rule breaks are strictly not allowed.**
"""

schema = LLMPresentationModel.model_json_schema()

system_prompt = f"""
{CREATE_PRESENTATION_PROMPT}

Follow this schema while giving out response: {schema}.

Make description short and obey the character limits. Output should be in JSON format. Give out only JSON, nothing else.
"""

ollama_system_prompt = f"""
{CREATE_PRESENTATION_PROMPT}

Make description short and obey the character limits. Output should be in JSON format. Give out only JSON, nothing else.
"""


def get_model_and_messages(
    presentation_outline: PresentationMarkdownModel,
):
    user_message = HumanMessage(presentation_outline.to_string())

    model = (
        ChatOpenAI(model="gpt-4.1")
        if os.getenv("LLM") == "openai"
        else ChatGoogleGenerativeAI(model="gemini-2.0-flash")
    )

    return model, system_prompt, user_message


def generate_presentation_stream(
    presentation_outline: PresentationMarkdownModel,
) -> AsyncIterator[AIMessageChunk]:
    model, system_prompt, user_message = get_model_and_messages(presentation_outline)

    return model.astream([system_prompt, user_message])


async def generate_presentation(
    presentation_outline: PresentationMarkdownModel,
) -> AIMessage:
    model, system_prompt, user_message = get_model_and_messages(presentation_outline)
    return await model.ainvoke([system_prompt, user_message])


async def generate_presentation_ollama(
    presentation_outline: PresentationMarkdownModel,
) -> LLMPresentationModel:
    user_message = HumanMessage(presentation_outline.to_string())
    model = ChatOllama(model="llama3.1:8b").with_structured_output(LLMPresentationModel)
    return await model.ainvoke([ollama_system_prompt, user_message])
