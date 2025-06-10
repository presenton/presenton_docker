"use client";
import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { OutlineItem } from "./OutlineItem";
import { Button } from "@/components/ui/button";
import { RootState } from "@/store/store";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import { useToast } from "@/hooks/use-toast";
import {
  setPresentationData,
  setOutlines,
} from "@/store/slices/presentationGeneration";
import { OverlayLoader } from "@/components/ui/overlay-loader";
import Wrapper from "@/components/Wrapper";

const CreatePage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { presentation_id, images, outlines } = useSelector(
    (state: RootState) => state.presentationGeneration
  );
  const {

    documents,
    images: imagesUploaded,
  } = useSelector((state: RootState) => state.pptGenUpload);
  const { currentTheme, currentColors } = useSelector(
    (state: RootState) => state.theme
  );
  const { toast } = useToast();

  const [loadingState, setLoadingState] = useState({
    message: "",
    isLoading: false,
    showProgress: false,
    duration: 0,
  });
  const [initialSlideCount, setInitialSlideCount] = useState(0);

  useEffect(() => {
    if (outlines && initialSlideCount === 0) {
      setInitialSlideCount(outlines.length);
    }
  }, [outlines]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!active || !over || !outlines) return;

    if (active.id !== over.id) {
      // Find the indices of the dragged and target items
      const oldIndex = outlines.findIndex((item) => item.title === active.id);
      const newIndex = outlines.findIndex((item) => item.title === over.id);

      // Create new array with reordered items and updated indices

      // Reorder the array
      const reorderedArray = arrayMove(outlines, oldIndex, newIndex);

      // Update the store with new order
      dispatch(setOutlines(reorderedArray));
    }
  };

  const handleSubmit = async () => {
    // Generate data
    setLoadingState({
      message: "Generating data...",
      isLoading: true,
      showProgress: false,
      duration: 10,
    });
    try {


      const response = await PresentationGenerationApi.generateData({
        presentation_id: presentation_id,
        theme: {
          name: currentTheme.toLocaleLowerCase(),
          colors: currentColors,
        },
        watermark: false,
        images: images,
        outlines: outlines,

      });

      if (response) {
        dispatch(setPresentationData(response));

        router.push(
          `/presentation?id=${presentation_id}&session=${response.session}`
        );
      }
    } catch (error) {
      console.error("error in data generation", error);
      toast({
        title: "Error Adding Charts",
        description: "Something went wrong, Try again",
        variant: "destructive",
      });
    } finally {
      setLoadingState({
        isLoading: false,
        message: "",
        showProgress: false,
        duration: 0,
      });
    }
  };

  const handleAddSlide = () => {
    if (!outlines) {
      toast({
        title: "Error",
        description: "Cannot add slide at this time",
        variant: "destructive",
      });
      return;
    }

    if (outlines.length >= initialSlideCount) {
      toast({
        title: "Cannot add more slides",
        description:
          "You can only add back slides that were previously deleted",
        variant: "destructive",
      });
      return;
    }

    const newTitleWithCharts = [...outlines, { title: "New Slide", body: "" }];

    dispatch(setOutlines(newTitleWithCharts));
  };

  if (!presentation_id) {
    return null;
  }

  return (
    <Wrapper>
      <OverlayLoader
        show={loadingState.isLoading}
        text={loadingState.message}
        showProgress={loadingState.showProgress}
        duration={loadingState.duration}
      />

      <div className="max-w-[1000px] mx-auto  sm:px-6 pb-6">
        <div className="mt-4 sm:mt-8 font-instrument_sans relative">
          <h4 className="text-lg sm:text-xl font-instrument_sans font-medium mb-4">
            Outline
          </h4>
          <div className="border p-2 sm:p-4 md:p-6 rounded-lg">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={outlines?.map((item) => ({ id: item.title })) || []}
                strategy={verticalListSortingStrategy}
              >
                {outlines?.map((item, index) => (
                  <OutlineItem key={item.title} index={index + 1} slideOutline={item} />
                ))}
              </SortableContext>
            </DndContext>
            <Button
              variant="outline"
              onClick={handleAddSlide}
              disabled={!outlines || outlines.length >= initialSlideCount}
              className={`w-full mt-4 text-[#9034EA] border-[#9034EA] rounded-[32px] ${!outlines || outlines.length >= initialSlideCount
                ? "opacity-50 cursor-not-allowed"
                : ""
                }`}
            >
              + Add Slide
            </Button>
          </div>
        </div>
        <Button
          disabled={loadingState.isLoading}
          onClick={handleSubmit}
          className="bg-[#5146E5] w-full rounded-[32px] text-base sm:text-lg py-4 sm:py-6 transition-all duration-300 font-roboto font-semibold hover:bg-[#5146E5]/80 text-white mt-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 25 25"
            fill="none"
          >
            <g clipPath="url(#clip0_1960_939)">
              <path
                d="M21.217 9.57008L21.463 9.00408C21.8955 8.0028 22.6876 7.2 23.683 6.75408L24.442 6.41508C24.5341 6.37272 24.6121 6.30485 24.6668 6.21951C24.7214 6.13417 24.7505 6.03494 24.7505 5.93358C24.7505 5.83222 24.7214 5.73299 24.6668 5.64765C24.6121 5.56231 24.5341 5.49444 24.442 5.45208L23.725 5.13308C22.7046 4.67446 21.8989 3.84196 21.474 2.80708L21.221 2.19608C21.1838 2.10144 21.119 2.02018 21.035 1.96291C20.951 1.90563 20.8517 1.875 20.75 1.875C20.6483 1.875 20.549 1.90563 20.465 1.96291C20.381 2.02018 20.3162 2.10144 20.279 2.19608L20.026 2.80608C19.6015 3.84116 18.7962 4.67401 17.776 5.13308L17.058 5.45308C16.9662 5.49556 16.8885 5.56342 16.834 5.64865C16.7795 5.73389 16.7506 5.83293 16.7506 5.93408C16.7506 6.03523 16.7795 6.13428 16.834 6.21951C16.8885 6.30474 16.9662 6.3726 17.058 6.41508L17.818 6.75308C18.8132 7.19945 19.6049 8.00261 20.037 9.00408L20.283 9.57008C20.463 9.98408 21.036 9.98408 21.217 9.57008ZM6.55 16.8761H8.704L9.304 15.3761H12.196L12.796 16.8761H14.95L11.75 8.87608H9.75L6.55 16.8761ZM10.75 11.7611L11.396 13.3761H10.104L10.75 11.7611ZM15.75 16.8761V8.87608H17.75V16.8761H15.75ZM3.75 3.87608C3.48478 3.87608 3.23043 3.98144 3.04289 4.16897C2.85536 4.35651 2.75 4.61086 2.75 4.87608V20.8761C2.75 21.1413 2.85536 21.3957 3.04289 21.5832C3.23043 21.7707 3.48478 21.8761 3.75 21.8761H21.75C22.0152 21.8761 22.2696 21.7707 22.4571 21.5832C22.6446 21.3957 22.75 21.1413 22.75 20.8761V11.8761H20.75V19.8761H4.75V5.87608H14.75V3.87608H3.75Z"
                fill="white"
              />
            </g>
            <defs>
              <clipPath id="clip0_1960_939">
                <rect
                  width="24"
                  height="24"
                  fill="white"
                  transform="translate(0.75 0.876953)"
                />
              </clipPath>
            </defs>
          </svg>
          {loadingState.isLoading
            ? loadingState.message
            : "Generate Presentation"}
        </Button>
      </div>
    </Wrapper>
  );
};

export default CreatePage;
