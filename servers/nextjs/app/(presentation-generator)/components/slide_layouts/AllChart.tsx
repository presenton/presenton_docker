import React, { useState, useEffect } from "react";
import ChartEditor from "../ChartEditor";
import { StoreChartData } from "../../utils/chartDataTransforms";
import { useDispatch, useSelector } from "react-redux";
import {
  ChartSettings,
  updateSlideChart,
  updateSlideChartSettings,
} from "@/store/slices/presentationGeneration";
import { renderChart } from "../slide_config";
import { RootState } from "@/store/store";

interface AllChartProps {
  chartData: StoreChartData;
  slideIndex: number;
}

const AllChart = ({
  chartData: initialChartData,
  slideIndex,
}: AllChartProps) => {
  const dispatch = useDispatch();
  const [localChartData, setLocalChartData] =
    useState<StoreChartData>(initialChartData);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { currentColors } = useSelector((state: RootState) => state.theme);

  // Use chart settings from the Redux store
  const chartSettings = useSelector((state: RootState) => {
    const slide =
      state.presentationGeneration?.presentationData?.slides[slideIndex];


    const style = slide?.content.graph.style || {};
    return Object.keys(
      style === null || style === undefined ? {} : (style as ChartSettings)
    ).length > 0
      ? (style as ChartSettings)
      : {
        showLegend: false,
        showGrid: false,
        showAxisLabel: true,
        showDataLabel: true,
        dataLabel: {
          dataLabelPosition:
            slide?.content.graph.type === "pie"
              ? ("Outside" as const)
              : ("Inside" as const),
          dataLabelAlignment: "Center" as const,
        },
      };
  });

  useEffect(() => {
    setLocalChartData(initialChartData);
  }, [initialChartData]);

  const handleChartClick = () => {
    setIsEditorOpen(true);
  };

  const onChartDataChange = (newData: StoreChartData) => {
    dispatch(updateSlideChart({ index: slideIndex, chart: newData }));
    setLocalChartData(newData);
  };

  const onChartSettingsChange = (newSettings: ChartSettings) => {
    dispatch(
      updateSlideChartSettings({
        index: slideIndex,
        chartSettings: newSettings,
      })
    );
  };

  return (
    <>
      <div
        onClick={handleChartClick}
        data-slide-element
        data-element-type="graph"
        data-graph-type={localChartData && localChartData.type}
        data-element-id={`slide-group-${slideIndex}-graph`}
        className="w-full h-full min-h-[200px] lg:min-h-[300px] max-md:pointer-events-none cursor-pointer hover:opacity-90 transition-opacity relative"
      >
        {renderChart(localChartData, false, currentColors ?? [], chartSettings)}
        {/* <img src={`/Banner.png`} alt={localChartData.type} className="w-full h-full object-cover" /> */}
      </div>

      {localChartData && (
        <ChartEditor
          chartSettings={chartSettings}
          setChartSettings={onChartSettingsChange}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          chartData={localChartData}
          onChartDataChange={onChartDataChange}
        />
      )}
    </>
  );
};

export default AllChart;
