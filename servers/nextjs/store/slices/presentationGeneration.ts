import { Slide } from "@/app/(presentation-generator)/types/slide";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Series {
  data: number[];
  name?: string;
}
interface DataLabel {
  dataLabelPosition: "Outside" | "Inside";
  dataLabelAlignment: "Base" | "Center" | "End";
}
export interface ChartSettings {
  showLegend: boolean;
  showGrid: boolean;
  showAxisLabel: boolean;
  showDataLabel: boolean;
  dataLabel: DataLabel;
}

export interface Chart {
  id: string;
  name: string;
  type: string;
  style: ChartSettings | {} | null;
  unit?: string | null;
  presentation: string;
  postfix: string;
  data: {
    categories: string[];
    series: Series[];
  };
}
export interface PresentationData {
  presentation: {
    created_at: string;
    data: string | null;
    file: string;
    id: string;
    user_id: string;
    n_slides: number;
    prompt: string;
    summary: string | null;
    theme: string | null;
    title: string;
    titles: string[];
    vector_store: string | null;
    thumbnail: string | null;
    language: string;
  } | null;
  slides: Slide[];
}

interface PresentationGenerationState {
  presentation_id: string | null;
  documents: string[];
  images: string[];
  isLoading: boolean;
  isStreaming: boolean | null;
  titles: string[];
  error: string | null;
  presentationData: PresentationData | null;
}

const initialState: PresentationGenerationState = {
  presentation_id: null,
  documents: [],
  images: [],
  titles: [],
  isLoading: false,
  isStreaming: null,
  error: null,
  presentationData: null,
};

const presentationGenerationSlice = createSlice({
  name: "presentationGeneration",
  initialState,
  reducers: {
    setStreaming: (state, action: PayloadAction<boolean>) => {
      state.isStreaming = action.payload;
    },
    // Loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    // Presentation ID
    setPresentationId: (state, action: PayloadAction<string>) => {
      state.presentation_id = action.payload;
      state.error = null;
    },
    // Error
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    // Clear presentation data
    clearPresentationData: (state) => {
      state.presentation_id = null;
      state.error = null;
      state.isLoading = false;
    },
    // Set documents
    setDocs: (state, action: PayloadAction<string[]>) => {
      state.documents = action.payload;
    },
    // Set images
    setImgs: (state, action: PayloadAction<string[]>) => {
      state.images = action.payload;
    },
    // Set title with charts
    setTitles: (state, action: PayloadAction<string[]>) => {
      state.titles = action.payload;
    },
    // Set presentation data
    setPresentationData: (state, action: PayloadAction<PresentationData>) => {
      state.presentationData = action.payload;
    },
    deleteTitle: (state, action: PayloadAction<{ index: number }>) => {
      if (state.titles) {
        // Remove the slide at the given index
        state.titles = state.titles.filter(
          (_, idx) => idx !== action.payload.index
        );
      }
    },
    // SLIDE OPERATIONS
    addSlide: (
      state,
      action: PayloadAction<{ slide: Slide; index: number }>
    ) => {
      if (state.presentationData?.slides) {
        // Insert the new slide at the specified index
        state.presentationData.slides.splice(
          action.payload.index,
          0,
          action.payload.slide
        );

        // Update indices for all slides to ensure they remain sequential
        state.presentationData.slides = state.presentationData.slides.map(
          (slide, idx) => ({
            ...slide,
            index: idx,
          })
        );
      }
    },
    deletePresentationSlide: (state, action: PayloadAction<number>) => {
      if (state.presentationData) {
        state.presentationData.slides.splice(action.payload, 1);
        state.presentationData.slides = state.presentationData.slides.map(
          (slide, idx) => ({
            ...slide,
            index: idx,
          })
        );
      }
    },
    updateSlide: (
      state,
      action: PayloadAction<{ index: number; slide: Slide }>
    ) => {
      if (
        state.presentationData &&
        state.presentationData.slides[action.payload.index]
      ) {
        state.presentationData.slides[action.payload.index] =
          action.payload.slide;
      }
    },
    updateSlideVariant: (
      state,
      action: PayloadAction<{ index: number; variant: number }>
    ) => {
      if (
        state.presentationData &&
        state.presentationData.slides[action.payload.index]
      ) {
        state.presentationData.slides[action.payload.index].design_index =
          action.payload.variant;
      }
    },
    updateSlideTitle: (
      state,
      action: PayloadAction<{ index: number; title: string }>
    ) => {
      if (state.presentationData?.slides[action.payload.index]) {
        state.presentationData.slides[action.payload.index].content.title =
          action.payload.title;
      }
    },
    updateSlideDescription: (
      state,
      action: PayloadAction<{ index: number; description: string }>
    ) => {
      if (state.presentationData?.slides[action.payload.index]) {
        state.presentationData.slides[
          action.payload.index
        ].content.description = action.payload.description;
      }
    },
    updateSlideBodyString: (
      state,
      action: PayloadAction<{ index: number; body: string }>
    ) => {
      if (state.presentationData?.slides[action.payload.index]) {
        state.presentationData.slides[action.payload.index].content.body =
          action.payload.body;
      }
    },
    updateSlideBodyHeading: (
      state,
      action: PayloadAction<{ index: number; bodyIdx: number; heading: string }>
    ) => {
      if (state.presentationData?.slides[action.payload.index]) {
        state.presentationData.slides[action.payload.index].content.body[
          action.payload.bodyIdx
          // @ts-ignore
        ].heading = action.payload.heading;
      }
    },
    updateSlideBodyDescription: (
      state,
      action: PayloadAction<{
        index: number;
        bodyIdx: number;
        description: string;
      }>
    ) => {
      if (state.presentationData?.slides[action.payload.index]) {
        state.presentationData.slides[action.payload.index].content.body[
          action.payload.bodyIdx
          // @ts-ignore
        ].description = action.payload.description;
      }
    },
    updateSlideImage: (
      state,
      action: PayloadAction<{ index: number; imageIdx: number; image: string }>
    ) => {
      if (state.presentationData?.slides[action.payload.index]?.images) {
        state.presentationData.slides[action.payload.index].images![
          action.payload.imageIdx
        ] = action.payload.image;
      }
    },
    updateSlideIcon: (
      state,
      action: PayloadAction<{ index: number; iconIdx: number; icon: string }>
    ) => {
      if (state.presentationData?.slides[action.payload.index]?.icons) {
        state.presentationData.slides[action.payload.index].icons![
          action.payload.iconIdx
        ] = action.payload.icon;
      }
    },
    updateSlideChart: (
      state,
      action: PayloadAction<{ index: number; chart: Chart }>
    ) => {
      if (state.presentationData?.slides[action.payload.index]) {
        state.presentationData.slides[action.payload.index].content.graph =
          action.payload.chart;
      }
    },
    updateSlideChartSettings: (
      state,
      action: PayloadAction<{ index: number; chartSettings: ChartSettings }>
    ) => {
      if (state.presentationData?.slides[action.payload.index]) {
        const defaultSettings: ChartSettings = {
          showLegend: false,
          showGrid: false,
          showAxisLabel: true,
          showDataLabel: true,
          dataLabel: {
            dataLabelPosition: "Outside",
            dataLabelAlignment: "Center",
          },
        };
        state.presentationData.slides[
          action.payload.index
        ].content.graph.style = {
          ...defaultSettings,
          ...action.payload.chartSettings,
        };
      }
    },

    addSlideBodyItem: (
      state,
      action: PayloadAction<{
        index: number;
        item: { heading: string; description: string };
      }>
    ) => {
      if (state.presentationData?.slides[action.payload.index]?.content.body) {
        // @ts-ignore
        state.presentationData.slides[action.payload.index].content.body.push(
          action.payload.item
        );
      }
    },
    addSlideImage: (
      state,
      action: PayloadAction<{ index: number; image: string }>
    ) => {
      if (state.presentationData?.slides[action.payload.index]?.images) {
        state.presentationData.slides[action.payload.index].images!.push(
          action.payload.image
        );
      }
    },
    deleteSlideImage: (
      state,
      action: PayloadAction<{ index: number; imageIdx: number }>
    ) => {
      if (state.presentationData?.slides[action.payload.index]?.images) {
        state.presentationData.slides[action.payload.index].images!.splice(
          action.payload.imageIdx,
          1
        );
      }
    },
    updateSlideProperties: (
      state,
      action: PayloadAction<{ index: number; itemIdx: number; properties: any }>
    ) => {
      if (state.presentationData?.slides[action.payload.index]) {
        // Initialize properties object if it doesn't exist
        if (!state.presentationData.slides[action.payload.index].properties) {
          state.presentationData.slides[action.payload.index].properties = {};
        }
        // Assign the properties to the specific item index
        state.presentationData.slides[action.payload.index].properties[
          action.payload.itemIdx
        ] = action.payload.properties;
      }
    },
    // Infographics
    addInfographics: (
      state,
      action: PayloadAction<{ slideIndex: number; item: any }>
    ) => {
      if (state.presentationData?.slides[action.payload.slideIndex]?.content) {
        // @ts-ignore
        state.presentationData.slides[
          action.payload.slideIndex
        ].content.infographics.push(action.payload.item);
      }
    },
    deleteInfographics: (
      state,
      action: PayloadAction<{ slideIndex: number; itemIdx: number }>
    ) => {
      if (state.presentationData?.slides[action.payload.slideIndex]?.content) {
        // @ts-ignore
        state.presentationData.slides[
          action.payload.slideIndex
        ].content.infographics.splice(action.payload.itemIdx, 1);
      }
    },
    updateInfographicsTitle: (
      state,
      action: PayloadAction<{
        slideIndex: number;
        itemIdx: number;
        title: string;
      }>
    ) => {
      if (state.presentationData?.slides[action.payload.slideIndex]?.content) {
        // @ts-ignore
        state.presentationData.slides[
          action.payload.slideIndex
        ].content.infographics[action.payload.itemIdx].title =
          action.payload.title;
      }
    },
    updateInfographicsDescription: (
      state,
      action: PayloadAction<{
        slideIndex: number;
        itemIdx: number;
        description: string;
      }>
    ) => {
      if (state.presentationData?.slides[action.payload.slideIndex]?.content) {
        // @ts-ignore
        state.presentationData.slides[
          action.payload.slideIndex
        ].content.infographics[action.payload.itemIdx].description =
          action.payload.description;
      }
    },
    updateInfographicsChart: (
      state,
      action: PayloadAction<{ slideIndex: number; itemIdx: number; chart: any }>
    ) => {
      if (state.presentationData?.slides[action.payload.slideIndex]?.content) {
        // @ts-ignore
        state.presentationData.slides[
          action.payload.slideIndex
        ].content.infographics[action.payload.itemIdx].chart =
          action.payload.chart;
      }
    },
    deleteSlideBodyItem: (
      state,
      action: PayloadAction<{ index: number; itemIdx: number }>
    ) => {
      if (state.presentationData?.slides[action.payload.index]?.content.body) {
        // @ts-ignore
        state.presentationData.slides[action.payload.index].content.body.splice(
          action.payload.itemIdx,
          1
        );
      }
    },
  },
});

export const {
  setStreaming,
  setLoading,
  setPresentationId,
  setError,
  clearPresentationData,
  setDocs,
  setImgs,

  deleteTitle,
  setPresentationData,
  setTitles,
  // slides operations
  addSlide,
  updateSlide,
  updateSlideVariant,
  updateSlideChart,
  updateSlideChartSettings,
  updateSlideTitle,
  updateSlideDescription,
  updateSlideBodyString,
  updateSlideBodyHeading,
  updateSlideBodyDescription,
  updateSlideImage,
  updateSlideIcon,
  deletePresentationSlide,
  addSlideBodyItem,
  addSlideImage,
  deleteSlideImage,
  deleteSlideBodyItem,
  updateSlideProperties,
  // infographics
  addInfographics,
  deleteInfographics,
  updateInfographicsTitle,
  updateInfographicsDescription,
  updateInfographicsChart,
} = presentationGenerationSlice.actions;

export default presentationGenerationSlice.reducer;
