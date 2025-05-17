import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const BASE_DIR = process.env.APP_DATA_DIRECTORY!;

export async function GET(
  request: NextRequest,
) {
  const url = new URL(request.url);
  const filename = url.pathname.split('/user-static/')[1];

  if (!filename) {
    return new NextResponse('No file specified', { status: 400 });
  }

  const filePath = path.join(BASE_DIR, filename);

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
