import asyncio
from typing import List

from api.models import SSEStatusResponse
from api.utils import get_presentation_images_dir
from image_processor.icons_finder import get_icon
from image_processor.icons_vectorstore_utils import get_icons_vectorstore
from image_processor.images_finder import generate_image
from ppt_generator.models.slide_model import SlideModel
from ppt_generator.slide_model_utils import SlideModelUtils


class FetchAssetsOnPresentationGenerationMixin:

    async def fetch_slide_assets(self, slide_models: List[SlideModel]):
        image_prompts = []
        icon_queries = []

        for each_slide_model in slide_models:
            slide_model_utils = SlideModelUtils(self.theme, each_slide_model)
            image_prompts.extend(slide_model_utils.get_image_prompts())
            icon_queries.extend(slide_model_utils.get_icon_queries())

        if icon_queries:
            icon_vector_store = get_icons_vectorstore()

        images_directory = get_presentation_images_dir(self.presentation_id)

        coroutines = [
            generate_image(
                each,
                images_directory,
            )
            for each in image_prompts
        ] + [get_icon(icon_vector_store, each) for each in icon_queries]

        assets_future = asyncio.gather(*coroutines)

        while not assets_future.done():
            status = SSEStatusResponse(status="Fetching slide assets").to_string()
            yield status
            await asyncio.sleep(5)

        assets = await assets_future

        image_prompts_len = len(image_prompts)

        images = assets[:image_prompts_len]
        icons = assets[image_prompts_len:]

        for each_slide_model in slide_models:
            each_slide_model.images = images[: each_slide_model.images_count]
            images = images[each_slide_model.images_count :]

            each_slide_model.icons = icons[: each_slide_model.icons_count]
            icons = icons[each_slide_model.icons_count :]

        yield SSEStatusResponse(status="Slide assets fetched").to_string()
