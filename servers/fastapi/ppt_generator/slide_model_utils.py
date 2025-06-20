from typing import List, Optional
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
from ppt_generator.models.query_and_prompt_models import (
    IconCategoryEnum,
    IconQueryCollectionWithData,
    ImageAspectRatio,
    ImagePromptWithThemeAndAspectRatio,
)
from ppt_generator.models.slide_model import SlideModel

SLIDES_WITHOUT_IMAGES = [
    TYPE2,
    TYPE5,
    TYPE6,
    TYPE7,
    TYPE8,
    TYPE9,
]

SLIDES_WITHOUT_ICONS = [
    TYPE1,
    TYPE2,
    TYPE3,
    TYPE4,
    TYPE5,
    TYPE6,
    TYPE9,
]


THEME_PROMPTS = {
    "cream": "elegant with a classic and professional look. Subtle and minimalist using a warm palette of cream, beige, and light beige colors",
    "royal-blue": "playful and creative, bold and loud with a futuristic touch, using a gradient of vibrant colors including blue, purple, and royal blue",
    "light-red": "fun and organic with a playful and inspirational aesthetic, featuring pastel colors like pink, coral, and orange for a vibrant and warm feel",
    "dark-pink": "inspirational and creative with a youthful and playful tone, featuring light, pastel colors including blue, pink, and purple, all blending in a vibrant gradient",
    "faint-yellow": "Fresh young creatively vibrant style, utilizing a playful mixture of light colors like orange, salmon, and pastel purple, all set against a warm gradient.",
    "dark": "Luxurious and futuristic with a simple, clean design. Professional yet elegant using a color scheme of dark, black, and high contrast.",
    "light": "Classy and modern with a corporate and minimalist touch. Tone is serious yet elegant, using a palette of light, white, and cool gray colors.",
}


class SlideModelUtils:
    def __init__(self, theme: Optional[dict], model: SlideModel):
        self.theme = theme
        self.model = model
        self.type = model.type
        self.content = model.content

    def get_image_prompts(self) -> List[ImagePromptWithThemeAndAspectRatio]:
        theme_prompt = THEME_PROMPTS.get(self.theme["name"], "") if self.theme else ""
        if self.type in SLIDES_WITHOUT_IMAGES:
            return []

        aspect_ratio = ImageAspectRatio.r_1_1

        if self.type is TYPE3:
            aspect_ratio = ImageAspectRatio.r_2_3

        elif self.type is TYPE4:
            count = len(self.content.body)
            aspect_ratio = (
                ImageAspectRatio.r_5_4 if count == 3 else ImageAspectRatio.r_21_9
            )

        return [
            ImagePromptWithThemeAndAspectRatio(
                image_prompt=each,
                aspect_ratio=aspect_ratio,
                theme_prompt=theme_prompt,
            )
            for each in self.content.image_prompts
        ]

    def get_icon_queries(self) -> List[IconQueryCollectionWithData]:
        if self.type in SLIDES_WITHOUT_ICONS:
            return []

        category = IconCategoryEnum.solid

        if len(self.content.body) == 3:
            category = IconCategoryEnum.outline

        return [
            IconQueryCollectionWithData(
                category=category,
                index=index,
                theme=self.theme,
                icon_query=each_query,
            )
            for index, each_query in enumerate(self.content.icon_queries)
        ]
