from enum import Enum
from typing import Annotated, List, Optional
from annotated_types import Len
from pydantic import BaseModel
from pptx.util import Pt
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_AUTO_SHAPE_TYPE, MSO_CONNECTOR_TYPE

from graph_processor.models import GraphModel


class PptxBoxShapeEnum(Enum):
    RECTANGLE = "rectangle"
    CIRCLE = "circle"


class PptxObjectFitEnum(Enum):
    CONTAIN = "contain"
    COVER = "cover"
    FILL = "fill"


class PptxSpacingModel(BaseModel):
    top: int = 0
    bottom: int = 0
    left: int = 0
    right: int = 0

    @classmethod
    def all(cls, num: int):
        return PptxSpacingModel(top=num, left=num, bottom=num, right=num)


class PptxPositionModel(BaseModel):
    left: int = 0
    top: int = 0
    width: int = 0
    height: int = 0

    @classmethod
    def for_textbox(cls, left: int, top: int, width: int):
        return cls(left=left, top=top, width=width, height=100)

    def to_pt_list(self) -> List[int]:
        return [Pt(self.left), Pt(self.top), Pt(self.width), Pt(self.height)]

    def to_pt_xyxy(self) -> List[int]:
        return [
            Pt(self.left),
            Pt(self.top),
            Pt(self.left + self.width),
            Pt(self.top + self.height),
        ]


class PptxFontModel(BaseModel):
    name: str = "Inter"
    size: int = 16
    bold: bool = False
    italic: bool = False
    color: str = "000000"


class PptxFillModel(BaseModel):
    color: str


class PptxStrokeModel(BaseModel):
    color: str
    thickness: float


class PptxShadowModel(BaseModel):
    radius: int
    offset: int = 0
    color: str = "000000"
    opacity: float = 0.5
    angle: int = 0


class PptxTextRunModel(BaseModel):
    text: str
    font: Optional[PptxFontModel] = None


class PptxParagraphModel(BaseModel):
    spacing: Optional[PptxSpacingModel] = None
    alignment: Optional[PP_ALIGN] = None
    font: Optional[PptxFontModel] = None
    text: Optional[str] = None
    text_runs: Optional[List[PptxTextRunModel]] = None


class PptxObjectFitModel(BaseModel):
    fit: Optional[PptxObjectFitEnum] = None
    focus: Optional[
        Annotated[List[Optional[float]], Len(min_length=2, max_length=2)]
    ] = None


class PptxPictureModel(BaseModel):
    is_network: bool
    path: str


class PptxShapeModel(BaseModel):
    pass


class PptxTextBoxModel(PptxShapeModel):
    margin: Optional[PptxSpacingModel] = None
    fill: Optional[PptxFillModel] = None
    position: PptxPositionModel
    text_wrap: bool = True
    paragraphs: List[PptxParagraphModel]


class PptxAutoShapeBoxModel(PptxShapeModel):
    type: MSO_AUTO_SHAPE_TYPE = MSO_AUTO_SHAPE_TYPE.RECTANGLE
    margin: Optional[PptxSpacingModel] = None
    fill: Optional[PptxFillModel] = None
    stroke: Optional[PptxStrokeModel] = None
    shadow: Optional[PptxShadowModel] = None
    position: PptxPositionModel
    text_wrap: bool = True
    border_radius: Optional[int] = None
    paragraphs: Optional[List[PptxParagraphModel]] = None


class PptxPictureBoxModel(PptxShapeModel):
    position: PptxPositionModel
    margin: Optional[PptxSpacingModel] = None
    clip: bool = True
    overlay: Optional[str] = None
    border_radius: Optional[List[int]] = None
    shape: Optional[PptxBoxShapeEnum] = None
    object_fit: Optional[PptxObjectFitModel] = None
    picture: PptxPictureModel


class PptxGraphBoxModel(PptxShapeModel):
    position: PptxPositionModel
    category_font: Optional[PptxFontModel] = None
    value_font: Optional[PptxFontModel] = None
    legend_font: Optional[PptxFontModel] = None
    graph: GraphModel


class PptxConnectorModel(PptxShapeModel):
    type: MSO_CONNECTOR_TYPE = MSO_CONNECTOR_TYPE.STRAIGHT
    position: PptxPositionModel
    thickness: float = 0.5
    color: str = "000000"


class PptxSlideModel(BaseModel):
    shapes: List[
        PptxTextBoxModel
        | PptxAutoShapeBoxModel
        | PptxConnectorModel
        | PptxPictureBoxModel
        | PptxGraphBoxModel
    ]


class PptxPresentationModel(BaseModel):
    # theme: PresentationTheme
    # watermark: bool
    background_color: str
    shapes: Optional[List[PptxShapeModel]] = None
    slides: List[PptxSlideModel]
