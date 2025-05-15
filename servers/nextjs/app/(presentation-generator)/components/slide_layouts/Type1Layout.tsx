import React from "react";
import EditableText from "../EditableText";
import ImageEditor from "../ImageEditor";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import SlideFooter from "./SlideFooter";

interface Type1LayoutProps {
  title: string;
  description: string;
  slideId: string | null;
  images: string[];
  slideIndex: number;
  image_prompts?: string[] | null;
  properties?: null | any;
}
const Type1Layout = ({
  title,
  description,
  images,
  slideId,
  slideIndex,
  image_prompts,
  properties,
}: Type1LayoutProps) => {
  const { currentColors } = useSelector((state: RootState) => state.theme);
  return (
    <div
      className="slide-container  w-full  rounded-sm  max-w-[1280px] shadow-lg px-3 sm:px-12 lg:px-20 py-[10px] sm:py-[40px] lg:py-[86px] max-h-[720px] flex items-center  aspect-video bg-white relative z-20"
      data-slide-element
      data-slide-id={slideId}
      data-slide-index={slideIndex}
      data-slide-type="1"
      data-element-type="slide-container"
      data-element-id={`slide-${slideIndex}-container`}
      style={{
        fontFamily: currentColors.fontFamily || "Inter, sans-serif",
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-8 md:gap-12 lg:gap-16 w-full">
        <div className=" flex flex-col w-full items-start justify-center space-y-1 md:space-y-2 lg:space-y-6">
          <EditableText
            slideIndex={slideIndex}
            elementId={`slide-${slideIndex}-title`}
            type="title"
            content={title}
          />
          <EditableText
            slideIndex={slideIndex}
            elementId={`slide-${slideIndex}-description-body`}
            type="description-body"
            content={description}
          />
        </div>

        <ImageEditor
          elementId={`slide-${slideIndex}-image`}
          slideIndex={slideIndex}
          initialImage={images[0]}
          title={title}
          promptContent={image_prompts?.[0]}
          properties={properties}
        />

        {/* {imagePosition === 'left' ? (
                    <>
                        <ImageSection />
                        <ContentSection />
                    </>
                ) : (
                    <>
                        <ContentSection />
                        <ImageSection />
                    </>
                )} */}
      </div>
      <SlideFooter />
    </div>
  );
};

export default Type1Layout;
