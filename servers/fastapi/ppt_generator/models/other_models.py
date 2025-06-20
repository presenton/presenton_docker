from pydantic import BaseModel, Field

# 1. contains title, description and an image.
TYPE1 = 1
# 2. contains title and list of items.
TYPE2 = 2
# 3. contains title, list of items and an image.
TYPE3 = 3
# 4. contains title and list of items and multiple images.
TYPE4 = 4
# 5. contains title, description and a graph.
TYPE5 = 5
# 6. contains title, description and list of items.
TYPE6 = 6
# 7. contains title, list of items and icons.
TYPE7 = 7
# 8. contains title, description, list of items and icons.
TYPE8 = 8
# 9. contains title, list of items and a graph.
TYPE9 = 9


class SlideTypeModel(BaseModel):
    slide_type: int = Field(gte=1, lte=9, description="Slide type from 1 to 9")
