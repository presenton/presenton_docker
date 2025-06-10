import { NextResponse } from 'next/server';

const canChangeKeys = process.env.CAN_CHANGE_KEYS !== "false";

export async function GET() {
  return NextResponse.json({ canChange: canChangeKeys })
}