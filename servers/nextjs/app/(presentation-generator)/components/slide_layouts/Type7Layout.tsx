import React from "react";
import EditableText from "../EditableText";
import IconsEditor from "../IconsEditor";
import { Plus } from "lucide-react";
import ElementMenu from "../ElementMenu";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useSlideOperations } from "../../hooks/use-slide-operations";
import SlideFooter from "./SlideFooter";

interface Type2LayoutProps {
  title: string;
  body: Array<{
    heading: string;
    description: string;
  }>;
  icons: string[];
  slideIndex: number;
  slideId: string | null;
  icon_queries?: Array<{ queries: string[] }> | null;
}

const Type7Layout = ({
  title,
  body,
  icons,
  slideIndex,
  slideId,
  icon_queries,
}: Type2LayoutProps) => {
  const { currentColors } = useSelector((state: RootState) => state.theme);
  const { handleAddItem, handleDeleteItem } = useSlideOperations(slideIndex);

  const AddItem = () => {
    if (body.length < 4) {
      handleAddItem({ item: { heading: "", description: "" } });
    }
  };
  const DeleteItem = (index: number) => {
    if (body.length > 2) {
      handleDeleteItem({ itemIndex: index });
    }
  };
  const getGridCols = (length: number) => {
    switch (length) {
      case 1: return 'lg:grid-cols-1';
      case 2: return 'lg:grid-cols-2';
      case 3: return 'lg:grid-cols-3';
      case 4: return 'lg:grid-cols-4';
      // Add more cases as needed
      default: return 'lg:grid-cols-1';
    }
  }

  const isGridLayout = body.length === 4;

  const renderContent = () => {
    if (isGridLayout) {
      return (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mt-4 lg:mt-12 w-full relative group`}
        >
          <div className="absolute hidden lg:block -inset-[2px] border-2 border-transparent group-hover:border-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <button
            onClick={AddItem}
            className="absolute hidden lg:block -bottom-4 left-1/2 -translate-x-1/2 p-1 rounded-md bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 z-50"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
          {body.map((item, index) => (
            <div
              data-slide-element
              data-slide-index={slideIndex}
              data-element-type="slide-box"
              data-element-id={`slide-${slideIndex}-item-${index}-box`}
              key={`${body.length}-${index}`}
              style={{
                boxShadow: "0 2px 10px 0 rgba(43, 43, 43, 0.2)",
              }}
              className={` w-full slide-box  rounded-lg p-3 lg:p-6 relative group`}
            >
              <ElementMenu index={index} handleDeleteItem={DeleteItem} />
              <div className="flex items-start gap-2 mg:gap-4">
                <div className="flex-shrink-0 lg:w-16">
                  <IconsEditor
                    hasBg={true}
                    backgroundColor={currentColors.iconBg}
                    icon={icons[index]}
                    index={index}
                    slideIndex={slideIndex}
                    elementId={`slide-${slideIndex}-icon-${index}`}
                    icon_prompt={icon_queries?.[index]?.queries || []}
                  />
                </div>
                <div>
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
      );
    }


    // Horizontal layout for 2-3 items
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${getGridCols(body.length)} w-full gap-3 lg:gap-8 mt-4 lg:mt-12 relative group`}
      >
        <div className="absolute -inset-[2px] border-2 hidden lg:block border-transparent group-hover:border-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <button
          onClick={AddItem}
          className="absolute -bottom-4 hidden lg:block left-1/2 -translate-x-1/2 p-1 rounded-md bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 z-50"
        >
          <Plus className="w-4 h-4 text-gray-600" />
        </button>

        {body.map((item, index) => (
          <div
            data-slide-element
            data-slide-index={slideIndex}
            data-element-type="slide-box"
            data-element-id={`slide-${slideIndex}-item-${index}-box`}
            key={`${body.length}-${index}`}
            style={{
              boxShadow: "0 2px 10px 0 rgba(43, 43, 43, 0.2)",
            }}
            className={`w-full slide-box  rounded-lg p-3 lg:p-6 relative group`}
          >
            <ElementMenu index={index} handleDeleteItem={DeleteItem} />
            <IconsEditor
              hasBg={true}
              backgroundColor={currentColors.iconBg}
              icon={icons[index]}
              index={index}
              slideIndex={slideIndex}
              elementId={`slide-${slideIndex}-icon-${index}`}
              icon_prompt={icon_queries?.[index]?.queries || []}
            />
            <div className="lg:space-y-4 mt-2 lg:mt-4">
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
        ))}
      </div>
    );
  };

  return (
    <div
      className="slide-container rounded-sm w-full max-w-[1280px] font-inter shadow-lg px-3 sm:px-12 lg:px-20 py-[10px] sm:py-[40px] lg:py-[86px]    flex flex-col items-center justify-center  max-h-[720px] aspect-video bg-white relative z-20"
      data-slide-element
      data-slide-index={slideIndex}
      data-slide-type="7"
      data-element-type="slide-container"
      data-element-id={`slide-${slideIndex}-container`}
      data-slide-id={slideId}
      style={{
        fontFamily: currentColors.fontFamily || "Inter, sans-serif",
      }}
    >
      <div className="text-center sm:pb-2 lg:pb-8 w-full">
        <EditableText
          slideIndex={slideIndex}
          elementId={`slide-${slideIndex}-title`}
          type="title"
          isAlingCenter={true}
          content={title}
        />
      </div>
      {renderContent()}
      <SlideFooter />
    </div>
  );
};

export default Type7Layout;
