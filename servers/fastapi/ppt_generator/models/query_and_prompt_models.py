from enum import Enum
from typing import Optional

from pydantic import BaseModel

from ppt_generator.models.content_type_models import IconQueryCollectionModel


class ImageAspectRatio(Enum):
    r_1_1 = "1:1"
    r_3_2 = "3:2"
    r_2_3 = "2:3"
    r_5_4 = "5:4"
    r_4_5 = "4:5"
    r_16_9 = "16:9"
    r_9_16 = "9:16"
    r_21_9 = "21:9"
    r_9_21 = "9:21"


class ImagePromptWithThemeAndAspectRatio(BaseModel):
    theme_prompt: str
    image_prompt: str
    aspect_ratio: ImageAspectRatio


class IconFrameEnum(Enum):
    filled_rounded_rectangle = 1
    filled_circle = 2


class IconCategoryEnum(Enum):
    solid = "solid"
    semi_solid = "semi-solid"
    outline = "outline"


class IconQueryCollectionWithData(BaseModel):
    category: IconCategoryEnum = IconCategoryEnum.solid
    index: int
    theme: Optional[dict] = None
    icon_query: IconQueryCollectionModel
