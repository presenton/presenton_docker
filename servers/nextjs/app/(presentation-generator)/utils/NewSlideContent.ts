import { randomChartGenerator } from "@/lib/utils";
import { Slide } from "../types/slide";
import { generateRandomId } from "./others";

const randomGraph = (presentation_id: string) => {
  const randomData = randomChartGenerator();

  return {
    id: generateRandomId(),
    name: "Sales Performance",
    type: "bar",
    presentation: presentation_id,
    postfix: "",
    data: randomData,
  };
};

export const getEmptySlideContent = (
  type: number,
  index: number,
  presentation_id: string
): Slide => {
  const baseSlide: Slide = {
    id: generateRandomId(),
    type,
    index,
    design_index: 1,
    properties: null,
    images: [],
    icons: [],
    graph_id: null,
    presentation: presentation_id,
    content: {
      title: "",
      body: "",
      infographics: [],
    },
  };
  const graph = randomGraph(presentation_id);

  switch (type) {
    case 1:
      return {
        ...baseSlide,
        images: [""],
        content: {
          title: "New Title",
          body: "Add your description here",
          image_prompts: [""],
        },
      };
    case 2:
      return {
        ...baseSlide,
        content: {
          title: "New Title",
          body: [
            { heading: "First Point", description: "Add description" },
            { heading: "Second Point", description: "Add description" },
          ],
        },
      };
    case 4:
      return {
        ...baseSlide,
        images: ["", "", ""],
        content: {
          title: "New Title",
          body: [
            { heading: "First Item", description: "Add description" },
            { heading: "Second Item", description: "Add description" },
            { heading: "Third Item", description: "Add description" },
          ],
          image_prompts: ["", "", ""],
        },
      };
    case 5:
      return {
        ...baseSlide,
        graph_id: graph.id,
        content: {
          graph: graph,
          title: "New Title",
          body: "Add your description here",
        },
      };
    case 6:
      return {
        ...baseSlide,
        content: {
          title: "New Title",
          description: "Add your description here",
          body: [
            { heading: "First Point", description: "Add description" },
            { heading: "Second Point", description: "Add description" },
          ],
        },
      };
    case 7:
      return {
        ...baseSlide,
        icons: ["", "", ""],
        content: {
          title: "New Title",
          body: [
            { heading: "First Point", description: "Add description" },
            { heading: "Second Point", description: "Add description" },
          ],
          icon_queries: [
            {
              queries: [""],
            },
          ],
        },
      };
    case 8:
      return {
        ...baseSlide,
        icons: ["", "", ""],
        content: {
          title: "New Title",
          description: "Add your description here",
          body: [
            { heading: "First Point", description: "Add description" },
            { heading: "Second Point", description: "Add description" },
          ],
          icon_queries: [
            {
              queries: [""],
            },
          ],
        },
      };
    case 9:
      return {
        ...baseSlide,
        graph_id: graph.id,
        content: {
          graph: graph,
          title: "New Subheading",
          body: [
            { heading: "First Point", description: "Add description" },
            { heading: "Second Point", description: "Add description" },
          ],
        },
      };
    
    default:
      return baseSlide;
  }
};
