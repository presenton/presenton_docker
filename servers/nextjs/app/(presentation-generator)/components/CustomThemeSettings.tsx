import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  setThemeColors,
  setTheme,
  setLoadingState,
} from "../store/themeSlice";
import { ThemeType } from "../upload/type";

import { useThemeService, ThemeColors } from "../services/themeService";
import { PresentationGenerationApi } from "../services/api/presentation-generation";

interface CustomThemeSettingsProps {
  onClose?: () => void;
  presentationId: string;
}

const CustomThemeSettings = ({
  onClose,
  presentationId,
}: CustomThemeSettingsProps) => {
  const dispatch = useDispatch();
  const [draftColors, setDraftColors] = useState<ThemeColors>({
    background: "#63ceff",
    slideBg: "#F4F4F4",
    slideTitle: "#1A1A1A",
    slideHeading: "#2D2D2D",
    slideDescription: "#4A4A4A",
    slideBox: "#d8c6c6",
    iconBg: "#281810",
    chartColors: ["#281810", "#4A3728", "#665E57", "#665E57", "#665E57"],
    fontFamily: "var(--font-inter)",
  });

  const themeService = useThemeService();

  // Refs for tracking drag state and RAF
  const isDragging = useRef(false);
  const rafId = useRef<number>();
  const currentKey = useRef<string>();
  const currentValue = useRef<string>();

  const updateDraftColor = (key: string, value: string) => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      setDraftColors((prev) => ({
        ...prev,
        [key]: value,
      }));
    });
  };

  const handleColorPickerChange = (key: string, value: string) => {
    if (isDragging.current) {
      // Update refs for current values
      currentKey.current = key;
      currentValue.current = value;
      // Update preview immediately
      const previewElement = document.getElementById(`preview-${key}`);
      if (previewElement) {
        previewElement.style.backgroundColor = value;
      }
    } else {
      // For non-drag changes (like text input), update immediately
      updateDraftColor(key, value);
    }
  };

  const handleColorPickerMouseDown = () => {
    isDragging.current = true;
  };

  const handleColorPickerMouseUp = () => {
    isDragging.current = false;
    // Apply the final color value
    if (currentKey.current && currentValue.current) {
      updateDraftColor(currentKey.current, currentValue.current);
    }
  };

  const handleTextInputChange = (key: string, value: string) => {
    updateDraftColor(key, value);
  };

  const handleSave = async () => {
    try {
      // Update UI immediately
      const themeType = "custom" as ThemeType;
      dispatch(setTheme(themeType));
      dispatch(
        setThemeColors({
          ...draftColors,
          theme: themeType,
        })
      );

      // Set CSS variables
      const root = document.documentElement;
      root.style.setProperty("--custom-slide-bg", draftColors.slideBg);
      root.style.setProperty("--custom-slide-title", draftColors.slideTitle);
      root.style.setProperty(
        "--custom-slide-heading",
        draftColors.slideHeading
      );
      root.style.setProperty(
        "--custom-slide-description",
        draftColors.slideDescription
      );
      root.style.setProperty("--custom-slide-box", draftColors.slideBox);
      root.style.setProperty("--custom-icon-bg", draftColors.iconBg);

      // Save to file and API
      await Promise.all([
        PresentationGenerationApi.setThemeColors(presentationId, {
          name: themeType,
          colors: {
            ...draftColors,
          },
        }),
        themeService.saveTheme({
          name: "custom",
          colors: {
            ...draftColors,
            theme: themeType,
          },
        }),
      ]);

      onClose?.();
    } catch (error) {
      console.error("Failed to save custom theme:", error);
    }
  };

  // Load saved theme
  React.useEffect(() => {
    const loadSavedCustomTheme = async () => {
      try {
        dispatch(setLoadingState(true));
        const savedTheme = await themeService.getTheme();
        if (savedTheme) {
          setDraftColors(savedTheme.colors);
        }
      } catch (error) {
        console.error("Failed to load theme preferences:", error);
      } finally {
        dispatch(setLoadingState(false));
      }
    };

    loadSavedCustomTheme();
  }, []);

  // Cleanup RAF on unmount
  React.useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  const colorInputs = [
    { key: "background", label: "Background Color", icon: "🎨" },
    { key: "slideBg", label: "Slide Background Color", icon: "🎨" },
    { key: "slideTitle", label: "Title Color", icon: "📝" },
    { key: "slideHeading", label: "Heading Color", icon: "🔤" },
    { key: "slideDescription", label: "Description Color", icon: "📄" },
    { key: "slideBox", label: "Box Color", icon: "📦" },
    { key: "iconBg", label: "Icon Background Color", icon: "📦" },
  ];

  return (
    <div className="">
      <div className="h-[60vh] font-inter overflow-y-auto custom_scrollbar pr-2 pb-2">
        {/* Live Preview */}
        <div className=" w-full space-y-2">
          <h3 className="text-xs font-medium text-gray-500">Live Preview</h3>
          <div
            style={{
              backgroundColor: draftColors.background,
            }}
            className="p-3 rounded-lg"
          >
            <div
              className="w-full h-28 rounded-lg shadow-sm transition-all overflow-hidden"
              style={{
                backgroundColor: draftColors.slideBg,
                padding: "0.75rem",
              }}
            >
              <div
                style={{ color: draftColors.slideTitle }}
                className="text-base font-bold mb-2"
              >
                Sample Title
              </div>
              <div
                style={{ color: draftColors.slideHeading }}
                className="text-sm mb-1"
              >
                Heading
              </div>
              <div
                style={{ color: draftColors.slideDescription }}
                className="text-xs"
              >
                Description text
              </div>
              <div
                style={{ backgroundColor: draftColors.slideBox }}
                className="mt-2 p-1.5 rounded w-20"
              ></div>
            </div>
          </div>
        </div>
        <div className="w-full grid grid-cols-1 gap-4">
          {colorInputs.map(({ key, label, icon }) => (
            <div
              key={key}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="relative group">
                <Input
                  type="color"
                  id={key}
                  value={draftColors[key as keyof typeof draftColors]}
                  onChange={(e) => handleColorPickerChange(key, e.target.value)}
                  onMouseDown={() => handleColorPickerMouseDown()}
                  onMouseUp={() => handleColorPickerMouseUp()}
                  onTouchStart={() => handleColorPickerMouseDown()}
                  onTouchEnd={() => handleColorPickerMouseUp()}
                  className="w-12 h-12 p-1 cursor-pointer border rounded-lg transition-all hover:border-[#5146E5] focus:border-[#5146E5]"
                />
                <div
                  id={`preview-${key}`}
                  className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none"
                  style={{
                    backgroundColor: draftColors[
                      key as keyof typeof draftColors
                    ] as string,
                  }}
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor={key}
                  className="text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  <span>{icon}</span>
                  {label}
                </Label>
                <Input
                  type="text"
                  value={draftColors[key as keyof typeof draftColors]}
                  onChange={(e) => handleTextInputChange(key, e.target.value)}
                  className="h-8 font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 pt-4 font-roboto  border-t flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onClose}
          className="px-4 h-9 text-sm"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="bg-[#5146E5] hover:bg-[#4338ca] text-white px-4 h-9 text-sm"
        >
          Save Theme
        </Button>
      </div>
    </div>
  );
};

export default CustomThemeSettings;
