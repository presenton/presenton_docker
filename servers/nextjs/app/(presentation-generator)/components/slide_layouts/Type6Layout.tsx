import React from "react";
import EditableText from "../EditableText";
import { Plus } from "lucide-react";
import ElementMenu from "../ElementMenu";
import { useDispatch, useSelector } from "react-redux";
import { numberTranslations } from "../../utils/others";
import { RootState } from "@/store/store";
import { useSlideOperations } from "../../hooks/use-slide-operations";
import SlideFooter from "./SlideFooter";

interface Type6LayoutProps {
  title: string;
  description: string;
  body: Array<{
    heading: string;
    description: string;
  }>;
  slideId: string | null;
  slideIndex: number;
  language: string;
}

const Type6Layout = ({
  title,
  description,
  body,
  slideId,
  slideIndex,
  language,
}: Type6LayoutProps) => {
  const dispatch = useDispatch();
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
      className="slide-container  rounded-sm w-full max-w-[1280px] font-inter shadow-lg px-3 sm:px-12 lg:px-20 py-[10px] sm:py-[40px] lg:py-[86px] flex flex-col items-center justify-center max-h-[720px] aspect-video bg-white relative z-20"
      data-slide-element
      data-slide-index={slideIndex}
      data-element-type="slide-container"
      data-slide-type="6"
      data-element-id={`slide-${slideIndex}-container`}
      data-slide-id={slideId}
      style={{
        fontFamily: currentColors.fontFamily || "Inter, sans-serif",
      }}
    >
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-18 d:gap-16 items-center w-full">
        {/* Left section - Description */}
        <div className="lg:w-1/2 lg:space-y-8">
          <EditableText
            slideIndex={slideIndex}
            elementId={`slide-${slideIndex}-title`}
            type="title"
            content={title}
          />

          <EditableText
            slideIndex={slideIndex}
            elementId={`slide-${slideIndex}-description`}
            type="description"
            content={description}
          />
        </div>

        {/* Right section - Numbered items */}
        <div className="lg:w-1/2  relative group">
          <div className="absolute -inset-[2px] border-2 hidden md:block  border-transparent group-hover:border-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <button
            onClick={AddItem}
            className="absolute -bottom-4 left-1/2 hidden md:block  -translate-x-1/2 p-1 rounded-md bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 z-50"
          >
            <Plus className="w-4 h-4 text-black" />
          </button>
          <div className="space-y-3 lg:space-y-6">
            {body.map((item, index) => (
              <div
                data-slide-element
                data-slide-index={slideIndex}
                data-element-type="slide-box"
                data-element-id={`slide-${slideIndex}-item-${index}-box`}
                style={{
                  boxShadow: "0 2px 10px 0 rgba(43, 43, 43, 0.2)",
                }}
                key={`${body.length}-${index}`}
                className="slide-box  rounded-lg p-3 lg:p-6 relative group"
              >
                <ElementMenu index={index} handleDeleteItem={DeleteItem} />
                <div className="flex gap-6">
                  <div
                    data-slide-element
                    data-slide-index={slideIndex}
                    data-element-type="text"
                    data-element-id={`slide-${slideIndex}-item-${index}-number`}
                    className="  text-[26px] lg:text-[32px] leading-[40px] px-1 font-bold mb-4"
                    style={{
                      color: currentColors.iconBg,
                    }}
                  >
                    {numberTranslations[language][index || 0]}
                  </div>
                  <div className="space-y-1">
                    <EditableText
                      slideIndex={slideIndex}
                      bodyIdx={index}
                      elementId={`slide-${slideIndex}-item-${index}-heading`}
                      type="heading"
                      content={item.heading}
                    />
                    <EditableText
                      slideIndex={slideIndex}
                      bodyIdx={index}
                      elementId={`slide-${slideIndex}-item-${index}-description`}
                      type="heading-description"
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

export default Type6Layout;
