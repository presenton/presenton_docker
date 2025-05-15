import React from "react";
import EditableText from "../EditableText";
import ImageEditor from "../ImageEditor";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import ElementMenu from "../ElementMenu";
import { Plus } from "lucide-react";
import { useSlideOperations } from "../../hooks/use-slide-operations";
import SlideFooter from "./SlideFooter";

interface Type4LayoutProps {
  title: string;
  body: Array<{
    heading: string;
    description: string;
  }>;
  slideId: string | null;
  images: string[];
  slideIndex: number;
  image_prompts?: string[] | null;
  properties?: null | any;
}

const Type4Layout = ({
  title,
  body,
  slideId,
  images,
  slideIndex,
  image_prompts,
  properties,
}: Type4LayoutProps) => {
  const { currentColors } = useSelector((state: RootState) => state.theme);
  const {
    handleAddItem,
    handleDeleteItem,
    handleImageChange,
    handleDeleteImage,
  } = useSlideOperations(slideIndex);

  const AddItem = () => {
    if (body.length < 3) {
      handleImageChange({ imageUrl: "", imageIndex: slideIndex });
      handleAddItem({
        item: { heading: "Enter Heading", description: "Enter Description" },
      });
    }
  };
  const DeleteItem = (index: number) => {
    if (body.length > 2) {
      handleDeleteItem({ itemIndex: index });
      handleDeleteImage({ imageIndex: index });
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

  return (
    <div
      className="slide-container shadow-lg  rounded-sm w-full max-w-[1280px] px-3 sm:px-12 lg:px-20 py-[10px] sm:py-[40px] lg:py-[86px] font-inter  flex flex-col items-center justify-center max-h-[720px] aspect-video bg-white relative z-20"
      data-slide-element
      data-slide-index={slideIndex}
      data-slide-id={slideId}
      data-slide-type="4"
      data-element-type="slide-container"
      data-element-id={`slide-${slideIndex}-container`}
      style={{
        fontFamily: currentColors.fontFamily || "Inter, sans-serif",
      }}
    >
      <div className="text-center mb-4 lg:mb-16 w-full">
        <EditableText
          slideIndex={slideIndex}
          elementId={`slide-${slideIndex}-title`}
          type="title"
          isAlingCenter={true}
          content={title}
        />
      </div>

      <div
        className={`grid grid-cols-1 lg:grid-cols-2 ${getGridCols(body.length)} gap-3 lg:gap-6 w-full relative group`}
      >
        <div className="absolute -inset-[2px] border-2 border-transparent group-hover:border-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <button
          onClick={AddItem}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 p-1 rounded-md bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 z-50"
        >
          <Plus className="w-4 h-4 text-black" />
        </button>
        {body.map((item, index) => (
          <div
            data-slide-element
            data-slide-index={slideIndex}
            data-element-type="slide-box"
            data-element-id={`slide-${slideIndex}-item-${index}-box`}
            style={{
              boxShadow: "0 2px 10px 0 rgba(43, 43, 43, 0.2)",
            }}
            key={index}
            className="flex slide-box flex-col  w-full  rounded-lg overflow-hidden relative group"
          >
            <ElementMenu index={index} handleDeleteItem={DeleteItem} />
            <ImageEditor
              elementId={`slide-${slideIndex}-item-${index}-image`}
              slideIndex={slideIndex}
              initialImage={images[index]}
              className="max-md:h-[140px] max-lg:h-[180px] h-48 w-full rounded-t-lg rounded-b-none"
              title={item.heading}
              promptContent={image_prompts?.[index]}
              imageIdx={index}
              properties={properties}
            />

            <div className="space-y-2 p-3 lg:p-6">
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
      <SlideFooter />
    </div>
  );
};

export default Type4Layout;
