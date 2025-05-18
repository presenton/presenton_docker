import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(
  request: NextRequest,
  { params }: { params: { filepath: string[] } },
) {
  const BASE_DIR = "/app";

  const filepath = params.filepath.join("/");

  if (!params.filepath) {
    return new NextResponse('No file specified', { status: 400 });
  }

  const filePath = path.join(BASE_DIR, filepath);

  if (!fs.existsSync(filePath)) {
    return new NextResponse('File not found', { status: 404 });
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    return new NextResponse('Access to directories is forbidden', { status: 403 });
  }

  const fileStream = fs.createReadStream(filePath);
  const headers = new Headers();
  headers.set('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
  headers.set('Content-Type', getMimeType(filePath));

  return new NextResponse(fileStream as any, { headers });
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.txt': return 'text/plain';
    case '.json': return 'application/json';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    case '.pdf': return 'application/pdf';
    default: return 'application/octet-stream';
  }
}
