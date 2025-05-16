import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import os from "os";

// Use OS temp directory as a base for uploads
const userDataDir = os.tmpdir();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(userDataDir, "uploads");
    fs.mkdirSync(uploadsDir, { recursive: true });

    // Generate unique filename
    const filename = `${crypto.randomBytes(16).toString("hex")}.png`;
    const filePath = path.join(uploadsDir, filename);

    // Write file to disk
    fs.writeFileSync(filePath, buffer);

    // Return the relative path that can be used in the frontend
    return NextResponse.json({ 
      success: true,
      filePath: `/uploads/${filename}` 
    });
  } catch (error) {
    console.error("Error saving image:", error);
    return NextResponse.json(
      { error: "Failed to save image" },
      { status: 500 }
    );
  }
}