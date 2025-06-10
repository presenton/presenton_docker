import { configureStore } from "@reduxjs/toolkit";

import presentationGenerationReducer from "./slices/presentationGeneration";
import themeReducer from "@/app/(presentation-generator)/store/themeSlice";
import pptGenUploadReducer from "./slices/presentationGenUpload";
import userConfigReducer from "./slices/userConfig";
export const store = configureStore({
  reducer: {
    presentationGeneration: presentationGenerationReducer,
    theme: themeReducer,
    pptGenUpload: pptGenUploadReducer,
    userConfig: userConfigReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
