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
) -> str:
    try:
        query = input.icon_query.queries[0]
        results = vector_store.similarity_search(query=query, k=1)
        icon_name = results[0].page_content
        return get_resource(f"assets/icons/bold/{icon_name}.png")
    except Exception as e:
        print("Error finding icon: ", e)
        return get_resource("assets/icons/placeholder.png")


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

    return [get_resource(f"assets/icons/bold/{each}.png") for each in icon_names]
