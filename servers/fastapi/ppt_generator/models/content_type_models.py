from typing import List, Mapping
from pydantic import BaseModel, Field

from ppt_generator.models.other_models import SlideType
from graph_processor.models import GraphModel


class HeadingModel(BaseModel):
    heading: str
    description: str


class IconQueryCollectionModel(BaseModel):
    queries: List[str]


class SlideContentModel(BaseModel):
    title: str


class Type1Content(SlideContentModel):
    body: str
    image_prompts: List[str]


class Type2Content(SlideContentModel):
    body: List[HeadingModel]


class Type3Content(SlideContentModel):
    body: List[HeadingModel]
    image_prompts: List[str]


class Type4Content(SlideContentModel):
    body: List[HeadingModel]
    image_prompts: List[str]


class Type5Content(SlideContentModel):
    body: str
    graph: GraphModel


class Type6Content(SlideContentModel):
    description: str
    body: List[HeadingModel]


class Type7Content(SlideContentModel):
    body: List[HeadingModel]
    icon_queries: List[IconQueryCollectionModel]


class Type8Content(SlideContentModel):
    description: str
    body: List[HeadingModel]
    icon_queries: List[IconQueryCollectionModel]


class Type9Content(SlideContentModel):
    body: List[HeadingModel]
    graph: GraphModel


CONTENT_TYPE_MAPPING: Mapping[SlideType, SlideContentModel] = {
    SlideType.type1: Type1Content,
    SlideType.type2: Type2Content,
    SlideType.type3: Type3Content,
    SlideType.type4: Type4Content,
    SlideType.type5: Type5Content,
    SlideType.type6: Type6Content,
    SlideType.type7: Type7Content,
    SlideType.type8: Type8Content,
    SlideType.type9: Type9Content,
}
