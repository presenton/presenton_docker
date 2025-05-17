from enum import Enum
from pydantic import BaseModel, Field


# """
# 1. contains title, description and an image.
# 2. contains title and list of items.
# 3. contains title, list of items and an image.
# 4. contains title and list of items and multiple images.
# 5. contains title, description and a graph.
# 6. contains title, description and list of items.
# 7. contains title, list of items and icons.
# 8. contains title, description, list of items and icons.
# 9. contains title, list of items and a graph.
# """


class SlideType(Enum):
    type1 = 1
    type2 = 2
    type3 = 3
    type4 = 4
    type5 = 5
    type6 = 6
    type7 = 7
    type8 = 8
    type9 = 9


class SlideTypeModel(BaseModel):
    slide_type: int = Field(
        default=1, gte=1, lte=9, description="Slide type from 1 to 9"
    )
