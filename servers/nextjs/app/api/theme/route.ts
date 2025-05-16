import { settingsStore } from "@/app/(presentation-generator)/services/setting-store";
import { NextRequest, NextResponse } from "next/server";

const THEME_KEY = 'theme';

export async function GET(request: NextRequest) {
  try {
    const theme = settingsStore.get(THEME_KEY);
    
    if (!theme) {
      return NextResponse.json({ theme: null });
    }

    return NextResponse.json({ theme });
  } catch (error) {
    console.error('Error retrieving theme:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve theme' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { themeData } = body;

    if (!themeData || !themeData.name || !themeData.colors) {
      return NextResponse.json(
        { error: 'Invalid theme data' },
        { status: 400 }
      );
    }

    settingsStore.set(THEME_KEY, themeData);

    return NextResponse.json({ 
      success: true,
      theme: themeData 
    });
  } catch (error) {
    console.error('Error saving theme:', error);
    return NextResponse.json(
      { error: 'Failed to save theme' },
      { status: 500 }
    );
  }
}