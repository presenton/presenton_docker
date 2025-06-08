/**
 * UploadPage Component
 * 
 * This component handles the presentation generation upload process, allowing users to:
 * - Configure presentation settings (slides, language)
 * - Input prompts
 * - Upload supporting documents and images
 
 * 
 * @component
 */

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  setError,
  setPresentationId,
  setOutlines,
} from "@/store/slices/presentationGeneration";
import { ConfigurationSelects } from "./ConfigurationSelects";
import { PromptInput } from "./PromptInput";
import { LanguageType, PresentationConfig } from "../type";
import SupportingDoc from "./SupportingDoc";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import { OverlayLoader } from "@/components/ui/overlay-loader";
import Wrapper from "@/components/Wrapper";
import { setPptGenUploadState } from "@/store/slices/presentationGenUpload";

// Types for loading state
interface LoadingState {
  isLoading: boolean;
  message: string;
  duration?: number;
  showProgress?: boolean;
  extra_info?: string;
}



interface DecomposedResponse {
  documents: Record<string, any>;
  images: Record<string, any>;
  charts: Record<string, any>;
  tables: Record<string, any>;
}

interface ProcessedData {
  config: PresentationConfig;
  documents: Record<string, any>;
  images: Record<string, any>;
  charts: Record<string, any>;
  tables: Record<string, any>;

}

const UploadPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { toast } = useToast();

  // State management
  const [documents, setDocuments] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [config, setConfig] = useState<PresentationConfig>({
    slides: "8",
    language: LanguageType.English,
    prompt: "",
  });

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: "",
    duration: 4,
    showProgress: false,
    extra_info: "",
  });

  /**
   * Updates the presentation configuration
   * @param key - Configuration key to update
   * @param value - New value for the configuration
   */
  const handleConfigChange = (key: keyof PresentationConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Handles file uploads and separates them into documents and images
   * @param newFiles - Array of files to process
   */
  const handleFilesChange = (newFiles: File[]) => {
    const { docs, imgs } = newFiles.reduce(
      (acc, file) => {
        const isImage = file.type?.startsWith("image/");
        isImage ? acc.imgs.push(file) : acc.docs.push(file);
        return acc;
      },
      { docs: [] as File[], imgs: [] as File[] }
    );

    setDocuments(docs);
    setImages(imgs);
  };

  /**
   * Validates the current configuration and files
   * @returns boolean indicating if the configuration is valid
   */
  const validateConfiguration = (): boolean => {
    if (!config.language || !config.slides) {
      toast({
        title: "Please select number of Slides & Language",
        variant: "destructive",
      });
      return false;
    }

    if (!config.prompt.trim() && documents.length === 0 && images.length === 0) {
      toast({
        title: "No Prompt or Document Provided",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  /**
   * Handles the presentation generation process
   */
  const handleGeneratePresentation = async () => {
    if (!validateConfiguration()) return;

    try {
      const hasUploadedAssets = documents.length > 0 || images.length > 0;

      if (hasUploadedAssets) {
        await handleDocumentProcessing();
      } else {
        await handleDirectPresentationGeneration();
      }
    } catch (error) {
      handleGenerationError(error);
    }
  };

  /**
   * Handles  document processing
   */
  const handleDocumentProcessing = async () => {
    setLoadingState({
      isLoading: true,
      message: "Processing documents...",
      showProgress: true,
      duration: 90,
      extra_info: documents.length > 0 ? "It might take a few minutes for large documents." : "",
    });

    let documentKeys = [];
    let imageKeys = [];

    if (documents.length > 0 || images.length > 0) {
      const uploadResponse = await PresentationGenerationApi.uploadDoc(documents, images);
      documentKeys = uploadResponse["documents"];
      imageKeys = uploadResponse["images"];
    }

    const promises: Promise<any>[] = [];

    if (documents.length > 0 || images.length > 0) {
      promises.push(
        PresentationGenerationApi.decomposeDocuments(documentKeys, imageKeys)
      );
    }

    const responses = await Promise.all(promises);

    const processedData = processApiResponses(responses);

    dispatch(setPptGenUploadState(processedData));
    router.push("/documents-preview");
  };

  /**
   * Processes API responses and formats data for state update
   */
  const processApiResponses = (responses: (any | DecomposedResponse)[],): ProcessedData => {
    const result: ProcessedData = {
      config,
      documents: {},
      images: {},
      charts: {},
      tables: {},
    };

    if (responses.length > 0) {
      const decomposedResponse = responses.shift() as DecomposedResponse;
      Object.assign(result, {
        documents: decomposedResponse.documents || {},
        images: decomposedResponse.images || {},
        charts: decomposedResponse.charts || {},
        tables: decomposedResponse.tables || {},
      });
    }


    return result;
  };

  /**
   * Handles direct presentation generation without documents
   */
  const handleDirectPresentationGeneration = async () => {
    setLoadingState({
      isLoading: true,
      message: "Generating outlines...",
      showProgress: true,
      duration: 30,
    });

    const createResponse = await PresentationGenerationApi.getQuestions({
      prompt: config?.prompt ?? "",
      n_slides: config?.slides ? parseInt(config.slides) : null,
      documents: [],
      images: [],

      language: config?.language ?? "",

    });

    try {
      const presentationWithOutlines = await PresentationGenerationApi.titleGeneration({
        presentation_id: createResponse.id,
      });
      dispatch(setPresentationId(presentationWithOutlines.id));
      dispatch(setOutlines(presentationWithOutlines.outlines));
      router.push("/theme");
    } catch (error) {
      console.error("Error in title generation:", error);
      toast({
        title: "Error in title generation.",
        description: "Please try again.",
        variant: "destructive",
      });
      setLoadingState({
        isLoading: false,
        message: "",
        showProgress: false,
        duration: 0,
      });

    }
  };

  /**
   * Handles errors during presentation generation
   */
  const handleGenerationError = (error: any) => {
    console.error("Error in presentation generation:", error);
    dispatch(setError("Failed to generate presentation"));
    setLoadingState({
      isLoading: false,
      message: "",
      duration: 0,
      showProgress: false,
    });
    toast({
      title: "Error",
      description: "Failed to generate presentation. Please try again.",
      variant: "destructive",
    });
  };

  return (
    <Wrapper className="pb-10 lg:max-w-[70%] xl:max-w-[65%]">
      <OverlayLoader
        show={loadingState.isLoading}
        text={loadingState.message}
        showProgress={loadingState.showProgress}
        duration={loadingState.duration}
        extra_info={loadingState.extra_info}
      />
      <div className="flex flex-col gap-4 md:items-center md:flex-row justify-between py-4">
        <p></p>
        <ConfigurationSelects
          config={config}
          onConfigChange={handleConfigChange}
        />
      </div>
      <div className="relative">
        <PromptInput
          value={config.prompt}
          onChange={(value) => handleConfigChange("prompt", value)}

          data-testid="prompt-input"
        />
      </div>
      <SupportingDoc
        files={[...documents, ...images]}
        onFilesChange={handleFilesChange}
        data-testid="file-upload-input"
      />
      <Button
        onClick={handleGeneratePresentation}
        className="w-full rounded-[32px] flex items-center justify-center py-6 bg-[#5141e5] text-white font-instrument_sans font-semibold text-xl hover:bg-[#5141e5]/80 transition-colors duration-300"
        data-testid="next-button"
      >
        <span>Next</span>
        <ChevronRight className="!w-6 !h-6" />
      </Button>
    </Wrapper>
  );
};

export default UploadPage;
