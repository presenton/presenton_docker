import { PresentationConfig } from "@/app/(presentation-generator)/upload/type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PresentationGenUploadState {
  config: PresentationConfig | null;
  
  documents: any;
  images: any;
  charts: any;
  tables: any;
  questions: any;
  storyResponse: any;
}

const initialState: PresentationGenUploadState = {
  config: null,
 
  documents: {},
  images: {},
  charts: {},
  tables: {},

  questions: [],
  storyResponse: {
    big_idea: null,
    story_type: null,
    story: null,
  },
};

export const presentationGenUploadSlice = createSlice({
  name: "pptGenUpload",
  initialState,
  reducers: {
    setPptGenUploadState: (
      state,
      action: PayloadAction<Partial<PresentationGenUploadState>>
    ) => {
      const payload = action.payload;
      state.config = payload.config!;
      state.documents = payload.documents;
      state.images = payload.images;
      state.charts = payload.charts;
      state.tables = payload.tables;

      state.questions = payload.questions;
    },
    setQuestions: (state, action: PayloadAction<any>) => {
      state.questions = action.payload;
    },
    setStoryResponse: (state, action: PayloadAction<any>) => {
      state.storyResponse = action.payload;
    },
  },
});

export const { setPptGenUploadState, setQuestions, setStoryResponse } =
  presentationGenUploadSlice.actions;
export default presentationGenUploadSlice.reducer;
