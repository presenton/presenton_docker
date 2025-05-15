import React from "react";
import EditableText from "../EditableText";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus } from "lucide-react";
import ElementMenu from "../ElementMenu";
import { useSelector } from "react-redux";
import { numberTranslations } from "../../utils/others";
import { RootState } from "@/store/store";
import { useSlideOperations } from "../../hooks/use-slide-operations";
import SlideFooter from "./SlideFooter";

interface Type2LayoutProps {
  title: string;
  body: Array<{
    heading: string;
    description: string;
  }>;
  slideId: string | null;

  slideIndex: number;
  language: string;
  design_index: number;
}

const Type2Layout = ({
  title,
  body,
  slideId,
  slideIndex,
  design_index,
  language,
}: Type2LayoutProps) => {
  const { currentColors } = useSelector(
    (state: RootState) => state.theme
  );
  const { handleAddItem, handleDeleteItem, handleVariantChange } =
    useSlideOperations(slideIndex);

  const onAddItem = () => {
    if (body.length < 4) {
      handleAddItem({ item: { heading: "", description: "" } });
    }
  };

  const onDeleteItem = (index: number) => {
    if (body.length > 2) {
      handleDeleteItem({ itemIndex: index });
    }
  };

  const VariantMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="absolute top-0 -left-7 hidden md:block  p-1 rounded-md bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 z-50">
          <MoreVertical className="w-4 h-4 text-black" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[180px] p-2">
        <DropdownMenuItem
          onClick={() => handleVariantChange({ variant: 1 })}
          className={`px-3 py-2 cursor-pointer ${design_index === 1 ? "bg-blue-50" : ""
            }`}
        >
          Default Layout
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleVariantChange({ variant: 2 })}
          className={`px-3 py-2 cursor-pointer ${design_index === 2 ? "bg-blue-50" : ""
            }`}
        >
          Numbered Layout
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleVariantChange({ variant: 3 })}
          className={`px-3 py-2 cursor-pointer ${design_index === 3 ? "bg-blue-50" : ""
            }`}
        >
          Timeline Layout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const isGridLayout = body.length === 4;

  const renderContent = () => {
    if (design_index === 3) {
      return (
        <div className="w-full flex flex-col relative group mt-4 lg:mt-16">
          <div className="absolute -inset-[2px] border-2 border-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {/* Three Dots Icon */}
          <VariantMenu />

          {/* Plus Icon */}
          <button
            onClick={onAddItem}
            className="absolute top-1/2 -right-4 -translate-y-1/2 p-1 rounded-md bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 z-50"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
          {/* Timeline Header with Numbers and Line */}
          <div className="relative flex justify-between w-[85%] mx-auto items-center mb-8 px-8">
            {/* Horizontal Line */}
            <div
              data-slide-element
              data-slide-index={slideIndex}
              data-element-type="line"
              data-element-id={`slide-${slideIndex}-horizontal-line`}
              className="absolute top-1/2 w-[87%] left-1/2 -translate-x-1/2 h-[2px] "
              style={{
                backgroundColor: currentColors.iconBg,
              }}
            />

            {/* Timeline Numbers */}
            {body.map((_, index) => (
              <div
                data-slide-element
                data-slide-index={slideIndex}
                data-element-type="filledbox"
                data-element-id={`slide-${slideIndex}-timeline-number-${index}`}
                key={`timeline-${index}`}
                className="relative z-10 w-12 h-12 rounded-full  px-1 text-white flex items-center justify-center font-bold text-lg"
                style={{
                  backgroundColor: currentColors.iconBg,
                }}
              >
                <span
                  data-slide-element
                  data-slide-index={slideIndex}
                  data-element-type="text"
                  data-element-id={`slide-${slideIndex}-timeline-number-text-${index}`}
                >
                  {numberTranslations[language][index || 0]}
                </span>
              </div>
            ))}
          </div>

          {/* Timeline Content */}
          <div className="flex justify-between gap-8">
            {body.map((item, index) => (
              <div
                key={`${body.length}-${index}`}
                className="flex-1 text-center relative"
              >
                <ElementMenu index={index} handleDeleteItem={onDeleteItem} />
                <div className="space-y-4">
                  <EditableText
                    slideIndex={slideIndex}
                    elementId={`slide-${slideIndex}-item-${index}-heading`}
                    type="heading"
                    content={item.heading}
                  />
                  <EditableText
                    slideIndex={slideIndex}
                    elementId={`slide-${slideIndex}-item-${index}-description`}
                    type="heading-description"
                    content={item.description}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (isGridLayout) {
      return (
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 relative group ${design_index === 2 ? "gap-4 lg:gap-8" : "gap-6 md:gap-12"
            } mt-4 lg:mt-12`}
        >
          {/* Hover Border and Icons for entire layout */}
          <div className="absolute -inset-[2px] border-2 border-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {/* Three Dots Icon */}
          <VariantMenu />

          {body.map((item, index) => (
            <div
              key={index}
              data-slide-element
              data-slide-index={slideIndex}
              data-element-type={design_index === 2 ? "slide-box" : ""}
              data-element-id={`slide-${slideIndex}-item-${index}-box`}
              style={{
                boxShadow:
                  design_index === 2
                    ? "0 2px 10px 0 rgba(43, 43, 43, 0.2)"
                    : "",
              }}
              className={`w-full relative group ${design_index === 2
                  ? "slide-box shadow-lg  rounded-lg p-3 lg:p-6"
                  : ""
                }`}
            >
              <div className="flex gap-3 ">
                {design_index === 2 && (
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
                    {
                      numberTranslations[
                      language as keyof typeof numberTranslations
                      ][index]
                    }
                  </div>
                )}
                <ElementMenu index={index} handleDeleteItem={onDeleteItem} />
                <div className="space-y-2">
                  <EditableText
                    slideIndex={slideIndex}
                    elementId={`slide-${slideIndex}-item-${index}-heading`}
                    type="heading"
                    content={item.heading}
                    bodyIdx={index}
                  />

                  <EditableText
                    slideIndex={slideIndex}
                    elementId={`slide-${slideIndex}-item-${index}-description`}
                    type="heading-description"
                    content={item.description}
                    bodyIdx={index}
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
        className={`flex flex-col lg:flex-row mt-4 lg:mt-12 w-full relative group ${design_index === 2 ? "gap-4 lg:gap-8" : "gap-12"
          }`}
      >
        {/* Hover Border and Icons for entire layout */}
        <div className="absolute -inset-[2px] hidden lg:block border-2 border-transparent group-hover:border-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Three Dots Icon */}
        <VariantMenu />

        {/* Plus Icon */}
        {body.length < 4 && (
          <button
            onClick={onAddItem}
            className="absolute top-1/2 -right-4 hidden lg:block -translate-y-1/2 p-1 rounded-md bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 z-50"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        )}
        {body.map((item, index) => (
          <div
            data-slide-element
            data-slide-index={slideIndex}
            data-element-type="slide-box"
            data-element-id={`slide-${slideIndex}-item-${index}-box`}
            key={`${body.length}-${index}`}
            style={{
              boxShadow:
                design_index === 2 ? "0 2px 10px 0 rgba(43, 43, 43, 0.2)" : "",
            }}
            className={`w-full  relative ${design_index === 2
                ? "slide-box shadow-lg rounded-lg p-3 lg:p-6"
                : ""
              }`}
          >
            <ElementMenu index={index} handleDeleteItem={onDeleteItem} />

            {design_index === 2 && (
              <div
                data-slide-element
                data-slide-index={slideIndex}
                data-element-type="text"
                data-element-id={`slide-${slideIndex}-item-${index}-number`}
                className=" text-[32px] leading-[40px] font-semibold lg:mb-4"
                style={{
                  color: currentColors.iconBg,
                }}
              >
                {
                  numberTranslations[
                  language as keyof typeof numberTranslations
                  ][index]
                }
              </div>
            )}
            <div className="space-y-2 lg:space-y-4">
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
      className="slide-container  rounded-sm max-w-[1280px] w-full shadow-lg px-3 sm:px-12 lg:px-20 py-[10px] sm:py-[40px] flex flex-col items-center justify-center max-h-[720px] aspect-video bg-white relative z-20"
      style={{
        fontFamily: currentColors.fontFamily || "Inter, sans-serif",
      }}
      data-slide-element
      data-slide-index={slideIndex}
      data-slide-id={slideId}
      data-element-type="slide-container"
      data-slide-type="2"
      data-element-id={`slide-${slideIndex}-container`}
      data-design-index={design_index}
    >
      <div className="text-center lg:pb-8 w-full">
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

export default Type2Layout;
