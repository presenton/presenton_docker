from typing import List, Mapping
from pydantic import BaseModel

from graph_processor.models import GraphModel
from ppt_generator.models.content_type_models import (
    HeadingModel,
    SlideContentModel,
    Type1Content,
    Type2Content,
    Type3Content,
    Type4Content,
    Type5Content,
    Type6Content,
    Type7Content,
    Type8Content,
    Type9Content,
)
from ppt_generator.models.other_models import (
    TYPE1,
    TYPE2,
    TYPE3,
    TYPE4,
    TYPE5,
    TYPE6,
    TYPE7,
    TYPE8,
    TYPE9,
)


class LLMHeadingModel(BaseModel):
    heading: str
    description: str

    def to_content(self) -> HeadingModel:
        return HeadingModel(
            heading=self.heading,
            description=self.description,
        )


class LLMHeadingModelWithImagePrompt(LLMHeadingModel):
    image_prompt: str


class LLMHeadingModelWithIconQuery(LLMHeadingModel):
    icon_query: str


class LLMSlideContentModel(BaseModel):
    title: str

    def to_content(self) -> SlideContentModel:
        raise NotImplementedError("to_content method not implemented")


class LLMType1Content(LLMSlideContentModel):
    body: str
    image_prompt: str

    def to_content(self) -> Type1Content:
        return Type1Content(
            title=self.title,
            body=self.body,
            image_prompts=[self.image_prompt],
        )


class LLMType2Content(LLMSlideContentModel):
    body: List[LLMHeadingModel]

    def to_content(self) -> Type2Content:
        return Type2Content(
            title=self.title,
            body=[each.to_content() for each in self.body],
        )


class LLMType3Content(LLMSlideContentModel):
    body: List[LLMHeadingModel]
    image_prompt: str

    def to_content(self) -> Type3Content:
        return Type3Content(
            title=self.title,
            body=[each.to_content() for each in self.body],
            image_prompts=[self.image_prompt],
        )


class LLMType4Content(LLMSlideContentModel):
    body: List[LLMHeadingModelWithImagePrompt]

    def to_content(self) -> Type4Content:
        return Type4Content(
            title=self.title,
            body=[each.to_content() for each in self.body],
            image_prompts=[each.image_prompt for each in self.body],
        )


class LLMType5Content(LLMSlideContentModel):
    body: str
    graph: GraphModel

    def to_content(self) -> Type5Content:
        return Type5Content(
            title=self.title,
            body=self.body,
            graph=self.graph,
        )


class LLMType6Content(LLMSlideContentModel):
    description: str
    body: List[LLMHeadingModel]

    def to_content(self) -> Type6Content:
        return Type6Content(
            title=self.title,
            description=self.description,
            body=[each.to_content() for each in self.body],
        )


class LLMType7Content(LLMSlideContentModel):
    body: List[LLMHeadingModelWithIconQuery]

    def to_content(self) -> Type7Content:
        return Type7Content(
            title=self.title,
            body=[each.to_content() for each in self.body],
            icon_queries=[each.icon_query for each in self.body],
        )


class LLMType8Content(LLMSlideContentModel):
    description: str
    body: List[LLMHeadingModelWithImagePrompt]

    def to_content(self) -> Type8Content:
        return Type8Content(
            title=self.title,
            description=self.description,
            body=[each.to_content() for each in self.body],
            icon_queries=[each.image_prompt for each in self.body],
        )


class LLMType9Content(LLMSlideContentModel):
    body: List[LLMHeadingModel]
    graph: GraphModel

    def to_content(self) -> Type9Content:
        return Type9Content(
            title=self.title,
            body=[each.to_content() for each in self.body],
            graph=self.graph,
        )


LLM_CONTENT_TYPE_MAPPING: Mapping[int, LLMSlideContentModel] = {
    TYPE1: LLMType1Content,
    TYPE2: LLMType2Content,
    TYPE3: LLMType3Content,
    TYPE4: LLMType4Content,
    TYPE5: LLMType5Content,
    TYPE6: LLMType6Content,
    TYPE7: LLMType7Content,
    TYPE8: LLMType8Content,
    TYPE9: LLMType9Content,
}


class LLMSlideModel(BaseModel):
    type: int
    content: (
        LLMType1Content
        | LLMType2Content
        | LLMType4Content
        | LLMType5Content
        | LLMType6Content
        | LLMType7Content
        | LLMType8Content
        | LLMType9Content
    )


class LLMPresentationModel(BaseModel):
    slides: list[LLMSlideModel]
