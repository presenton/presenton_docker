// app/api/footer/route.ts
import { settingsStore } from "@/app/(presentation-generator)/services/setting-store";
import { NextRequest, NextResponse } from "next/server";

const FOOTER_KEY = 'footer';
// GET handler to retrieve properties
export async function GET(request: NextRequest) {
  try {
      const properties = settingsStore.get(FOOTER_KEY);
    
      return { properties };
    } catch (error) {
      console.error('Error retrieving footer properties:', error);
      throw error;
    }
}


// POST handler to save properties
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { properties } = body;

    if (!properties) {
      throw new Error('Properties are required');
    }
      settingsStore.set(FOOTER_KEY, properties);
      return { success: true };
    } catch (error) {
      console.error('Error saving footer properties:', error);
      throw error;
    }
}