import React from "react";
import EditableText from "../EditableText";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import AllChart from "./AllChart";
import SlideFooter from "./SlideFooter";

interface Type5LayoutProps {
  title: string;
  description: string;
  slideId: string | null;
  chartComponent?: React.ReactNode;
  graphData?: any;
  slideIndex: number;
  isFullSizeGraph?: boolean;
}

const Type5Layout = ({
  title,
  description,
  slideId,
  chartComponent,
  graphData,
  slideIndex,
  isFullSizeGraph = false,
}: Type5LayoutProps) => {
  const { currentColors } = useSelector((state: RootState) => state.theme);

  return (
    <div
      className="slide-container  font-inter  rounded-sm w-full max-w-[1280px] px-3 py-[10px] sm:px-12  lg:px-20  sm:py-[40px] lg:py-[86px] shadow-lg  max-h-[720px] flex flex-col items-center justify-center aspect-video bg-white relative z-20"
      data-slide-element
      data-slide-index={slideIndex}
      data-slide-id={slideId}
      data-slide-type="5"
      data-element-type="slide-container"
      data-element-id={`slide-${slideIndex}-container`}
      style={{
        fontFamily: currentColors.fontFamily || "Inter, sans-serif",
      }}
    >
      <EditableText
        slideIndex={slideIndex}
        elementId={`slide-${slideIndex}-title`}
        type="title"
        content={title}
        isAlingCenter={false}
      />
      <div
        className={`flex  w-full items-center  ${
          isFullSizeGraph
            ? " flex-col mt-4 lg:mt-10  gap-2 sm:gap-4 md:gap-6 lg:gap-10"
            : "mt-4 lg:mt-16 gap-4 sm:gap-8 md:gap-12 lg:gap-16 "
        } `}
      >
        <div className={` w-full`}>
          <AllChart chartData={graphData} slideIndex={slideIndex} />
        </div>
        <div className={` w-full text-center`}>
          <EditableText
            slideIndex={slideIndex}
            elementId={`slide-${slideIndex}-description-body`}
            type="description-body"
            isAlingCenter={isFullSizeGraph}
            content={description}
          />
        </div>
      </div>
      <SlideFooter />
    </div>
  );
};

export default Type5Layout;
