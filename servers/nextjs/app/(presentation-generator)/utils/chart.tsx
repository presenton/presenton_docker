import { formatLargeNumber } from "@/lib/utils";
import { Chart } from "@/store/slices/presentationGeneration";

export const formatTooltipValue = (localChartData: Chart, value: number) => {
  const formattedValue = formatLargeNumber(value);
  if (localChartData.postfix) {
    return `${formattedValue}${localChartData.postfix}`;
  }
  return formattedValue;
};
export const transformedData = (localChartData: Chart) => {
  if (!localChartData) return [];
  if (!localChartData.data || localChartData.data.categories.length === 0)
    return [];
  if (localChartData && localChartData.type === "pie") {
    return localChartData.data.categories.map((category, index) => ({
      name: category,
      value: localChartData.data.series[0].data[index],
      actualValue: localChartData.data.series[0].data[index],
      seriesName: localChartData.data.series[0].name || "Series 1",
    }));
  } else {
    return localChartData.data.categories.map((category, index) => {
      const dataPoint: any = { name: category };
      localChartData.data.series.forEach((serie) => {
        const seriesName = serie.name || "Series";
        dataPoint[seriesName] = serie.data[index];
        dataPoint[`${seriesName}Value`] = serie.data[index];
      });
      return dataPoint;
    });
  }
};

export const formatYAxisTick = (value: number) => {
  if (value >= 1_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toFixed(0)}T`;
  } else if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(0)}B`;
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(0)}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}k`;
  }
  return value.toString();
};
