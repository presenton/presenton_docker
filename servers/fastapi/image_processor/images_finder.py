import asyncio
import base64
import os
import uuid
import aiohttp
from langchain_google_genai import ChatGoogleGenerativeAI
from openai import OpenAI

from ppt_generator.models.query_and_prompt_models import (
    ImagePromptWithThemeAndAspectRatio,
)
from api.utils import get_resource


async def generate_image(
    input: ImagePromptWithThemeAndAspectRatio,
    output_directory: str,
) -> str:
    image_prompt = f"{input.image_prompt}, {input.theme_prompt}"
    print(f"Request - Generating Image for {image_prompt}")

    try:
        image_gen_func = (
            generate_image_openai
            if os.getenv("LLM") == "openai"
            else generate_image_google
        )
        image_path = await image_gen_func(image_prompt, output_directory)
        if image_path and os.path.exists(image_path):
            return image_path
        raise Exception(f"Image not found at {image_path}")

    except Exception as e:
        print(f"Error generating image: {e}")
        return get_resource("assets/images/placeholder.jpg")


async def generate_image_openai(prompt: str, output_directory: str) -> str:
    client = OpenAI()
    result = await asyncio.to_thread(
        client.images.generate,
        model="dall-e-3",
        prompt=prompt,
        n=1,
        quality="standard",
        size="1024x1024",
    )
    image_url = result.data[0].url
    async with aiohttp.ClientSession() as session:
        async with session.get(image_url) as response:
            image_bytes = await response.read()
            image_path = os.path.join(output_directory, f"{str(uuid.uuid4())}.jpg")
            with open(image_path, "wb") as f:
                f.write(image_bytes)
            return image_path


async def generate_image_google(prompt: str, output_directory: str) -> str:
    response = await ChatGoogleGenerativeAI(
        model="gemini-2.0-flash-preview-image-generation"
    ).ainvoke([prompt], generation_config={"response_modalities": ["TEXT", "IMAGE"]})

    image_block = next(
        block
        for block in response.content
        if isinstance(block, dict) and block.get("image_url")
    )

    base64_image = image_block["image_url"].get("url").split(",")[-1]
    image_path = os.path.join(output_directory, f"{str(uuid.uuid4())}.jpg")
    with open(image_path, "wb") as f:
        f.write(base64.b64decode(base64_image))

    return image_path
