import { Slide } from "../types/slide";
import Type1Mini from "./mini-slides/Type1Mini";
import Type4Mini from "./mini-slides/Type4Mini";
import Type2Mini from "./mini-slides/Type2Mini";
import Type1Layout from "./slide_layouts/Type1Layout";
import Type2Layout from "./slide_layouts/Type2Layout";
import Type4Layout from "./slide_layouts/Type4Layout";
import Type5Layout from "./slide_layouts/Type5Layout";
import Type6Layout from "./slide_layouts/Type6Layout";
import Type7Layout from "./slide_layouts/Type7Layout";
import Type8Layout from "./slide_layouts/Type8Layout";
import Type9Layout from "./slide_layouts/Type9Layout";
import Type7Mini from "./mini-slides/Type7Mini";
import Type6Mini from "./mini-slides/Type6Mini";
import Type5Mini from "./mini-slides/Type5Mini";
import Type9Mini from "./mini-slides/Type9Mini";
import Type8Mini from "./mini-slides/Type8Mini";

import { Chart, ChartSettings } from "@/store/slices/presentationGeneration";

import { Pie, PieChart, Cell, CartesianGrid, Label } from "recharts";
import {
  LineChart,
  Bar,
  Legend,
  BarChart,
  Tooltip,
  YAxis,
  Line,
  XAxis,
} from "recharts";
import { ResponsiveContainer } from "recharts";

import { ThemeColors } from "../store/themeSlice";
import { isDarkColor } from "../utils/others";

import {
  formatTooltipValue,
  formatYAxisTick,
  transformedData,
} from "../utils/chart";

export const renderSlideContent = (slide: Slide, language: string) => {
  switch (slide.type) {
    case 1:
      return (
        <Type1Layout
          slideIndex={slide.index}
          title={slide.content.title}
          slideId={slide.id}
          description={
            typeof slide.content.body === "string"
              ? slide.content.body
              : slide.content.body[0]?.description || ""
          }
          images={slide.images || []}
          image_prompts={slide.content.image_prompts || []}
          properties={slide.properties}
        />
      );
    case 2:
      return (
        <Type2Layout
          title={slide.content.title}
          slideId={slide.id}
          slideIndex={slide.index}
          body={Array.isArray(slide.content.body) ? slide.content.body : []}
          language={language || "English"}
          design_index={slide.design_index || 2}
        />
      );

    case 4:
      return (
        <Type4Layout
          title={slide.content.title}
          slideId={slide.id}
          slideIndex={slide.index}
          images={slide.images || []}
          body={Array.isArray(slide.content.body) ? slide.content.body : []}
          image_prompts={slide.content.image_prompts || []}
          properties={slide.properties}
        />
      );

    case 5:
      const isFullSizeGraph =
        slide.content.graph?.data.categories.length > 4 &&
        slide.content.graph.type !== "pie";
      return (
        <Type5Layout
          title={slide.content.title}
          slideId={slide.id}
          slideIndex={slide.index}
          description={(slide.content.body as string) || ""}
          isFullSizeGraph={isFullSizeGraph}
          graphData={slide.content.graph}
        />
      );

    case 6:
      return (
        <Type6Layout
          title={slide.content.title}
          slideId={slide.id}
          slideIndex={slide.index}
          description={slide.content.description || ""}
          body={Array.isArray(slide.content.body) ? slide.content.body : []}
          language={language || "English"}
        />
      );

    case 7:
      return (
        <Type7Layout
          title={slide.content.title}
          slideId={slide.id}
          slideIndex={slide.index}
          body={Array.isArray(slide.content.body) ? slide.content.body : []}
          icons={slide.icons || []}
          icon_queries={slide.content.icon_queries || []}
        />
      );

    case 8:
      return (
        <Type8Layout
          title={slide.content.title}
          slideId={slide.id}
          body={Array.isArray(slide.content.body) ? slide.content.body : []}
          slideIndex={slide.index}
          description={slide.content.description || ""}
          icons={slide.icons || []}
          icon_queries={slide.content.icon_queries || []}
        />
      );

    case 9:
      return (
        <Type9Layout
          slideIndex={slide.index}
          slideId={slide.id}
          title={slide.content.title}
          // @ts-ignore
          body={slide.content.body}
          language={language || "English"}
          graphData={slide.content.graph}
        />
      );


    default:
      return null;
  }
};

export const renderMiniSlideContent = (slide: Slide) => {
  const { type, content } = slide;

  switch (type) {
    case 1:
      return (
        <Type1Mini
          title={content.title}
          description={
            typeof slide.content.body === "string"
              ? slide.content.body
              : slide.content.body[0]?.description || ""
          }
          image={slide.images?.[0] || ""}
        />
      );
    case 2:
      return (
        <Type2Mini
          title={slide.content.title}
          body={Array.isArray(slide.content.body) ? slide.content.body : []}
          design_index={slide.design_index || 2}
        />
      );
    case 4:
      return (
        <Type4Mini
          title={slide.content.title}
          body={Array.isArray(slide.content.body) ? slide.content.body : []}
          images={slide.images || []}
        />
      );
    case 5:
      const isFullSizeGraph =
        slide.content.graph?.data.categories.length > 4 &&
        slide.content.graph.type !== "pie";
      return (
        <Type5Mini
          title={slide.content.title}
          isFullSizeGraph={isFullSizeGraph}
          description={(slide.content.body as string) || ""}
          chartData={slide.content.graph!}
          slideIndex={slide.index}
        />
      );
    case 6:
      return (
        <Type6Mini
          title={slide.content.title}
          description={slide.content.description || ""}
          body={Array.isArray(slide.content.body) ? slide.content.body : []}
        />
      );
    case 7:
      return (
        <Type7Mini
          title={slide.content.title}
          body={Array.isArray(slide.content.body) ? slide.content.body : []}
          icons={slide.icons || []}
        />
      );
    case 8:
      return (
        <Type8Mini
          title={slide.content.title}
          description={slide.content.description || ""}
          body={Array.isArray(slide.content.body) ? slide.content.body : []}
          icons={slide.icons || []}
        />
      );
    case 9:
      return (
        <Type9Mini
          title={slide.content.title}
          // @ts-ignore
          body={slide.content.body}
          chartData={slide.content.graph!}
          slideIndex={slide.index}
        />
      );

    default:
      return null;
  }
};

// CHART RENDERING
export const renderChart = (
  localChartData: Chart,
  isMini: boolean = false,
  theme: ThemeColors,
  chartSettings?: ChartSettings
) => {
  const chartColors = theme.chartColors || [];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const isDark = isDarkColor(theme.chartColors[index % chartColors.length]);

    return (
      <text
        x={x}
        y={y}
        fill={isDark ? "#ffffff" : "#000000"}
        style={{ cursor: "pointer" }}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // New function for outside labels
  const renderOutsideLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name,
  }: any) => {
    const RADIAN = Math.PI / 180;
    // Position the label further outside the pie
    const radius = outerRadius * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={theme.slideTitle}
        style={{ cursor: "pointer" }}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (!localChartData) return null;
  switch (localChartData.type) {
    case "line":
      return (
        <ResponsiveContainer
          id="line-chart-container"
          width="100%"
          height={isMini ? 100 : 300}
        >
          <LineChart
            className="w-full"
            data={transformedData(localChartData)}
            style={{ cursor: "pointer" }}
            margin={{ bottom: !isMini ? 30 : 0, right: 30, left: 10, top: 20 }}
          >
            {chartSettings?.showGrid && (
              <CartesianGrid
                vertical={false}
                stroke={theme.slideDescription}
                opacity={0.2}
              />
            )}
            {!isMini && chartSettings?.showAxisLabel && (
              <XAxis
                dataKey="name"
                tickSize={10}
                angle={-10}
                height={!isMini ? 30 : 0}
                interval={0}
                dy={!isMini ? 10 : 0}
                dx={!isMini ? -15 : 0}
                tick={{
                  fill: theme.slideTitle,
                  fontSize: 14,
                  alignmentBaseline: "middle",
                }}
              />
            )}
            {!isMini && chartSettings?.showAxisLabel && (
              <YAxis
                tick={{ fill: theme.slideTitle }}
                tickFormatter={formatYAxisTick}
                padding={{ top: 15 }}
              >
                <Label
                  value={localChartData.unit || ""}
                  position="top"
                  style={{
                    textTransform: "capitalize",
                    textAnchor: "start",
                    fontSize: "16px",
                    fill: theme.slideTitle,
                    fontWeight: "bold",
                  }}
                />
              </YAxis>
            )}
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: theme.slideBox,
                color: theme.slideTitle,
                border: "none",
              }}
              itemStyle={{
                color: theme.slideTitle,
              }}
            />
            {!isMini && chartSettings?.showLegend && (
              <Legend verticalAlign="top" align="center" />
            )}
            {localChartData.data.series.map((serie, index) => (
              <Line
                isAnimationActive={false}
                key={serie.name || `Series ${index + 1}`}
                type="monotone"
                strokeWidth={2}
                dataKey={serie.name || `Series ${index + 1}`}
                stroke={chartColors[index % chartColors.length]}
                style={{ cursor: "pointer" }}
              // label={(chartSettings?.showDataLabel && localChartData.data.series.length === 1) ? {
              //     position: chartSettings?.dataLabel.dataLabelPosition === "Outside" ? "top" : "center",
              //     formatter: (value: number) => formatYAxisTick(value),
              //     fill: chartSettings?.dataLabel.dataLabelPosition === "Outside" ? theme.slideTitle : '#ffffff',
              //     fontWeight: 'bold',
              //     fontSize: '12px',
              //     fontFamily: theme.fontFamily
              // } : undefined}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );

    case "pie":
      return (
        <ResponsiveContainer
          id="pie-chart-container"
          width="100%"
          height={isMini ? 100 : 300}
        >
          <PieChart>
            <Pie
              isAnimationActive={false}
              data={transformedData(localChartData)}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              style={{ cursor: "pointer" }}
              label={
                chartSettings?.showDataLabel
                  ? chartSettings?.dataLabel.dataLabelPosition === "Inside"
                    ? renderCustomizedLabel
                    : renderOutsideLabel
                  : false
              }
              fill={theme.slideTitle}
              paddingAngle={2}
              labelLine={false}
              outerRadius={
                chartSettings?.dataLabel.dataLabelPosition === "Outside"
                  ? "80%"
                  : "90%"
              }
            >
              {transformedData(localChartData).map((entry: any, index: any) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                  focusable={false}
                  stroke="none"
                  style={{
                    border: "none",
                    outline: "none",
                    cursor: "pointer",
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) =>
                formatTooltipValue(localChartData, value as number)
              }
              contentStyle={{
                backgroundColor: theme.slideBox,
                color: theme.slideTitle,
                border: "none",
                borderRadius: "6px",
              }}
              itemStyle={{
                color: theme.slideTitle,
              }}
            />
            {!isMini && chartSettings?.showLegend && (
              <Legend verticalAlign="top" align="center" />
            )}
          </PieChart>
        </ResponsiveContainer>
      );

    case "bar":
    default:
      return (
        <ResponsiveContainer
          id="bar-chart-container"
          width="100%"
          height={isMini ? 100 : 330}
        >
          <BarChart
            data={transformedData(localChartData)}
            margin={{ bottom: !isMini ? 30 : 0, top: 20 }}
          >
            {chartSettings?.showGrid && (
              <CartesianGrid
                vertical={false}
                stroke={theme.slideDescription}
                opacity={0.2}
              />
            )}
            {!isMini && chartSettings?.showAxisLabel && (
              <XAxis
                stroke={theme.slideTitle}
                className=""
                dataKey="name"
                tickSize={10}
                angle={-10}
                height={!isMini ? 40 : 0}
                interval={0}
                dy={!isMini ? 20 : 0}
                dx={!isMini ? -10 : 0}
                tick={{
                  fill: theme.slideTitle,
                  fontSize: 14,
                  alignmentBaseline: "middle",
                }}
              />
            )}
            {!isMini && chartSettings?.showAxisLabel && (
              <YAxis
                stroke={theme.slideTitle}
                tick={{ fill: theme.slideTitle }}
                tickFormatter={formatYAxisTick}
                padding={{ top: 20 }}
              >
                <Label
                  value={localChartData.unit || ""}
                  position="top"
                  style={{
                    textTransform: "capitalize",
                    textAnchor: "start",
                    fontSize: "16px",
                    fill: theme.slideTitle,
                    fontWeight: "bold",
                    width: "fit",
                    margin: "0 auto",
                  }}
                />
              </YAxis>
            )}
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: theme.slideBox,
                color: theme.slideTitle,
                border: "none",
              }}
              itemStyle={{
                color: theme.slideTitle,
              }}
            />
            {!isMini && chartSettings?.showLegend && (
              <Legend verticalAlign="top" align="center" />
            )}
            {localChartData &&
              localChartData.data &&
              localChartData.data.series &&
              localChartData.data.series.map((serie, index) => (
                <Bar
                  isAnimationActive={false}
                  key={serie.name || `Series ${index + 1}`}
                  dataKey={serie.name || `Series ${index + 1}`}
                  fill={chartColors[index % chartColors.length]}
                  barSize={50}
                  style={{ cursor: "pointer" }}
                  radius={[5, 8, 0, 0]}
                  label={
                    chartSettings?.showDataLabel
                      ? {
                        position:
                          chartSettings?.dataLabel.dataLabelPosition ===
                            "Outside"
                            ? "top"
                            : chartSettings?.dataLabel.dataLabelAlignment ===
                              "Base"
                              ? "insideBottom"
                              : chartSettings?.dataLabel.dataLabelAlignment ===
                                "Center"
                                ? "center"
                                : "insideTop",
                        formatter: (value: number) => formatYAxisTick(value),
                        fill:
                          chartSettings?.dataLabel.dataLabelPosition ===
                            "Outside"
                            ? theme.slideTitle
                            : "#ffffff",
                        fontWeight: "bold",
                        fontSize: "14px",
                        fontFamily: theme.fontFamily,
                      }
                      : undefined
                  }
                />
              ))}
          </BarChart>
        </ResponsiveContainer>
      );
  }
};
