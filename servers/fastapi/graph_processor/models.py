from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, model_validator

from graph_processor.utils import clip_text


class PointModel(BaseModel):
    x: float
    y: float

    def to_list(self) -> List[float]:
        return [self.x, self.y]


class PointWithRadius(PointModel):
    radius: Optional[float] = None


class BarSeriesModel(BaseModel):
    name: str
    data: List[float] = Field(
        description="Only numbers should be given out in data. Don't include text/string in data."
    )

    def get_name(self) -> str:
        return clip_text(self.name)


class ScatterSeriesModel(BaseModel):
    name: str
    points: List[PointModel]

    def get_name(self) -> str:
        return clip_text(self.name)


class BubbleSeriesModel(BaseModel):
    name: str
    points: List[PointWithRadius]

    def get_name(self) -> str:
        return clip_text(self.name)


class LineSeriesModel(BaseModel):
    name: str
    data: List[float] = Field(
        description="Only numbers should be given out in data. Don't include text/string in data."
    )

    def get_name(self) -> str:
        return clip_text(self.name)


class PieChartSeriesModel(BaseModel):
    data: List[float]


class BarGraphDataModel(BaseModel):
    categories: List[str]
    series: List[BarSeriesModel] = Field(
        description="There should be no more than 3 series"
    )

    def get_categories(self) -> List[str]:
        return [clip_text(category) for category in self.categories]


class ScatterChartDataModel(BaseModel):
    series: List[ScatterSeriesModel]


class BubbleChartDataModel(BaseModel):
    series: List[BubbleSeriesModel]


class LineChartDataModel(BaseModel):
    categories: List[str]
    series: List[LineSeriesModel] = Field(
        description="There should be no more than 3 series"
    )

    def get_categories(self) -> List[str]:
        return [clip_text(category) for category in self.categories]


class PieChartDataModel(BaseModel):
    categories: List[str]
    series: List[PieChartSeriesModel] = Field(
        description="One series model with list of data",
        min_length=1,
    )

    @model_validator(mode="after")
    def limit_series(self):
        self.series = self.series[:1]
        return self

    def get_categories(self) -> List[str]:
        return [clip_text(category) for category in self.categories]


# class TableDataModel(BaseModel):
#     categories: List[str]
#     series: List[BarSeriesModel]

#     def get_categories(self) -> List[str]:
#         return [clip_text(category) for category in self.categories]


class GraphTypeEnum(Enum):
    pie = "pie"
    bar = "bar"
    line = "line"


class GraphModel(BaseModel):
    style: Optional[dict] = {}
    name: str
    type: GraphTypeEnum
    unit: Optional[str] = Field(
        description="Unit of the data in the graph. Example: %, kg, million USD, tonnes, etc."
    )
    data: PieChartDataModel | LineChartDataModel | BarGraphDataModel


GRAPH_TYPE_MAPPING = {
    GraphTypeEnum.pie: PieChartDataModel,
    GraphTypeEnum.bar: BarGraphDataModel,
    GraphTypeEnum.line: LineChartDataModel,
}
