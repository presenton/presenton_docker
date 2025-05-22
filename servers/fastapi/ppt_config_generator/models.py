from typing import List
from pydantic import BaseModel, Field



class PresentationTitlesModel(BaseModel):
    presentation_title: str = Field("Title of this presentation in about 3 to 8 words")
    titles: List[str] = Field(
        description="List of title of every slide in presentation in about 2 to 8 words"
    )
