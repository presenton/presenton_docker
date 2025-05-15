from dotenv import load_dotenv

load_dotenv()

import asyncio
import os
from image_processor.images_finder import generate_image
from ppt_generator.models.query_and_prompt_models import (
    ImagePromptWithThemeAndAspectRatio,
)


def test_generate_image():
    prompt = ImagePromptWithThemeAndAspectRatio(
        image_prompt="A beautiful sunset over a calm ocean",
        theme_prompt="dynamic shot, photo realistic",
        aspect_ratio="16:9",
    )
    output_path = os.path.join(os.getenv("TEMP_DIRECTORY"), "test_image.jpg")

    asyncio.run(generate_image(prompt, output_path))
