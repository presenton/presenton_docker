import asyncio
import json
from api.utils import download_file
from image_processor.images_finder import get_image_from_pexels
from ppt_config_generator.structure_generator import generate_presentation_structure
from ppt_config_generator.models import (
    PresentationStructureModel,
    PresentationMarkdownModel,
    SlideMarkdownModel,
)
from ppt_config_generator.ppt_outlines_generator import generate_ppt_content
from ppt_generator.generator import generate_presentation_ollama
from ppt_generator.models.llm_models import LLMPresentationModel
from ppt_generator.slide_generator import get_slide_content_from_type_and_outline


def test_ollama():
    # # Generate presentation outline
    # presentation_outline = asyncio.run(
    #     generate_ppt_content(
    #         prompt="create presentation about moon",
    #         n_slides=5,
    #     )
    # )

    # # Save presentation outline to file
    # with open("tests/tmp/presentation_outline.json", "w") as f:
    #     json.dump(presentation_outline.model_dump(mode="json"), f)

    # # Load presentation outline from file
    # with open("tests/tmp/presentation_outline.json", "r") as f:
    #     presentation_outline = PresentationMarkdownModel.model_validate_json(f.read())

    # # Generate presentation config
    # presentation_config = asyncio.run(generate_presentation_config(presentation_outline))

    # # Save presentation config to file
    # with open("tests/tmp/presentation_config.json", "w") as f:
    #     json.dump(presentation_config.model_dump(mode="json"), f)

    # # Load presentation config from file
    # with open("tests/tmp/presentation_config.json", "r") as f:
    #     presentation_config = PresentationStructureModel.model_validate_json(f.read())

    # # Generate presentation
    # presentation_output = asyncio.run(
    #     generate_presentation_ollama(presentation_outline)
    # )

    # # Save presentation output to file
    # with open("tests/tmp/presentation_output.json", "w") as f:
    #     json.dump(presentation_output.model_dump(mode="json"), f)

    # # Generate slide content
    # slide_content = asyncio.run(
    #     get_slide_content_from_type_and_outline(9, presentation_outline.slides[3])
    # )

    # # Save slide content to file
    # with open("tests/tmp/slide_content.json", "w") as f:
    #     json.dump(slide_content.model_dump(mode="json"), f)
    pass