import React from "react";
import EditableText from "../EditableText";
import { Plus } from "lucide-react";
import ElementMenu from "../ElementMenu";
import { useSelector } from "react-redux";
import { numberTranslations } from "../../utils/others";
import { RootState } from "@/store/store";
import AllChart from "./AllChart";
import { useSlideOperations } from "../../hooks/use-slide-operations";
import SlideFooter from "./SlideFooter";

interface Type9LayoutProps {
  title: string;
  body: Array<{
    heading: string;
    description: string;
  }>;
  graphData?: any;
  slideId: string | null;
  language: string;
  slideIndex: number;
}

const Type9Layout = ({
  title,
  body,
  graphData,
  slideId,
  slideIndex,
  language,
}: Type9LayoutProps) => {
  const { currentColors } = useSelector((state: RootState) => state.theme);
  const { handleAddItem, handleDeleteItem } = useSlideOperations(slideIndex);
  const AddItem = () => {
    if (body.length < 3) {
      handleAddItem({ item: { heading: "", description: "" } });
    }
  };
  const DeleteItem = (index: number) => {
    if (body.length > 2) {
      handleDeleteItem({ itemIndex: index });
    }
  };
  return (
    <div
      className="slide-container   rounded-sm w-full max-w-[1280px] font-inter px-3 sm:px-12 lg:px-20 py-[10px] sm:py-[40px] lg:py-[86px] shadow-lg flex flex-col items-center justify-center max-h-[720px] aspect-video bg-white relative"
      data-slide-element
      data-slide-index={slideIndex}
      data-slide-type="9"
      data-element-type="slide-container"
      data-element-id={`slide-${slideIndex}-container`}
      data-slide-id={slideId}
      style={{
        fontFamily: currentColors.fontFamily || "Inter, sans-serif",
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full items-center gap-2  sm:gap-4 md:gap-8 lg:gap-16">
        {/* Left section - Chart */}
        <div className="space-y-2  lg:space-y-14">
          <EditableText
            slideIndex={slideIndex}
            elementId={`slide-${slideIndex}-title`}
            type="title"
            content={title}
          />
          <div className=" flex items-center justify-center">
            <div className="w-full">
              <AllChart chartData={graphData} slideIndex={slideIndex} />
            </div>
          </div>
        </div>

        {/* Right section - Numbered items */}

        <div className=" relative group">
          <div className="absolute -inset-[2px] border-2 hidden lg:block border-transparent group-hover:border-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <button
            onClick={AddItem}
            className="absolute left-1/2 hidden lg:block -bottom-4 -translate-x-1/2 p-1 rounded-md bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 z-50"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
          <div className="space-y-4 lg:space-y-8">
            {body.length > 0 &&
              body.map((item, index) => (
                <div
                  data-slide-element
                  data-slide-index={slideIndex}
                  data-element-type="slide-box"
                  data-element-id={`slide-${slideIndex}-item-${index}-box`}
                  style={{
                    boxShadow: "0 2px 10px 0 rgba(43, 43, 43, 0.2)",
                  }}
                  key={`${body.length}-${index}`}
                  className="slide-box relative  rounded-lg p-3 lg:p-6"
                >
                  <ElementMenu index={index} handleDeleteItem={DeleteItem} />
                  <div className="flex gap-3 lg:gap-6 ">
                    <div
                      data-slide-element
                      data-slide-index={slideIndex}
                      data-element-type="text"
                      data-element-id={`slide-${slideIndex}-item-${index}-number`}
                      className=" text-[32px] leading-[40px] px-1 font-bold mb-4"
                      style={{
                        color: currentColors.iconBg,
                      }}
                    >
                      {numberTranslations[language][index || 0]}
                    </div>

                    <div className="lg:space-y-2 ">
                      <EditableText
                        slideIndex={slideIndex}
                        elementId={`slide-${slideIndex}-item-${index}-heading`}
                        type="heading"
                        bodyIdx={index}
                        content={item.heading}
                      />
                      <EditableText
                        slideIndex={slideIndex}
                        elementId={`slide-${slideIndex}-item-${index}-description`}
                        type="heading-description"
                        bodyIdx={index}
                        content={item.description}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      <SlideFooter />
    </div>
  );
};

export default Type9Layout;
