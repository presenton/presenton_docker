"use client";
import React, { useState, useEffect } from "react";
import { LayoutList, ListTree, PanelRightOpen, X } from "lucide-react";
import ToolTip from "@/components/ToolTip";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { DashboardApi } from "@/app/dashboard/api/dashboard";
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
import * as htmlToImage from "html-to-image";
import { setPresentationData } from "@/store/slices/presentationGeneration";
import { SortableSlide } from "./SortableSlide";
import { SortableListItem } from "./SortableListItem";
import { renderMiniSlideContent } from "../../components/slide_config";

interface SidePanelProps {
  selectedSlide: number;
  onSlideClick: (index: number) => void;
  isMobilePanelOpen: boolean;
  setIsMobilePanelOpen: (value: boolean) => void;
  loading: boolean;
}

const SidePanel = ({
  selectedSlide,
  onSlideClick,
  isMobilePanelOpen,
  setIsMobilePanelOpen,
  loading,
}: SidePanelProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [active, setActive] = useState<"list" | "grid">("grid");

  const { presentationData, isStreaming } = useSelector(
    (state: RootState) => state.presentationGeneration
  );
  const { currentTheme, currentColors } = useSelector(
    (state: RootState) => state.theme
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(isMobilePanelOpen);
    }
  }, [isMobilePanelOpen]);

  useEffect(() => {
    if (
      presentationData?.presentation?.thumbnail === null &&
      presentationData.slides.some(
        (slide) => slide.images && slide.images.length > 0
      )
    ) {
      setTimeout(() => {
        setSlideThumbnail();
      }, 4000);
    }
  }, [presentationData]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleClose = () => {
    setIsOpen(false);
    if (window.innerWidth < 768) {
      setIsMobilePanelOpen(false);
    }
  };

  const dataUrlToFile = (dataUrl: string, filename: string) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*)/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!active || !over || !presentationData?.slides) return;

    if (active.id !== over.id) {
      // Find the indices of the dragged and target items
      const oldIndex = presentationData?.slides.findIndex(
        (item) => item.id === active.id
      );
      const newIndex = presentationData?.slides.findIndex(
        (item) => item.id === over.id
      );

      // Reorder the array
      const reorderedArray = arrayMove(
        presentationData?.slides,
        oldIndex,
        newIndex
      );

      // Update indices of all slides
      const updatedArray = reorderedArray.map((slide, index) => ({
        ...slide,
        index: index,
      }));

      // Update the store with new order and indices
      dispatch(
        setPresentationData({ ...presentationData, slides: updatedArray })
      );
    }
  };

  const setSlideThumbnail = async () => {
    const slideContainer = document.querySelector(".slide-container");
    if (!slideContainer) return;
    const image = await htmlToImage
      .toPng(slideContainer as HTMLElement)
      .then((dataUrl) => {
        return dataUrl;
      });

    const file = dataUrlToFile(image, "thumbnail.png");

    const response = await DashboardApi.setSlideThumbnail(
      presentationData?.presentation?.id!,
      file
    );
  };

  // Loading shimmer component
  if (
    !presentationData ||
    loading ||
    !presentationData?.slides ||
    presentationData?.slides.length === 0
  ) {
    return null;

    // <div className="space-y-4 ">
    //     <div className="flex items-center gap-2">
    //         <div className="w-4 h-4 rounded-lg animate-pulse bg-gray-200" />
    //         <div className="w-full h-2 rounded-lg animate-pulse bg-gray-200" />
    //     </div>
    //     {Array.from({ length: 8 }).map((_, index) => (
    //         <div key={index} className="animate-pulse">
    //             <div className="w-full aspect-video bg-gray-200 rounded-lg" />

    //         </div>
    //     ))}
    // </div>
  }

  return (
    <>
      {/* Desktop Toggle Button - Always visible when panel is closed */}
      {!isOpen && (
        <div className="hidden xl:block fixed left-4 top-1/2 -translate-y-1/2 z-50">
          <ToolTip content="Open Panel">
            <Button
              onClick={() => setIsOpen(true)}
              className="bg-white hover:bg-gray-50 shadow-lg"
            >
              <PanelRightOpen className="text-black" size={20} />
            </Button>
          </ToolTip>
        </div>
      )}

      {/* Mobile Toggle Button */}
      {!isMobilePanelOpen && (
        <div className="xl:hidden fixed left-4 bottom-4 z-50">
          <ToolTip content="Show Panel">
            <Button
              onClick={() => setIsMobilePanelOpen(true)}
              className="bg-[#5146E5] text-white p-3 rounded-full shadow-lg"
            >
              <PanelRightOpen className="text-white" size={20} />
            </Button>
          </ToolTip>
        </div>
      )}

      {/* Side Panel */}
      <div
        className={`
          fixed xl:relative h-full z-50 xl:z-auto
          transition-all duration-300 ease-in-out
          ${isOpen ? "ml-0" : "-ml-[300px]"}
          ${
            isMobilePanelOpen
              ? "translate-x-0"
              : "-translate-x-full xl:translate-x-0"
          }
        `}
      >
        <div
          data-theme={currentTheme}
          style={{
            backgroundColor: currentColors.slideBg,
          }}
          className="min-w-[300px] max-w-[300px] h-[calc(100vh-150px)]  rounded-[20px] hide-scrollbar overflow-hidden slide-theme shadow-xl"
        >
          <div
            style={{
              backgroundColor: currentColors.slideBg,
            }}
            className="sticky top-0 z-40  px-6 py-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center justify-start gap-4">
                <ToolTip content="Image Preview">
                  <Button
                    className={`${
                      active === "grid"
                        ? "bg-[#5141e5] hover:bg-[#4638c7]"
                        : "bg-white hover:bg-white"
                    }`}
                    onClick={() => setActive("grid")}
                  >
                    <LayoutList
                      className={`${
                        active === "grid" ? "text-white" : "text-black"
                      }`}
                      size={20}
                    />
                  </Button>
                </ToolTip>
                <ToolTip content="List Preview">
                  <Button
                    className={`${
                      active === "list"
                        ? "bg-[#5141e5] hover:bg-[#4638c7]"
                        : "bg-white hover:bg-white"
                    }`}
                    onClick={() => setActive("list")}
                  >
                    <ListTree
                      className={`${
                        active === "list" ? "text-white" : "text-black"
                      }`}
                      size={20}
                    />
                  </Button>
                </ToolTip>
              </div>
              <X
                onClick={handleClose}
                className="text-[#6c7081] cursor-pointer hover:text-gray-600"
                size={20}
              />
            </div>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {/* List Preview */}
            {active === "list" && (
              <div className="p-4 overflow-y-auto hide-scrollbar h-[calc(100%-100px)]">
                {isStreaming ? (
                  presentationData &&
                  presentationData?.slides.map((slide, index) => (
                    <div
                      key={`${index}-${slide.type}-${slide.id}`}
                      className={`p-3 cursor-pointer rounded-lg slide-box`}
                    >
                      <span className="font-medium slide-title">
                        Slide {index + 1}
                      </span>
                      <p className="text-sm slide-description">
                        {slide.content.title}
                      </p>
                    </div>
                  ))
                ) : (
                  <SortableContext
                    items={
                      presentationData?.slides.map((slide) => slide.id!) || []
                    }
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2" id={`slide-${selectedSlide}`}>
                      {presentationData &&
                        presentationData?.slides.map((slide, index) => (
                          <SortableListItem
                            key={`${slide.id}-${index}`}
                            slide={slide}
                            index={index}
                            selectedSlide={selectedSlide}
                            onSlideClick={onSlideClick}
                          />
                        ))}
                    </div>
                  </SortableContext>
                )}
              </div>
            )}

            {/* Grid Preview */}
            {active === "grid" && (
              <div className="p-4 overflow-y-auto hide-scrollbar h-[calc(100%-100px)] space-y-4">
                {isStreaming ? (
                  presentationData &&
                  presentationData?.slides.map((slide, index) => (
                    <div key={`${index}-${slide.type}-${slide.id}`}>
                      {renderMiniSlideContent(slide)}
                    </div>
                  ))
                ) : (
                  <SortableContext
                    items={
                      presentationData?.slides.map((slide) => slide.id!) || []
                    }
                    strategy={verticalListSortingStrategy}
                  >
                    {presentationData &&
                      presentationData?.slides.map((slide, index) => (
                        <SortableSlide
                          key={`${slide.id}-${index}`}
                          slide={slide}
                          index={index}
                          selectedSlide={selectedSlide}
                          onSlideClick={onSlideClick}
                        />
                      ))}
                  </SortableContext>
                )}
              </div>
            )}
          </DndContext>
        </div>
      </div>
    </>
  );
};

export default SidePanel;
