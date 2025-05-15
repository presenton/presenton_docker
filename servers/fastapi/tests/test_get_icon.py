import asyncio
import os

from image_processor.icons_finder import get_icon
from image_processor.icons_vectorstore_utils import get_icons_vectorstore
from ppt_generator.models.content_type_models import IconQueryCollectionModel
from ppt_generator.models.query_and_prompt_models import IconQueryCollectionWithData


def test_get_icon():
    vector_store = get_icons_vectorstore()

    for query in [
        "thermometer high",
        "rainstorm",
        "sea level icon",
        "solar panel icon",
        "efficient light bulb",
        "sustainable leaf",
    ]:
        asyncio.run(
            get_icon(
                vector_store,
                IconQueryCollectionWithData(
                    icon_query=IconQueryCollectionModel(queries=[query]),
                    index=0,
                ),
                os.path.join(
                    os.getenv("APP_DATA_DIRECTORY"), f"generated_icons/{query}.png"
                ),
            )
        )
        break
