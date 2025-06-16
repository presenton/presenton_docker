import asyncio
import json
from ppt_config_generator.models import PresentationMarkdownModel
from ppt_config_generator.ppt_outlines_generator import generate_ppt_content
from ppt_generator.generator import generate_presentation_ollama
from ppt_generator.models.llm_models import LLMPresentationModel


def test_ollama():
    # presentation_outline = asyncio.run(
    #     generate_ppt_content(
    #         prompt="create presentation about moon",
    #         n_slides=5,
    #     )
    # )
    # print(presentation_outline.model_dump(mode="json"))

    presentation_outline = PresentationMarkdownModel(
        **{
            "title": "Lunar Exploration Presentation",
            "notes": [
                "Number of slides as specified.",
                "* Content must be generated for every slide.",
                "* Images or Icons information will be included in the notes.",
                "* Notes should clearly define if it is for specific slide or for the presentation.",
                "* Slide body should not contain slide title.",
            ],
            "slides": [
                {
                    "title": "Introduction to the Moon",
                    "body": "> The Moon is Earth's only natural satellite. It is a rocky, airless body that has been a subject of human fascination for centuries.",
                },
                {
                    "title": "Geological History of the Moon",
                    "body": "* Formed approximately 4.51 billion years ago from debris left over after a Mars-sized object collided with Earth.*\n* Has undergone extensive cratering and volcanic activity over its lifetime.*",
                },
                {
                    "title": "Phases of the Moon",
                    "body": "* New Moon: The side of the Moon facing away from Earth.\n* Waxing Crescent: A growing sliver of light on the right side as the Moon moves towards full moon.\n* First Quarter: Half-illuminated with the right half visible in the sky.*\n* Waning Gibbous: A decreasing sliver of light on the left side as the Moon moves away from full moon.*",
                },
                {
                    "title": "Moon's Atmosphere and Surface",
                    "body": "* The Moon has a very thin atmosphere, known as an exosphere.\n* The surface is composed primarily of silicate rocks, metals, and other minerals.",
                },
                {
                    "title": "Exploration of the Moon",
                    "body": "* **Apollo Program** (1969-1972): A series of manned missions that successfully landed astronauts on the Moon's surface.*\n* Ongoing efforts to return humans to the Moon by 2025 with NASA's Artemis program.",
                },
            ],
        }
    )

    # presentation_message = asyncio.run(
    #     generate_presentation_ollama(
    #         title=presentation_outline.title,
    #         notes=presentation_outline.notes,
    #         outlines=presentation_outline.slides,
    #     )
    # )

    # print(json.dumps(presentation_message))
