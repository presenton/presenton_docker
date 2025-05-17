import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';

import { sanitizeFilename } from '@/app/(presentation-generator)/utils/others';
import { NextResponse, NextRequest } from 'next/server';


export async function POST(req: NextRequest) {
  const { url, title } = await req.json();

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    printBackground: true,
    width: "1280px",
    height: "720px",
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  browser.close();
  const sanitizedTitle = sanitizeFilename(title);
  const destinationPath = path.join(process.env.APP_DATA_DIRECTORY!, `${sanitizedTitle}.pdf`);
  await fs.promises.writeFile(destinationPath, pdfBuffer);

  return NextResponse.json({
    success: true,
    path: destinationPath
  });
}
