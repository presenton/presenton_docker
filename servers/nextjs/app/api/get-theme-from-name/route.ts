import { NextRequest, NextResponse } from "next/server";
import { defaultColors } from "@/app/(presentation-generator)/store/themeSlice";


export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const themeName = searchParams.get("theme") ?? "light";

  const theme = {
    name: themeName,
    colors: defaultColors[themeName as keyof typeof defaultColors],
  }

  return NextResponse.json(theme);
};