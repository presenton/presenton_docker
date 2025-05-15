from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

from ppt_generator.models.other_models import SlideType


class TitleWithGraphIdModel(BaseModel):
    title: str = Field(description="Title of slide containing graph")
    graph_id: Optional[str] = Field(
        default=None, description="Id of graph present in this slide"
    )


class TitleWithGraphIdCollectionModel(BaseModel):
    items: List[TitleWithGraphIdModel]


class PresentationTitlesModel(BaseModel):
    presentation_title: str = Field("Title of this presentation in about 3 to 8 words")
    titles: List[str] = Field(
        description="List of title of every slide in presentation in about 2 to 8 words"
    )
    # content: Optional[str] = Field(
    #     default=None,
    #     description="In-depth content extracted from prompt, images and documents in about 500 words in Markdown format",
    # )


infographics_description = """
    Complete description of infographics charts in this slide.     
    - Give out numbers and metrics with brief expalanation for the number.
    - This field should only be populated for slide type 10 and 11.  
    - Be verbose in more than 60 words.
    - Do not hallucinate or make up numbers for infographics.
    - Do not give out the information with no numbers.
    Examples of infographics_information: 
        1) Hillary's project completion increased to 35% and is expected to be finished by June 10th. On the other hand, Simon's project completion reached 80% and is expected to be completed by July 20th.
        2) The customer support ticket resolution rate increased to 75%, with 375 out of 500 tickets resolved, indicating strong progress. Meanwhile, the employee training program completion reached 3 out of 5 modules, with the remaining sessions expected to conclude by May 1st. On the other hand, the product development cycle progressed to 60%, with testing set to begin by June 20th.
        3) The monthly sales target reached $3,500, demonstrating strong progress toward the goal.
        4) The monthly sales target reached 85%, with $8,500 achieved out of a $10,000 goal, demonstrating strong progress. This indicates a steady upward trend in sales, with only $1,500 remaining to reach full completion. 
"""

graph_description = """
    Name of graph to be represented in this slide along with how it will be represented. It can be one or numtiple slides.
    Examples  graph_information: - Graph "Vehicle Type Statistics" in whole as a bar graph
              - Table "Survey Result of 2024" from june to december as line chart
              - Graph "Customer Satisfaction" in whole as a pie chart, also add 
    **Do not include graphs  that were not submitted.**
"""


class BasicSlideConfiguration(BaseModel):
    title: str = Field("Title of this slide")
    info: str = Field(
        "Content and info for this slide in more than **200 words**. Give information in this format 1) 70 words about what this slides should signify. 2) another 70 words about the contents on the slide. 3) Another 70 words about elements of the slide."
    )
    type: SlideType
    graph_information: Optional[str] = Field(
        default=None, description=graph_description
    )
    infographics_numbers: Optional[str] = Field(
        description=infographics_description, default=None
    )


class PresentationConfigurationModel(BaseModel):
    language: str = Field(description="Language of the presentation")
    number_of_slides: int = Field(description="Number of slides in the presentation")
    slides: List[BasicSlideConfiguration]
