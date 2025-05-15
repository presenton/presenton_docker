import os
from typing import List, Optional

from api.utils import get_resource
from ppt_generator.models.query_and_prompt_models import (
    IconCategoryEnum,
    IconQueryCollectionWithData,
)
from langchain_core.vectorstores import InMemoryVectorStore


async def get_icon(
    vector_store: InMemoryVectorStore,
    input: IconQueryCollectionWithData,
    output_path: str,
) -> str:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    query = input.icon_query.queries[0]
    results = vector_store.similarity_search(query=query, k=1)
    icon_name = results[0].page_content

    with open(output_path, "wb") as f_a:
        try:
            with open(get_resource(f"assets/icons/bold/{icon_name}.png"), "rb") as f_b:
                f_a.write(f_b.read())
        except Exception as e:
            print("Error finding icon: ", e)
            with open(get_resource("assets/icons/placeholder.png"), "rb") as f_b:
                f_a.write(f_b.read())


async def get_icons(
    vector_store: InMemoryVectorStore,
    query: str,
    page: int,
    limit: int,
    category: Optional[IconCategoryEnum],
    temp_dir: str,
) -> List[str]:

    results = await vector_store.asimilarity_search(query=query, k=limit)

    icon_names = [result.page_content for result in results]

    icon_paths = [get_resource(f"assets/icons/bold/{each}.png") for each in icon_names]

    icon_temp_paths = []

    for each in icon_paths:
        icon_temp_path = os.path.join(temp_dir, os.path.basename(each))
        icon_temp_paths.append(icon_temp_path)

        with open(icon_temp_path, "wb") as f_a:
            with open(each, "rb") as f_b:
                f_a.write(f_b.read())

    return icon_temp_paths
