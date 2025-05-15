"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { RootState } from "@/store/store";
import { Skeleton } from "@/components/ui/skeleton";
import PresentationMode from "../../components/PresentationMode";

import { DashboardApi } from "@/app/dashboard/api/dashboard";
import SidePanel from "../components/SidePanel";
import SlideContent from "../components/SlideContent";

import {
  deletePresentationSlide,
  setPresentationData,
  setStreaming,
} from "@/store/slices/presentationGeneration";
import { toast } from "@/hooks/use-toast";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import { setThemeColors, ThemeColors } from "../../store/themeSlice";
import { ThemeType } from "../../upload/type";
import LoadingState from "../../components/LoadingState";
import Header from "../components/Header";
import { Loader2 } from "lucide-react";

import { jsonrepair } from "jsonrepair";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Help from "./Help";
import { getEnv } from "@/utils/constant";

const urls = getEnv();
const BASE_URL = urls.BASE_URL;

// Custom debounce function
function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

const PresentationPage = ({ presentation_id }: { presentation_id: string }) => {
  const urls = getEnv();
  const BASE_URL = urls.BASE_URL;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { currentTheme, currentColors } = useSelector(
    (state: RootState) => state.theme
  );
  const { presentationData, isStreaming } = useSelector(
    (state: RootState) => state.presentationGeneration
  );
  const [error, setError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPresentMode = searchParams.get("mode") === "present";
  const session = searchParams.get("session");
  const currentSlide = parseInt(
    searchParams.get("slide") || `${selectedSlide}` || "0"
  );
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [autoSaveLoading, setAutoSaveLoading] = useState(false);

  // Add ref for tracking initial load
  const isInitialLoad = useRef(true);

  // Ref to track the previous length of slides
  const previousSlidesLength = useRef(0);

  // Create auto-save function
  const autoSave = useCallback(
    (data: { presentation_id: string; slides: any[] }) => {
      setAutoSaveLoading(true);
      // Fire and forget - no await
      PresentationGenerationApi.updatePresentationContent(data)
        .then(() => { })
        .catch((error) => {
          console.error("Error AAYO", error);
        })
        .finally(() => {
          console.log("Auto finished");
          setAutoSaveLoading(false);
        });
    },
    [presentation_id]
  );

  // Create debounced version of autoSave
  const debouncedSave = useDebounce(autoSave, 2000);

  // Watch for changes in presentationData and trigger auto-save
  useEffect(() => {
    if (
      presentationData &&
      !isStreaming &&
      !isInitialLoad.current &&
      presentationData.slides &&
      presentationData.slides.some(
        (slide) => slide.images && slide.images.length > 0
      )
    ) {

      debouncedSave({
        presentation_id: presentation_id,
        slides: presentationData.slides,
      });
    }
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, [presentationData, debouncedSave]);

  // Function to fetch the slides
  useEffect(() => {

    let evtSource: EventSource;
    let accumulatedChunks = "";

    const fetchSlides = async () => {
      dispatch(setStreaming(true));

      evtSource = new EventSource(
        `${BASE_URL}/ppt/generate/stream?presentation_id=${presentation_id}&session=${session}`
      );

      evtSource.onopen = () => {
        setColorsVariables(currentColors, currentTheme);
      };

      evtSource.addEventListener("response", (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "chunk") {
          accumulatedChunks += data.chunk;

          try {
            const repairedJson = jsonrepair(accumulatedChunks);
            const partialData = JSON.parse(repairedJson);
            if (partialData.slides) {
              // Check if the length of slides has changed
              if (
                partialData.slides.length !== previousSlidesLength.current &&
                partialData.slides.length > 1
              ) {
                partialData.slides.splice(-1);
                dispatch(
                  setPresentationData({
                    presentation: null,
                    slides: partialData.slides,
                  })
                );
                previousSlidesLength.current = partialData.slides.length + 1; // Update the previous length
                setLoading(false);
              }
            }
          } catch (error) {
            // console.error('error while repairing json', error)
            // It's okay if this fails, it just means the JSON isn't complete yet
          }
        } else if (data.type === "complete") {
          try {
            console.log("evtsource completer", data);
            dispatch(setPresentationData(data.presentation));
            dispatch(setStreaming(false));
            if (data.presentation.theme) {
              dispatch(
                setThemeColors({
                  ...data.presentation.presentation.theme.colors,
                  theme: data.presentation.presentation.theme.name as ThemeType,
                })
              );
              setColorsVariables(
                data.presentation.presentation.theme.colors,
                data.presentation.presentation.theme.name as ThemeType
              );
            }
            setLoading(false);

            evtSource.close();
            // Remove session parameter from URL
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("session");
            window.history.replaceState({}, "", newUrl.toString());
          } catch (error) {
            evtSource.close();
            console.error("Error parsing accumulated chunks:", error);
          }
          accumulatedChunks = "";
        } else if (data.type === "closing") {
          dispatch(setPresentationData(data.presentation));
          if (data.presentation.theme) {
            dispatch(
              setThemeColors({
                ...data.presentation.presentation.theme.colors,
                theme: data.presentation.presentation.theme.name as ThemeType,
              })
            );
            setColorsVariables(
              data.presentation.presentation.theme.colors,
              data.presentation.presentation.theme.name as ThemeType
            );
          }
          setLoading(false);
          dispatch(setStreaming(false));
          evtSource.close();
          // Remove session parameter from URL
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("session");
          window.history.replaceState({}, "", newUrl.toString());
        }
      });
      evtSource.onerror = (error) => {
        console.error("EventSource failed:", error);

        setLoading(false);
        dispatch(setStreaming(false));
        setError(true);

        evtSource.close();
      };
    };

    if (session) {
      fetchSlides();
    } else {
      fetchUserSlides();
    }

    return () => {
      if (evtSource) {
        evtSource.close();
      }
    };
  }, []);
  // Function to scroll to specific slide
  const handleSlideClick = (index: number) => {
    const slideElement = document.getElementById(`slide-${index}`);
    if (slideElement) {
      slideElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setSelectedSlide(index);
    }
  };
  // Function to fetch the user slides
  const fetchUserSlides = async () => {
    try {
      const data = await DashboardApi.getPresentation(presentation_id);
      if (data) {
        if (data.presentation.theme) {
          dispatch(
            setThemeColors({
              ...data.presentation.theme.colors,
              theme: data.presentation.theme.name as ThemeType,
            })
          );
          setColorsVariables(
            data.presentation.theme.colors,
            data.presentation.theme.name as ThemeType
          );
        }
        dispatch(setPresentationData(data));
        setLoading(false);
      }
    } catch (error) {
      setError(true);
      toast({
        title: "Error",
        description: "Failed to load presentation",
        variant: "destructive",
      });

      console.error("Error fetching user slides:", error);
      setLoading(false);
    }
  };
  const setColorsVariables = (colors: ThemeColors, theme: ThemeType) => {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      const cssKey = key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
      root.style.setProperty(`--${theme}-${cssKey}`, value);
    });
  };
  // Function to toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  // Function to handle present exit
  const handlePresentExit = () => {
    setIsFullscreen(false);
    router.push(`/presentation?id=${presentation_id}`);
  };
  // Function to handle slide change  for presentation mode
  const handleSlideChange = (newSlide: number) => {
    if (newSlide >= 0 && newSlide < presentationData?.slides.length!) {
      setSelectedSlide(newSlide);
      router.push(
        `/presentation?id=${presentation_id}&mode=present&slide=${newSlide}`,
        { scroll: false }
      );
    }
  };

  const handleDeleteSlide = async (index: number) => {
    dispatch(deletePresentationSlide(index));
    const response = PresentationGenerationApi.deleteSlide(
      presentation_id,
      presentationData?.slides[index].id!
    );
  };

  if (isPresentMode) {
    return (
      <PresentationMode

        slides={presentationData?.slides!}
        currentSlide={currentSlide}
        currentTheme={currentTheme}
        isFullscreen={isFullscreen}
        onFullscreenToggle={toggleFullscreen}
        onExit={handlePresentExit}
        onSlideChange={handleSlideChange}
        language={presentationData?.presentation?.language || "English"}
      />
    );
  }

  // Regular view
  return (
    <div className="h-screen flex overflow-hidden flex-col">
      {/* Auto save loading state */}
      {autoSaveLoading && (
        <div className="fixed right-6 top-[5.2rem] z-50 bg-white bg-opacity-50 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" />
        </div>
      )}
      <Header presentation_id={presentation_id} currentSlide={currentSlide} />
      <Help />
      {error ? (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
          <div
            className="bg-white border border-red-300 text-red-700 px-6 py-8 rounded-lg shadow-lg flex flex-col items-center"
            role="alert"
          >
            <AlertCircle className="w-16 h-16 mb-4 text-red-500" />
            <strong className="font-bold text-4xl mb-2">Oops!</strong>
            <p className="block text-2xl py-2">
              We encountered an issue loading your presentation.
            </p>
            <p className="text-lg py-2">
              Please check your internet connection or try again later.
            </p>
            <Button
              className="mt-4 bg-red-500 text-white hover:bg-red-600 focus:ring-4 focus:ring-red-300"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: currentColors.background,
          }}
          className="flex flex-1  relative pt-6"
        >
          <SidePanel
            selectedSlide={selectedSlide}
            onSlideClick={handleSlideClick}
            loading={loading}
            isMobilePanelOpen={isMobilePanelOpen}
            setIsMobilePanelOpen={setIsMobilePanelOpen}
          />
          <div className="flex-1 h-[calc(100vh-100px)]  overflow-y-auto">
            <div
              className="mx-auto flex flex-col items-center  overflow-hidden  justify-center p-2 sm:p-6  pt-0 slide-theme"
              data-theme={currentTheme}
            >
              {!presentationData ||
                loading ||
                !presentationData?.slides ||
                presentationData?.slides.length === 0 ? (
                <div className="relative w-full h-[calc(100vh-120px)] mx-auto ">
                  <div className=" ">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <Skeleton
                        key={index}
                        className="aspect-video bg-gray-400 my-4 w-full mx-auto max-w-[1280px]"
                      />
                    ))}
                  </div>
                  {session && <LoadingState />}
                </div>
              ) : (
                <>
                  {presentationData &&
                    presentationData.slides &&
                    presentationData.slides.length > 0 &&
                    presentationData.slides.map((slide, index) => (
                      <SlideContent
                        key={`${slide.type}-${index}-${slide.index}}`}
                        slide={slide}
                        index={index}
                        presentationId={presentation_id}
                        onDeleteSlide={handleDeleteSlide}
                      />
                    ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresentationPage;
