"use client";

import React from "react";

import { marked } from "marked";
interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const markdownContent = marked.parse(content);
  return (
    <div
      className="prose prose-slate max-w-none mb-10"
      dangerouslySetInnerHTML={{ __html: markdownContent }}
    />
  );
};

export default MarkdownRenderer;
