"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Skeleton } from "@/components/ui/skeleton";


import { DashboardApi } from "@/app/dashboard/api/dashboard";


import {
    setPresentationData,
} from "@/store/slices/presentationGeneration";
import { toast } from "@/hooks/use-toast";



import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { setThemeColors, ThemeColors } from "../store/themeSlice";
import { ThemeType } from "../upload/type";
import { renderSlideContent } from "../components/slide_config";




const PresentationPage = ({ presentation_id }: { presentation_id: string }) => {

    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    const { currentTheme, currentColors } = useSelector(
        (state: RootState) => state.theme
    );
    const { presentationData } = useSelector(
        (state: RootState) => state.presentationGeneration
    );
    const [error, setError] = useState(false);
    // Function to fetch the slides
    useEffect(() => {
        fetchUserSlides();
    }, []);

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
    const language = presentationData?.presentation?.language || "English";
    // Regular view
    return (
        <div className="flex overflow-hidden flex-col">
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


                <div style={{
                    background: currentColors.background,
                }} className="">
                    <div
                        className="mx-auto flex flex-col items-center  overflow-hidden  justify-center   slide-theme"
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

                            </div>
                        ) : (
                            <>
                                {presentationData &&
                                    presentationData.slides &&
                                    presentationData.slides.length > 0 &&
                                    presentationData.slides.map((slide, index) => (
                                        <div key={index}>

                                            {renderSlideContent(slide, language)}
                                        </div>
                                    ))}
                            </>
                        )}
                    </div>
                </div>

            )}
        </div>
    );
};

export default PresentationPage;
