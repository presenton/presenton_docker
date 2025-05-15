"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Underline from "@tiptap/extension-underline";
import { useDispatch, useSelector } from "react-redux";
import {
  updateInfographicsDescription,
  updateInfographicsTitle,
  updateSlideBodyDescription,
  updateSlideBodyHeading,
  updateSlideBodyString,
  updateSlideDescription,
  updateSlideTitle,
} from "@/store/slices/presentationGeneration";
import {
  Bold,
  Italic,
  Underline as UnderlinedIcon,
  Strikethrough,
  Code,
} from "lucide-react";
import { RootState } from "@/store/store";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font size
       */
      setFontSize: (size: string) => ReturnType;
      /**
       * Unset the font size
       */
      unsetFontSize: () => ReturnType;
    };
  }
}

const TipTapEditor = ({
  content,
  isAlingCenter,
  bodyIdx,
  slideIndex,
  elementId,
  type,
}: {
  content: string;
  isAlingCenter: boolean;
  bodyIdx: number;
  slideIndex: number;
  elementId: string;
  type: string;
}) => {
  const dispatch = useDispatch();
  const { currentColors } = useSelector((state: RootState) => state.theme);

  const getTextStyle = () => {
    const baseStyle = "outline-none  transition-all duration-200 ";
    switch (type) {
      case "title":
        return `${baseStyle} slide-title text-xl sm:text-2xl lg:text-[40px] leading-[36px] lg:leading-[48px] font-bold `;
      case "heading":
      case "info-heading":
        return `${baseStyle} slide-heading  text-base sm:text-lg lg:text-[24px] leading-[26px] lg:leading-[32px] font-bold`;
      case "description":
      case "info-description":
      case "description-body":
      case "heading-description":
        return `${baseStyle} slide-description text-sm sm:text-base lg:text-[20px] leading-[20px] lg:leading-[30px] font-normal`;
      default:
        return `${baseStyle} slide-description text-sm sm:text-base lg:text-[20px] leading-[20px] lg:leading-[30px] font-normal`;
    }
  };

  const updateSlide = (type: string, value: string) => {
    switch (type) {
      case "title": {
        dispatch(updateSlideTitle({ index: slideIndex, title: value }));
        break;
      }
      case "heading": {
        dispatch(
          updateSlideBodyHeading({
            index: slideIndex,
            bodyIdx: bodyIdx,
            heading: value,
          })
        );
        break;
      }
      case "description": {
        dispatch(
          updateSlideDescription({ index: slideIndex, description: value })
        );
        break;
      }
      case "heading-description": {
        dispatch(
          updateSlideBodyDescription({
            index: slideIndex,
            bodyIdx: bodyIdx,
            description: value,
          })
        );
        break;
      }
      case "description-body": {
        dispatch(updateSlideBodyString({ index: slideIndex, body: value }));
        break;
      }
      case "info-heading": {
        dispatch(
          updateInfographicsTitle({
            slideIndex: slideIndex,
            itemIdx: bodyIdx,
            title: value,
          })
        );
        break;
      }
      case "info-description": {
        dispatch(
          updateInfographicsDescription({
            slideIndex: slideIndex,
            itemIdx: bodyIdx,
            description: value,
          })
        );
        break;
      }
      default:
        break;
    }
  };
  const editor = useEditor({
    extensions: [StarterKit, Markdown, Underline],

    content: content,
    editorProps: {
      attributes: {
        class: "outline-none  transition-all duration-200",
      },
    },

    immediatelyRender: false,
  });

  return (
    <div className="relative">
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <div className="flex bg-white rounded-lg shadow-lg p-2 gap-1 border-r pr-2">
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-1 rounded hover:bg-gray-100  ${editor?.isActive("bold") ? "bg-gray-200" : ""
              }`}
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-1 rounded hover:bg-gray-100 ${editor?.isActive("italic") ? "bg-gray-200" : ""
              }`}
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={`p-1 rounded hover:bg-gray-100 ${editor?.isActive("underline") ? "bg-gray-200" : ""
              }`}
          >
            <UnderlinedIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            className={`p-1 rounded hover:bg-gray-100 ${editor?.isActive("strike") ? "bg-gray-200" : ""
              }`}
          >
            <Strikethrough className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleCode().run()}
            className={`p-1 rounded hover:bg-gray-100 ${editor?.isActive("codeBlock") ? "bg-gray-200" : ""
              }`}
          >
            <Code className="h-4 w-4" />
          </button>
        </div>
      </BubbleMenu>

      <EditorContent
        className={`min-w-[100px] w-full max-md:pointer-events-none  ${getTextStyle()} ${editor?.getText() ? "" : `hover:outline hover:outline-gray-400`
          } `}
        onBlur={() => {
          const markdown = editor?.storage.markdown.getMarkdown();
          updateSlide(type, markdown || "");
        }}
        data-slide-element
        data-text-content={editor?.storage.markdown.getMarkdown()}
        data-is-align={isAlingCenter}
        data-slide-index={slideIndex}
        data-element-type="text"
        data-element-id={elementId}
        editor={editor}
      />
    </div>
  );
};

export default TipTapEditor;
