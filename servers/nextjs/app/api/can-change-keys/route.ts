import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ canChange: process.env.CAN_CHANGE_KEYS !== "false" })
}