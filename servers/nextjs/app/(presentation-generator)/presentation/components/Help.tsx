import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, X, Search } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

const helpQuestions = [
  {
    id: 1,
    category: "Images",
    question: "How do I change an image?",
    answer:
      "Click on any image to reveal the image toolbar. You'll see options to Edit, Adjust position, and change how the image fits within its container. The Edit option allows you to replace or modify the current image.",
  },
  {
    id: 2,
    category: "Images",
    question: "Can I generate new images with AI?",
    answer:
      "Yes! Click on any image and select the Edit option from the toolbar. In the side panel that appears, you'll find the AI Generate tab. Enter your prompt describing the image you want, and our AI will generate an image based on your description.",
  },
  {
    id: 3,
    category: "Images",
    question: "How do I upload my own images?",
    answer:
      "Click on any image, then select Edit from the toolbar. In the side panel, click on the Upload tab at the top. You can browse your files to select one. Once uploaded, you can apply it to your design.",
  },
  {
    id: 11,
    category: "AI Prompts",
    question: "Can I change slide layout through prompt?",
    answer:
      "Yes you can! Click on the WandSparkles icon on the top left of each slide and it will give you a prompt input box. Describe your layout requirements and the AI will change the slide layout accordingly.",
  },
  {
    id: 12,
    category: "AI Prompts",
    question: "Can I change slide image through prompt?",
    answer:
      "Yes you can! Click on the WandSparkles icon on the top left of each slide and it will give you a prompt input box. Describe the image you want and the AI will update the slide image based on your requirements.",
  },

  {
    id: 14,
    category: "AI Prompts",
    question: "Can I change content through prompt?",
    answer:
      "Yes you can! Click on the WandSparkles icon on the top left of each slide and it will give you a prompt input box. Describe what content you want and the AI will update the slide's text and content based on your description.",
  },
  {
    id: 4,
    category: "Text",
    question: "How can I format and highlight text?",
    answer:
      "Select any text to see the formatting toolbar appear. You'll have options for Bold, Italic, Underline, Strikethrough,and more.",
  },
  {
    id: 5,
    category: "Icons",
    question: "How do I change icons?",
    answer:
      "Click on any existing icon to modify it. In the icon selector panel, you can browse icos or use the search function to find specific icons. We offer thousands of icons in various styles.",
  },
  {
    id: 16,
    category: "Layout",
    question: "Can I change the position of slide?",
    answer:
      "Of course, On side panel you can drag the slide and place wherever you want.",
  },
  {
    id: 15,
    category: "Layout",
    question: "Can I add new slide between the slide?",
    answer:
      "Yes you can just click on the plus icon below each slide.It will display the all the layouts and choose required one.",
  },
  {
    id: 6,
    category: "Layout",
    question: "Can I add more sections to my slides?",
    answer:
      "Absolutely! Hover near the bottom of any text box or content block, and you'll see a + icon appear. Click this button to add a new section below the current one. You can also use the Insert menu to add specific section types.",
  },
  {
    id: 7,
    category: "Layout",
    question: "How do I add a consistent footer to all slides?",
    answer:
      "Look for the 'Insert your logo' option at the bottom left of the slide. Clicking this will open a side panel where you can customize your footer content, including logos, text, and more. Changes will apply to all slides automatically.",
  },
  {
    id: 8,
    category: "Export",
    question: "How do I download or export my presentation?",
    answer:
      "Click the Export button in the top right menu. You can choose to download as PDF, PowerPoint.",
  },
];

const Help = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredQuestions, setFilteredQuestions] = useState(helpQuestions);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const modalRef = useRef<HTMLDivElement>(null);

  // Extract unique categories and create "All" category list
  useEffect(() => {
    const uniqueCategories = Array.from(
      new Set(helpQuestions.map((q) => q.category))
    );
    setCategories(["All", ...uniqueCategories]);
  }, []);

  // Filter questions based on search query and selected category
  useEffect(() => {
    let results = helpQuestions;

    // Filter by category if not "All"
    if (selectedCategory !== "All") {
      results = results.filter((q) => q.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (q) =>
          q.question.toLowerCase().includes(query) ||
          q.answer.toLowerCase().includes(query)
      );
    }

    setFilteredQuestions(results);
  }, [searchQuery, selectedCategory]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        !event.target.closest(".help-button")
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleOpenClose = () => {
    setIsOpen(!isOpen);
  };

  // Animation helpers
  const modalClass = isOpen
    ? "opacity-100 scale-100"
    : "opacity-0 scale-95 pointer-events-none";

  return (
    <>
      {/* Help Button */}
      <button
        onClick={handleOpenClose}
        className="help-button hidden fixed bottom-6 right-6 h-12 w-12 z-50 bg-emerald-600 hover:bg-emerald-700 rounded-full md:flex justify-center items-center cursor-pointer shadow-lg transition-all duration-300 hover:shadow-xl"
        aria-label="Help Center"
      >
        {isOpen ? (
          <X className="text-white h-5 w-5" />
        ) : (
          <HelpCircle className="text-white h-5 w-5" />
        )}
      </button>

      {/* Help Modal */}
      <div
        className={`fixed bottom-20 right-6 z-50 max-w-md w-full transition-all duration-300 transform ${modalClass}`}
        ref={modalRef}
      >
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-600 text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-medium">Help Center</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-emerald-700 p-1 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-6 pt-4 pb-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Category Pills */}
          <div className="px-6 pb-3 flex gap-2 overflow-x-auto hide-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="max-h-96 overflow-y-auto px-6 pb-6">
            {filteredQuestions.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {filteredQuestions.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <AccordionTrigger className="hover:no-underline py-3 px-1 text-left flex">
                      <div className="flex-1 pr-2">
                        <span className="text-gray-900 font-medium text-sm md:text-base">
                          {faq.question}
                        </span>
                        <span className="block text-xs text-emerald-600 mt-0.5">
                          {faq.category}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-1 pb-3">
                      <div className="text-sm text-gray-600 leading-relaxed rounded bg-gray-50 p-3">
                        {faq.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p>No results found for "{searchQuery}"</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="mt-2 text-emerald-600 hover:underline text-sm"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 text-center">
            Still need help?{" "}
            <a href="/contact" className="text-emerald-600 hover:underline">
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* Custom AccordionTrigger implementation (since shadcn's might not be available) */}
      {!AccordionTrigger && (
        <style jsx>{`
          .accordion-trigger {
            display: flex;
            width: 100%;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            text-align: left;
            transition: all 0.2s;
          }
          .accordion-trigger:hover {
            background-color: rgba(0, 0, 0, 0.02);
          }
          .accordion-content {
            overflow: hidden;
            height: 0;
            transition: height 0.2s ease;
          }
          .accordion-content[data-state="open"] {
            height: auto;
          }
        `}</style>
      )}
    </>
  );
};

export default Help;
