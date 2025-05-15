import React from "react";
import EditableText from "../EditableText";
import IconsEditor from "../IconsEditor";
import { Plus } from "lucide-react";
import ElementMenu from "../ElementMenu";
import { useSelector } from "react-redux";
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
  icons: string[];
  slideId: string | null;
  slideIndex: number;
  icon_queries?: Array<{ queries: string[] }> | null;
}

const Type8Layout = ({
  title,
  description,
  body,
  icons,
  slideIndex,
  slideId,
  icon_queries,
}: Type6LayoutProps) => {
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
      className="slide-container  shadow-lg w-full max-w-[1280px]  rounded-sm font-inter px-3 sm:px-12 lg:px-20 py-[10px] sm:py-[40px] lg:py-[86px] flex  items-center justify-center max-h-[720px] aspect-video bg-white relative z-20"
      data-slide-element
      data-slide-index={slideIndex}
      data-slide-id={slideId}
      data-slide-type="8"
      data-element-type="slide-container"
      data-element-id={`slide-${slideIndex}-container`}
      style={{
        fontFamily: currentColors.fontFamily || "Inter, sans-serif",
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-16 items-center w-full">
        {/* Left section - Description */}
        <div className="space-y-2 lg:space-y-6">
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
        <div className=" relative group ">
          <div className="absolute -inset-[2px] hidden md:block border-2 border-transparent group-hover:border-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <button
            onClick={AddItem}
            className="absolute -bottom-4 left-1/2 hidden md:block  -translate-x-1/2 p-1 rounded-md bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 z-50"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>

          <div className="space-y-4 lg:space-y-8">
            {body && body.length > 0 && body.length === 2
              ? body.map((item, index) => (
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
                  <IconsEditor
                    icon={icons[index]}
                    index={index}
                    backgroundColor={currentColors.iconBg}
                    hasBg={true}
                    slideIndex={slideIndex}
                    elementId={`slide-${slideIndex}-icon-${index}`}
                    icon_prompt={icon_queries?.[index]?.queries || []}
                  />

                  <div className="space-y-1 lg:space-y-3  lg:mt-3">
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
              ))
              : body.map((item, index) => (
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
                  <div className="flex items-start gap-4">
                    <div className="w-[32px] md:w-[64px]  h-[32px] md:h-[64px]">
                      <IconsEditor
                        className="rounded-lg"
                        icon={icons[index]}
                        index={index}
                        backgroundColor={currentColors.iconBg}
                        hasBg={true}
                        slideIndex={slideIndex}
                        elementId={`slide-${slideIndex}-icon-${index}`}
                        icon_prompt={icon_queries?.[index]?.queries || []}
                      />
                    </div>
                    <div className="lg:space-y-3 ">
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

export default Type8Layout;
