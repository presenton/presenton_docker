import { settingsStore } from "@/app/(presentation-generator)/services/setting-store";
import { NextRequest, NextResponse } from "next/server";
const THEME_KEY = 'theme';
export async function GET(request: NextRequest) {
   try {
      const theme = settingsStore.get(THEME_KEY);
    
      return { theme };
    } catch (error) {
      console.error('Error retrieving theme:', error);
      throw error;
    }
}

export async function POST(request: NextRequest) {
   try {
    const body = await request.json();
    const { themeData } = body;
      if (!themeData) {
        throw new Error('Theme data is required');
      }

    
      settingsStore.set(THEME_KEY, themeData);
      return { success: true };
    } catch (error) {
      console.error('Error saving theme:', error);
      throw error;
    }
}