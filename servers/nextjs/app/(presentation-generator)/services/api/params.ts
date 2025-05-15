export interface ImageSearch {
  presentation_id: string;
  query: string;
  page: number;
  limit: number;
}

export interface ImageGenerate {
  presentation_id: string;
  prompt: {
    theme_prompt: string;
    image_prompt: string;
    aspect_ratio: string;
  };
}
export interface IconSearch {
  presentation_id: string;

  query: string;
  category?: string;
  page: number;
  limit: number;
}
