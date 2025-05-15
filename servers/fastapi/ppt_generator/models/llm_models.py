from typing import List, Mapping
from pydantic import BaseModel, Field

from graph_processor.models import GraphModel
from ppt_generator.models.content_type_models import SlideContentModel
from ppt_generator.models.other_models import SlideType


class LLMHeadingModel(BaseModel):
    heading: str = Field(
        description="List item heading to show in slide body",
        max_length=35,
    )
    description: str = Field(
        description="Description of list item in less than 20 words.",
        max_length=180,
        min_length=100,
    )


class LLMIconQueryCollectionModel(BaseModel):
    queries: List[str] = Field(
        description="Multiple queries to generate simillar icons matching heading and description"
    )


class LLMSlideContentModel(BaseModel):
    title: str = Field(description="Title of the slide")

    @classmethod
    def get_notes(cls) -> str:
        return ""


class LLMType1Content(LLMSlideContentModel):
    body: str = Field(
        description="Slide content summary in less than 15 words. This will be shown in text box in slide.",
        max_length=230,
        min_length=150,
    )
    image_prompts: List[str] = Field(
        description="Prompt used to generate image for this slide. Only one prompt is allowed.",
        min_length=1,
        max_length=1,
    )


class LLMType2Content(LLMSlideContentModel):
    body: List[LLMHeadingModel] = Field(
        "List items to show in slide's body",
        min_length=1,
        max_length=4,
    )

    @classmethod
    def get_notes(cls):
        return """
        - The **Body** should include **1 to 4 HeadingModels**.  
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """


class LLMType3Content(LLMSlideContentModel):
    body: List[LLMHeadingModel] = Field(
        "List items to show in slide's body",
        min_length=3,
        max_length=3,
    )
    image_prompts: List[str] = Field(
        description="Prompt used to generate image for this slide",
        min_length=1,
        max_length=1,
    )

    @classmethod
    def get_notes(cls):
        return """
        - The **Body** should include **3 HeadingModels**.  
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """


class LLMType4Content(LLMSlideContentModel):
    body: List[LLMHeadingModel] = Field(
        "List items to show in slide's body",
        min_length=1,
        max_length=3,
    )
    image_prompts: List[str] = Field(
        description="Prompts used to generate image for each item in body",
        min_length=1,
        max_length=3,
    )

    @classmethod
    def get_notes(cls):
        return """
        - The **Body** should include **1 to 3 HeadingModels**.  
        - **Image prompts** should contain one prompt for each item in body.
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """


class LLMType5Content(LLMSlideContentModel):
    body: str = Field(
        description="Slide content summary in less than 15 words. This will be shown in text box in slide.",
        max_length=230,
        min_length=150,
    )
    graph: GraphModel = Field(description="Graph to show in slide")


class LLMType6Content(LLMSlideContentModel):
    description: str = Field(
        description="Slide content summary in less than 15 words. This will be shown in text box in slide.",
    )
    body: List[LLMHeadingModel] = Field(
        description="List items to show in slide's body",
        min_length=1,
        max_length=3,
    )

    @classmethod
    def get_notes(cls):
        return """
        - The **Body** should include **1 to 3 HeadingModels**.  
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """


class LLMType7Content(LLMSlideContentModel):
    body: List[LLMHeadingModel] = Field(
        description="List items to show in slide's body",
        min_length=1,
        max_length=4,
    )
    icon_queries: List[LLMIconQueryCollectionModel] = Field(
        description="One icon query collection model for every item in body to search icon",
        min_length=1,
        max_length=4,
    )

    @classmethod
    def get_notes(cls):
        return """
        - The **Body** should include **1 to 4 HeadingModels**.  
        - Each **IconQueryCollectionModel** must contain 3 *queries*.
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """


class LLMType8Content(LLMSlideContentModel):
    description: str = Field(
        description="Slide content summary in less than 15 words. This will be shown in text box in slide.",
        max_length=230,
        min_length=150,
    )
    body: List[LLMHeadingModel] = Field(
        "List items to show in slide's body",
        min_length=1,
        max_length=3,
    )
    icon_queries: List[LLMIconQueryCollectionModel] = Field(
        description="One icon query collection model for every item in body to search icon"
    )

    @classmethod
    def get_notes(cls):
        return """
        - The **Body** should include **1 to 3 HeadingModels**.  
        - Each **IconQueryCollectionModel** must contain 3 *queries*.
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """


class LLMType9Content(LLMSlideContentModel):
    body: List[LLMHeadingModel] = Field(
        "List items to show in slide's body",
        min_length=1,
        max_length=3,
    )
    graph: GraphModel = Field(description="Graph to show in slide")

    @classmethod
    def get_notes(cls):
        return """
        - The **Body** should include **1 to 3 HeadingModels**.  
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """


LLM_CONTENT_TYPE_MAPPING: Mapping[SlideType, LLMSlideContentModel] = {
    SlideType.type1: LLMType1Content,
    SlideType.type2: LLMType2Content,
    SlideType.type3: LLMType3Content,
    SlideType.type4: LLMType4Content,
    SlideType.type5: LLMType5Content,
    SlideType.type6: LLMType6Content,
    SlideType.type7: LLMType7Content,
    SlideType.type8: LLMType8Content,
    SlideType.type9: LLMType9Content,
}


class LLMSlideModel(BaseModel):
    type: SlideType
    content: (
        LLMType1Content
        | LLMType2Content
        | LLMType3Content
        | LLMType4Content
        | LLMType5Content
        | LLMType6Content
        | LLMType7Content
        | LLMType8Content
        | LLMType9Content
    )


class LLMPresentationModel(BaseModel):
    title: str
    n_slides: int
    titles: list[str]
    slides: list[LLMSlideModel]
