"use client";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Palette,
  SquareArrowOutUpRight,
  Play,
  Loader2,
  ExternalLink,
} from "lucide-react";
import React, { useState } from "react";
import Wrapper from "@/components/Wrapper";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import UserAccount from "../../components/UserAccount";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import { OverlayLoader } from "@/components/ui/overlay-loader";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDispatch, useSelector } from "react-redux";

import Link from "next/link";

import { ThemeType } from "@/app/(presentation-generator)/upload/type";
import {
  setTheme,
  setThemeColors,
  defaultColors,
  serverColors,
} from "../../store/themeSlice";
import CustomThemeSettings from "../../components/CustomThemeSettings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RootState } from "@/store/store";
import { toast } from "@/hooks/use-toast";

import ThemeSelector from "./ThemeSelector";
import Modal from "./Modal";

import Announcement from "@/components/Announcement";
import { getFontLink } from "../../utils/others";

const Header = ({
  presentation_id,
  currentSlide,
}: {
  presentation_id: string;
  currentSlide?: number;
}) => {
  const [open, setOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const router = useRouter();

  const [showCustomThemeModal, setShowCustomThemeModal] = useState(false);
  const { currentTheme, currentColors } = useSelector(
    (state: RootState) => state.theme
  );
  const { presentationData, isStreaming } = useSelector(
    (state: RootState) => state.presentationGeneration
  );
  const dispatch = useDispatch();
  const handleThemeSelect = async (value: string) => {
    if (isStreaming) return;
    if (value === "custom") {
      setShowCustomThemeModal(true);
      return;
    } else {
      const themeType = value as ThemeType;
      const themeColors = serverColors[themeType] || defaultColors[themeType];

      if (themeColors) {
        try {
          // Update UI
          dispatch(setTheme(themeType));
          dispatch(setThemeColors({ ...themeColors, theme: themeType }));
          // Set CSS variables
          const root = document.documentElement;
          root.style.setProperty(
            `--${themeType}-slide-bg`,
            themeColors.slideBg
          );
          root.style.setProperty(
            `--${themeType}-slide-title`,
            themeColors.slideTitle
          );
          root.style.setProperty(
            `--${themeType}-slide-heading`,
            themeColors.slideHeading
          );
          root.style.setProperty(
            `--${themeType}-slide-description`,
            themeColors.slideDescription
          );
          root.style.setProperty(
            `--${themeType}-slide-box`,
            themeColors.slideBox
          );

          // Save in background
          await PresentationGenerationApi.setThemeColors(presentation_id, {
            name: themeType,
            colors: {
              ...themeColors,
            },
          });
        } catch (error) {
          console.error("Failed to update theme:", error);
          toast({
            title: "Error updating theme",
            description:
              "Failed to update the presentation theme. Please try again.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const getSlideMetadata = async () => {
    try {
      // Get the current URL without any query parameters
      // const baseUrl = `${window.location.origin}/pdf-maker?id=${presentation_id}`;
      const baseUrl = window.location.href;
      // @ts-ignore
      const metadata = await window.electron.getSlideMetadata(
        baseUrl,
        currentTheme,
        currentColors,
      );

      console.log("metadata", metadata);
      return metadata;
    } catch (error) {
      setShowLoader(false);
      console.error("Error fetching metadata:", error);
      toast({
        title: "Error fetching slide metadata",
        description: error instanceof Error ? error.message : "Failed to fetch metadata",
        variant: "destructive",
      });
      throw error;
    }
  };
  const metaData = async () => {
    const body = {
      presentation_id: presentation_id,
      slides: presentationData?.slides,
    };
    await PresentationGenerationApi.updatePresentationContent(body)
      .then(() => { })
      .catch((error) => {
        console.error(error);
      });

    const metadata = await getSlideMetadata();

    const slides = metadata.map((slide: any, index: any) => {
      return {
        shapes: slide.elements,
      };
    });

    const apiBody = {
      presentation_id: presentation_id,
      pptx_model: {
        background_color: metadata[0].backgroundColor,

        slides: slides,
      },
    };

    return apiBody;
  };
  const handleExportPptx = async () => {
    if (isStreaming) return;

    try {
      setOpen(false);
      setShowLoader(true);

      const apiBody = await metaData();

      const response = await PresentationGenerationApi.exportAsPPTX(apiBody);
      if (response.path) {
        setShowLoader(false);
        // @ts-ignore
        const ipcResponse = await window.electron.fileDownloaded(response.path);
        if (!ipcResponse.success) {
          throw new Error("Failed to download file");
        }
      } else {
        throw new Error("No URL returned from export");
      }
    } catch (error) {
      console.error("Export failed:", error);
      setShowLoader(false);
      toast({
        title: "Having trouble exporting!",
        description:
          "We are having trouble exporting your presentation. Please try again.",
        variant: "default",
      });
    } finally {
      setShowLoader(false);
    }
  };

  const handleExportPdf = async () => {
    if (isStreaming) return;

    setOpen(false);
    try {
      toast({
        title: "Exporting presentation...",
        description: "Please wait while we export your presentation.",
        variant: "default",
      });

      // @ts-ignore
      const ipcResponse = await window.electron.exportAsPDF(presentation_id, presentationData!.presentation!.title);
      if (!ipcResponse.success) {
        throw new Error("Failed to export as PDF");
      }

    } catch (err) {
      console.error(err);
      toast({
        title: "Having trouble exporting!",
        description:
          "We are having trouble exporting your presentation. Please try again.",
        variant: "default",
      });
    }
  };

  const ExportOptions = () => (
    <div className="space-y-2 max-md:mt-4 bg-white rounded-lg">
      <Button
        onClick={handleExportPdf}
        variant="ghost"
        className="pb-4 border-b rounded-none border-gray-300 w-full flex justify-start text-[#5146E5]"
      >
        <img src="/pdf.svg" alt="pdf export" width={30} height={30} />
        Export as PDF
      </Button>
      <Button
        onClick={handleExportPptx}
        variant="ghost"
        className="w-full flex justify-start text-[#5146E5]"
      >
        <img src="/pptx.svg" alt="pptx export" width={30} height={30} />
        Export as PPTX
      </Button>
      <p className="text-sm pt-3 border-t border-gray-300">
        Font Used:
        <a className="text-blue-500  flex items-center gap-1" href={getFontLink(currentColors.fontFamily).link || ''} target="_blank" rel="noopener noreferrer">
          {getFontLink(currentColors.fontFamily).name || ''} <ExternalLink className="w-4 h-4" />
        </a>
      </p>
    </div>
  );

  const MenuItems = () => (
    <div className="flex flex-col lg:flex-row items-center gap-4">
      {/* Present Button */}
      <Button
        onClick={() => router.push(`?id=${presentation_id}&mode=present&slide=${currentSlide || 0}`)}
        variant="ghost"
        className="border border-white font-bold text-white rounded-[32px] transition-all duration-300 group"
      >
        <Play className="w-4 h-4 mr-1 stroke-white group-hover:stroke-black" />
        Present
      </Button>

      {/* Desktop Export Button with Popover */}

      <div className="hidden lg:block">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button className="bg-white border py-5 text-[#5146E5] font-bold rounded-[32px] transition-all duration-500 hover:border hover:bg-[#5146E5] hover:text-white w-full">
              <SquareArrowOutUpRight className="w-4 h-4 mr-1" />
              Export
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[250px] space-y-2 py-3 px-2">
            <ExportOptions />
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile Export Section */}
      <div className="lg:hidden flex flex-col w-full">
        <ExportOptions />
      </div>
    </div>
  );

  return (
    <div className="bg-[#5146E5] w-full shadow-lg sticky top-0 z-50">
      <OverlayLoader
        show={showLoader}
        text="Exporting presentation..."
        showProgress={true}
        duration={40}
      />
      <Announcement />
      <Wrapper className="flex items-center justify-between py-2">
        <Link href="/dashboard" className="min-w-[162px]">
          <img
            src="/logo-white.png"
            alt="Presentation logo"
            width={162}
            height={32}
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-4 2xl:gap-6">
          {isStreaming && (
            <Loader2 className="animate-spin text-white font-bold w-6 h-6" />
          )}
          <Select value={currentTheme} onValueChange={handleThemeSelect}>
            <SelectTrigger className="w-[160px] bg-[#6358fd] text-white border-none hover:bg-[#5146E5] transition-colors">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span>Change Theme</span>
              </div>
            </SelectTrigger>
            <SelectContent className="w-[300px] p-0">
              <ThemeSelector
                onSelect={handleThemeSelect}
                selectedTheme={currentTheme}
              />
            </SelectContent>
          </Select>
          {/* Custom Theme Modal */}
          <Modal
            isOpen={showCustomThemeModal}
            onClose={() => setShowCustomThemeModal(false)}
            title="Custom Theme Colors"
          >
            <CustomThemeSettings
              onClose={() => setShowCustomThemeModal(false)}
              presentationId={presentation_id}
            />
          </Modal>
          <MenuItems />
          <UserAccount />
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden flex items-center gap-4">
          <UserAccount />
          <Sheet>
            <SheetTrigger asChild>
              <button className="text-white">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#5146E5] border-none p-4">
              <div className="flex flex-col gap-6 mt-10">
                <Select onValueChange={handleThemeSelect}>
                  <SelectTrigger className="w-full bg-[#6358fd] flex justify-center gap-2 text-white border-none">
                    <Palette className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light Theme</SelectItem>
                    <SelectItem value="dark">Dark Theme</SelectItem>
                    <SelectItem value="royal_blue">Royal Blue Theme</SelectItem>
                    <SelectItem value="cream">Cream Theme</SelectItem>
                    <SelectItem value="dark_pink">Dark Pink Theme</SelectItem>
                    <SelectItem value="light_red">Light Red Theme</SelectItem>
                    <SelectItem value="faint_yellow">
                      Faint Yellow Theme
                    </SelectItem>
                    <SelectItem value="custom">Custom Theme</SelectItem>
                  </SelectContent>
                </Select>
                <MenuItems />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Wrapper>
    </div>
  );
};

export default Header;
