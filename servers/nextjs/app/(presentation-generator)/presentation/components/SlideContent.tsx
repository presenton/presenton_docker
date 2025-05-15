import React, { useEffect, useState } from "react";
import { Slide } from "../../types/slide";
import { renderSlideContent } from "../../components/slide_config";
import { Loader2, PlusIcon, Trash2, WandSparkles } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import ToolTip from "@/components/ToolTip";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { addSlide, updateSlide } from "@/store/slices/presentationGeneration";
import NewSlide from "../../components/slide_layouts/NewSlide";
import { getEmptySlideContent } from "../../utils/NewSlideContent";

interface SlideContentProps {
  slide: Slide;
  index: number;

  presentationId: string;

  onDeleteSlide: (index: number) => void;
}

const SlideContent = ({
  slide,
  index,

  presentationId,
  onDeleteSlide,
}: SlideContentProps) => {
  const dispatch = useDispatch();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNewSlideSelection, setShowNewSlideSelection] = useState(false);
  const { presentationData, isStreaming } = useSelector(
    (state: RootState) => state.presentationGeneration
  );

  const handleSubmit = async () => {
    const element = document.getElementById(
      `slide-${slide.index}-prompt`
    ) as HTMLInputElement;
    const value = element?.value;
    if (!value?.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt before submitting",
        variant: "destructive",
      });
      return;
    }
    setIsUpdating(true);

    try {
      const response = await PresentationGenerationApi.editSlide(
        presentationId,
        slide.index,
        value
      );

      if (response) {
        console.log("response", response);
        dispatch(updateSlide({ index: slide.index, slide: response }));
        toast({
          title: "Success",
          description: "Slide updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating slide:", error);
      toast({
        title: "Error",
        description: "Failed to update slide. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNewSlide = (type: number, index: number) => {
    const newSlide: Slide = getEmptySlideContent(
      type,
      index + 1,
      presentationData?.presentation!.id!
    );

    dispatch(addSlide({ slide: newSlide, index: index + 1 }));
    setShowNewSlideSelection(false);
  };
  // Scroll to the new slide when the presentationData is updated
  useEffect(() => {
    if (
      presentationData &&
      presentationData?.slides &&
      presentationData.slides.length > 1 &&
      isStreaming
    ) {
      const slideElement = document.getElementById(`slide-${index}`);
      if (slideElement) {
        slideElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [presentationData?.slides, isStreaming]);

  const language = presentationData?.presentation?.language || "English";
  return (
    <>
      <div
        id={`slide-${isStreaming ? index : slide.index}`}
        className=" w-full max-w-[1280px] flex items-center max-md:mb-4 justify-center relative"
      >
        {isStreaming && (
          <Loader2 className="w-8 h-8 absolute right-2 top-2 z-30 text-blue-800 animate-spin" />
        )}
        <div className={` w-full group `}>
          {renderSlideContent(slide, language)}

          {!showNewSlideSelection && (
            <div className="group-hover:opacity-100 hidden md:block opacity-0 transition-opacity my-4 duration-300">
              <ToolTip content="Add new slide below">
                {!isStreaming && (
                  <div
                    onClick={() => setShowNewSlideSelection(true)}
                    className="  bg-white shadow-md w-[80px] py-2 border hover:border-[#5141e5] duration-300  flex items-center justify-center rounded-lg cursor-pointer mx-auto"
                  >
                    <PlusIcon className="text-gray-500 text-base cursor-pointer" />
                  </div>
                )}
              </ToolTip>
            </div>
          )}
          {showNewSlideSelection && (
            <NewSlide
              onSelectLayout={(type) => handleNewSlide(type, slide.index)}
              setShowNewSlideSelection={setShowNewSlideSelection}
            />
          )}
          {!isStreaming && (
            <ToolTip content="Delete slide">
              <div
                onClick={() => onDeleteSlide(slide.index)}
                className="absolute top-2 z-20 sm:top-4 right-2 sm:right-4 hidden md:block  transition-transform"
              >
                <Trash2 className="text-gray-500 text-xl cursor-pointer" />
              </div>
            </ToolTip>
          )}
          {!isStreaming && (
            <div className="absolute top-2 z-20 sm:top-4 hidden md:block left-2 sm:left-4 transition-transform">
              <Popover>
                <PopoverTrigger>
                  <ToolTip content="Update slide using prompt">
                    <div
                      className={`p-2 group-hover:scale-105 rounded-lg bg-[#5141e5] hover:shadow-md transition-all duration-300 cursor-pointer shadow-md `}
                    >
                      <WandSparkles className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                    </div>
                  </ToolTip>
                </PopoverTrigger>
                <PopoverContent
                  side="right"
                  align="start"
                  sideOffset={10}
                  className="w-[280px] sm:w-[400px] z-20"
                >
                  <div className="space-y-4">
                    <form
                      className="flex flex-col gap-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                      }}
                    >
                      <Textarea
                        id={`slide-${slide.index}-prompt`}
                        placeholder="Enter your prompt here..."
                        className="w-full min-h-[100px] max-h-[100px] p-2 text-sm border rounded-lg focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        disabled={isUpdating}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                          }
                        }}
                        rows={4}
                        wrap="soft"
                      />
                      <button
                        disabled={isUpdating}
                        type="submit"
                        className={`bg-gradient-to-r from-[#9034EA] to-[#5146E5] rounded-[32px] px-4 py-2 text-white flex items-center justify-end gap-2 ml-auto ${isUpdating ? "opacity-70 cursor-not-allowed" : ""
                          }`}
                      >
                        {isUpdating ? "Updating..." : "Update"}
                        <SendHorizontal className="w-4 sm:w-5 h-4 sm:h-5" />
                      </button>
                    </form>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SlideContent;
