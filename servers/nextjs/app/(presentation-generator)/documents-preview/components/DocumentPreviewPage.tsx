/**
 * DocumentPreviewPage Component
 * 
 * A component that displays and manages document previews for presentation generation.
 * Features:
 * - Document content preview with markdown support
 * - Sidebar navigation for documents, reports, and images
 * - Document content editing and saving
 * - Tables and charts display
 * - Presentation generation workflow
 * 
 * @component
 */

"use client";

import styles from "../styles/main.module.css";
import { useEffect, useState, useRef, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { OverlayLoader } from "@/components/ui/overlay-loader";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import { setOutlines, setPresentationId } from "@/store/slices/presentationGeneration";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import MarkdownRenderer from "./MarkdownRenderer";
import { getIconFromFile, removeUUID } from "../../utils/others";
import { ChevronRight, PanelRightOpen, X } from "lucide-react";
import ToolTip from "@/components/ToolTip";
import Header from "@/app/dashboard/components/Header";

// Types
interface LoadingState {
  message: string;
  show: boolean;
  duration: number;
  progress: boolean;
}

interface TextContents {
  [key: string]: string;
}


const DocumentsPreviewPage: React.FC = () => {
  // Hooks
  const dispatch = useDispatch();
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Redux state
  const { config, documents, images, charts, tables } = useSelector(
    (state: RootState) => state.pptGenUpload
  );

  // Local state
  const [textContents, setTextContents] = useState<TextContents>({});
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [downloadingDocuments, setDownloadingDocuments] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [showLoading, setShowLoading] = useState<LoadingState>({
    message: "",
    show: false,
    duration: 10,
    progress: false,
  });

  // Memoized values
  const documentKeys = useMemo(() => Object.keys(documents), [documents]);
  const imageKeys = useMemo(() => Object.keys(images), [images]);
  const allSources = useMemo(() => [...documentKeys, ...imageKeys], [documentKeys, imageKeys]);



  const updateSelectedDocument = (value: string) => {
    setSelectedDocument(value);
    if (textareaRef.current) {
      textareaRef.current.value = textContents[value] || '';
    }
  };


  const readFile = async (filePath: string) => {
    const res = await fetch(`/api/read-file`, {
      method: "POST",
      body: JSON.stringify({ filePath }),
    });
    return res.json();
  }

  const maintainDocumentTexts = async () => {
    const newDocuments: string[] = [];
    const promises: Promise<{ content: string }>[] = [];

    // Process documents
    documentKeys.forEach(key => {
      if (!(key in textContents)) {
        newDocuments.push(key);
        // @ts-ignore
        promises.push(readFile(documents[key]));
      }
    });



    if (promises.length > 0) {
      setDownloadingDocuments(newDocuments);
      try {
        const results = await Promise.all(promises);
        setTextContents(prev => {
          const newContents = { ...prev };
          newDocuments.forEach((key, index) => {
            newContents[key] = results[index].content || "";
          });
          return newContents;
        });
      } catch (error) {
        console.error('Error reading files:', error);
        toast({
          title: "Error",
          description: "Failed to read document content",
          variant: "destructive",
        });
      }
      setDownloadingDocuments([]);
    }
  };



  const documentTablesAndCharts = () => {
    if (!selectedDocument) return [];

    const tablesList = tables[selectedDocument] || [];
    const chartsList = charts[selectedDocument] || [];
    return [...tablesList, ...chartsList];
  };

  const handleCreatePresentation = async () => {
    try {
      setShowLoading({
        message: "Generating presentation outline...",
        show: true,
        duration: 40,
        progress: true,
      });

      const documentPaths = documentKeys.map(key => documents[key]);
      const createResponse = await PresentationGenerationApi.getQuestions({
        prompt: config?.prompt ?? "",
        n_slides: config?.slides ? parseInt(config.slides) : null,
        documents: documentPaths,
        images: imageKeys,
        language: config?.language ?? "",

      });

      try {
        const presentationWithOutlines = await PresentationGenerationApi.titleGeneration({
          presentation_id: createResponse.id,
        });

        dispatch(setPresentationId(presentationWithOutlines.id));
        dispatch(setOutlines(presentationWithOutlines.outlines));

        setShowLoading({
          message: "",
          show: false,
          duration: 0,
          progress: false,
        });

        router.push("/theme");
      } catch (error) {
        console.error("Error in title generation:", error);
        toast({
          title: "Error in title generation.",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in presentation creation:", error);
      toast({
        title: "Error in presentation creation.",
        description: "Please try again.",
        variant: "destructive",
      });
      setShowLoading({
        message: "Error in presentation creation.",
        show: true,
        duration: 10,
        progress: false,
      });
    } finally {
      setShowLoading({
        message: "",
        show: false,
        duration: 10,
        progress: false,
      });
    }
  };

  // Effects
  useEffect(() => {
    if (allSources.length > 0) {
      setSelectedDocument(allSources[0]);
      maintainDocumentTexts();
    }
  }, [allSources]);

  // Render helpers
  const renderDocumentContent = () => {
    if (!selectedDocument) return null;

    const isDocument = documentKeys.includes(selectedDocument);
    const hasTablesAndCharts = documentTablesAndCharts().length > 0;

    if (!isDocument) return null;

    return (
      <div className="h-full mr-4">
        <div className={`overflow-y-auto custom_scrollbar ${hasTablesAndCharts ? "h-[calc(100vh-300px)]" : "h-full"
          }`}>
          <div className="h-full w-full max-w-full flex flex-col mb-5">
            <h1 className="text-2xl font-medium mb-5">Content:</h1>
            {downloadingDocuments.includes(selectedDocument) ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <MarkdownRenderer content={textContents[selectedDocument] || ""} />
            )}
          </div>
        </div>
        {hasTablesAndCharts && (
          <div className="py-4">
            <h1 className="text-2xl font-medium mb-5">Tables And Charts</h1>
            {documentTablesAndCharts().map((item, index) => (
              <div
                key={index}
                className="w-full border rounded-lg p-4 my-4 bg-white shadow-sm"
              >
                {item.markdown && (
                  <MarkdownRenderer
                    key={selectedDocument}
                    content={item.markdown}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSidebar = () => {
    if (!isOpen) return null;

    return (
      <div className={`${styles.sidebar} fixed xl:relative w-full z-50 xl:z-auto
        transition-all duration-300 ease-in-out max-w-[200px] md:max-w-[300px] h-[85vh] rounded-md p-5`}>
        <X
          onClick={() => setIsOpen(false)}
          className="text-black mb-4 ml-auto mr-0 cursor-pointer hover:text-gray-600"
          size={20}
        />



        {documentKeys.length > 0 && (
          <div className="mt-8">
            <p className="text-xs mt-2 text-[#2E2E2E] opacity-70">DOCUMENTS</p>
            <div className="flex flex-col gap-2 mt-6">
              {documentKeys.map((key) => (
                <div
                  key={key}
                  onClick={() => updateSelectedDocument(key)}
                  className={`${selectedDocument === key ? styles.selected_border : ""
                    } flex p-2 rounded-sm gap-2 items-center cursor-pointer`}
                >
                  <img
                    className="h-6 w-6 border border-gray-200"
                    src={getIconFromFile(key)}
                    alt="Document icon"
                  />
                  <span className="text-sm h-6 text-[#2E2E2E] overflow-hidden">
                    {key.split("/").pop() ?? "file.txt"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {imageKeys.length > 0 && (
          <div className="mt-8">
            <p className="text-xs mt-2 text-[#2E2E2E] opacity-70">IMAGES</p>
            <div className="flex flex-col gap-2 mt-6">
              {imageKeys.map((key) => (
                <div
                  key={key}
                  onClick={() => updateSelectedDocument(key)}
                  className="cursor-pointer"
                >
                  <img
                    className={`${selectedDocument === key
                      ? styles.selected_border
                      : styles.unselected_border
                      } ${styles.uploaded_images} rounded-lg h-24 w-full border border-gray-200`}
                    src={images[key]}
                    alt="Uploaded image"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${styles.wrapper} min-h-screen flex flex-col w-full`}>
      <OverlayLoader
        show={showLoading.show}
        text={showLoading.message}
        showProgress={showLoading.progress}
        duration={showLoading.duration}
      />
      <Header />
      <div className="flex mt-6 gap-4 font-instrument_sans">
        {!isOpen && (
          <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
            <ToolTip content="Open Panel">
              <Button
                onClick={() => setIsOpen(true)}
                className="bg-[#5146E5] text-white p-3 shadow-lg"
              >
                <PanelRightOpen className="text-white" size={20} />
              </Button>
            </ToolTip>
          </div>
        )}

        {renderSidebar()}

        <div className="bg-white w-full mx-2 sm:mx-4 h-[calc(100vh-100px)] custom_scrollbar rounded-md overflow-y-auto py-6 pl-6">
          {renderDocumentContent()}
        </div>

        <div className="fixed bottom-5 right-5">
          <Button
            onClick={handleCreatePresentation}
            className="flex items-center gap-2 px-8 py-6 rounded-sm text-md bg-[#5146E5] hover:bg-[#5146E5]/90"
          >
            <span className="text-white font-semibold">Next</span>
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPreviewPage;
