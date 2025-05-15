import {
  getHeader,
  getHeaderForFormData,
} from "@/app/(presentation-generator)/services/api/header";
import { getEnv } from "@/utils/constant";

const urls = getEnv();
const BASE_URL = urls.BASE_URL;
export interface PresentationResponse {
  id: string;
  title: string;
  created_at: string;
  data: any | null;
  file: string;
  n_slides: number;
  prompt: string;
  summary: string | null;
  theme: string;
  titles: string[];
  user_id: string;
  vector_store: any;

  thumbnail: string;
}

export class DashboardApi {
 
  static async getPresentations(): Promise<PresentationResponse[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/ppt/user_presentations`,
        {
          method: "GET",
        }
      );
      if (response.status === 200) {
        const data = await response.json();
        return data;
      } else if (response.status === 404) {
        console.log("No presentations found");
        return [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching presentations:", error);
      throw error;
    }
  }
  static async getPresentation(id: string) {
    try {
      const response = await fetch(
        `${BASE_URL}/ppt/presentation?presentation_id=${id}`,
        {
          method: "GET",
         
        }
      );
      if (response.status === 200) {
        const data = await response.json();
        return data;
      }
      throw new Error("Presentation not found");
    } catch (error) {
      console.error("Error fetching presentations:", error);
      throw error;
    }
  }
  static async deletePresentation(presentation_id: string) {
    try {
      const response = await fetch(
        `${BASE_URL}/ppt/delete?presentation_id=${presentation_id}`,
        {
          method: "DELETE",
          headers: getHeader(),
        }
      );

      if (response.status === 204) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting presentation:", error);
      throw error;
    }
  }
  static async setSlideThumbnail(presentation_id: string, file: any) {
    const formData = new FormData();

    formData.append("presentation_id", presentation_id);
    formData.append("thumbnail", file);
    try {
      const response = await fetch(
        `${BASE_URL}/ppt/presentation/thumbnail`,
        {
          method: "POST",
          headers: getHeaderForFormData(),
          body: formData,
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error setting slide thumbnail:", error);
      throw error;
    }
  }
}
