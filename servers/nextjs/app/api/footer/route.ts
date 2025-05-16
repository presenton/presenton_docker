
import { settingsStore } from "@/app/(presentation-generator)/services/setting-store";
import { NextRequest, NextResponse } from "next/server";

const FOOTER_KEY = 'footer';
// GET handler to retrieve properties
export async function GET(request: NextRequest) {
  try {
    const properties = settingsStore.get(FOOTER_KEY);
    
    if (!properties) {
      return NextResponse.json({ properties: null });
    }

    return NextResponse.json({ properties });
  } catch (error) {
    console.error('Error retrieving footer properties:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve footer properties' },
      { status: 500 }
    );
  }
}


// POST handler to save properties
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { properties } = body;

    if (!properties) {
      return NextResponse.json(
        { error: 'Properties are required' },
        { status: 400 }
      );
    }

    // Validate required properties
    if (!properties.logoProperties || !properties.footerMessage) {
      return NextResponse.json(
        { error: 'Invalid footer properties structure' },
        { status: 400 }
      );
    }

    settingsStore.set(FOOTER_KEY, properties);
    
    return NextResponse.json({ 
      success: true,
      properties 
    });
  } catch (error) {
    console.error('Error saving footer properties:', error);
    return NextResponse.json(
      { error: 'Failed to save footer properties' },
      { status: 500 }
    );
  }
}