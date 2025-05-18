import React from "react";

import { Card } from "@/components/ui/card";
import { DashboardApi, PresentationResponse } from "../api/dashboard";
import { DotsVerticalIcon, TrashIcon } from "@radix-ui/react-icons";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { PresentationGenerationApi } from "@/app/(presentation-generator)/services/api/presentation-generation";
import { getStaticFileUrl } from "@/app/(presentation-generator)/utils/others";

export const PresentationCard = ({
  id,
  title,
  created_at,
  thumbnail,
  type,
}: PresentationResponse & { type: "video" | "slide" }) => {
  const router = useRouter();

  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();

    router.push(`/presentation?id=${id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toast({
      title: "Deleting presentation",
      description: "Please wait while we delete the presentation",
      variant: "default",
    });
    const response = await DashboardApi.deletePresentation(id);
    console.log(response);
    if (response) {
      toast({
        title: "Presentation deleted",
        description: "The presentation has been deleted successfully",
        variant: "default",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete presentation",
        variant: "destructive",
      });
    }
    window.location.reload();
  };

  return (
    <Card
      onClick={handlePreview}
      className="bg-white rounded-[8px] cursor-pointer overflow-hidden p-4"
    >
      <div className="space-y-4">
        {/* Date */}
        <div className="flex items-center justify-between">
          <p className="text-[#667085] text-sm font-roboto pt-2">
            {new Date(created_at).toLocaleDateString()}
          </p>
          <Popover>
            <PopoverTrigger onClick={(e) => e.stopPropagation()}>
              <DotsVerticalIcon className="w-4 h-4 text-gray-500" />
            </PopoverTrigger>
            <PopoverContent align="end" className="bg-white w-[200px]">
              <button
                className="flex items-center justify-between w-full px-2 py-1 hover:bg-gray-100"
                onClick={handleDelete}
              >
                <p>Delete</p>
                <TrashIcon className="w-4 h-4 text-red-500" />
              </button>
            </PopoverContent>
          </Popover>
        </div>

        {/* Thumbnail */}
        <div className="relative border-2 border-gray-200 aspect-[16/9] rounded-[8px] overflow-hidden">
          {thumbnail ? (
            <img
              src={getStaticFileUrl(thumbnail)}
              alt={title}
              className="object-cover h-full w-full"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full">
              <p className="text-gray-500 text-sm font-roboto">
                No thumbnail yet
              </p>
              <p className="text-gray-500 text-sm font-roboto">
                Will be added shortly
              </p>
            </div>
          )}
        </div>

        {/* Icon and Title */}
        <div className="flex items-center gap-2 pb-1">
          {type === "video" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full max-w-[20px] max-h-[20px]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15Z"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.52002 7.10938H21.48"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.52002 2.10938V6.96937"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.48 2.10938V6.51937"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.75 14.4501V13.2501C9.75 11.7101 10.84 11.0801 12.17 11.8501L13.21 12.4501L14.25 13.0501C15.58 13.8201 15.58 15.0801 14.25 15.8501L13.21 16.4501L12.17 17.0501C10.84 17.8201 9.75 17.1901 9.75 15.6501V14.4501V14.4501Z"
                stroke="black"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full max-w-[20px] max-h-[20px]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M15.75 0.75V6C15.75 6.42 16.08 6.75 16.5 6.75H21.75M9.75 17.25H7.5C7.08 17.25 6.75 16.92 6.75 16.5V12C6.75 11.58 7.08 11.25 7.5 11.25H13.5C13.92 11.25 14.25 11.58 14.25 12V14.25M21.75 6.3V22.5C21.75 22.92 21.42 23.25 21 23.25H3C2.58 23.25 2.25 22.92 2.25 22.5V1.5C2.25 1.08 2.58 0.75 3 0.75H16.275C16.47 0.75 16.665 0.825 16.815 0.975L21.54 5.775C21.675 5.925 21.75 6.105 21.75 6.3ZM10.5 14.25H16.5C16.92 14.25 17.25 14.58 17.25 15V19.5C17.25 19.92 16.92 20.25 16.5 20.25H10.5C10.08 20.25 9.75 19.92 9.75 19.5V15C9.75 14.58 10.08 14.25 10.5 14.25Z"
                stroke="black"
                strokeWidth="1.5"
              />
            </svg>
          )}

          <p className="text-[#667085] text-sm ml-1 line-clamp-2 font-roboto">
            {title}
          </p>
        </div>
      </div>
    </Card>
  );
};
