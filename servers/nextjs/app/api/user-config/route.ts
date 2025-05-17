import { NextResponse } from 'next/server';
import fs from 'fs';

const userConfigPath = process.env.USER_CONFIG_PATH!;

export async function GET() {
  if (!fs.existsSync(userConfigPath)) {
    return NextResponse.json({})
  }
  const configData = fs.readFileSync(userConfigPath, 'utf-8')
  return NextResponse.json(JSON.parse(configData))
}

export async function POST(request: Request) {
  const userConfig = await request.json()

  let existingConfig: UserConfig = {}
  if (fs.existsSync(userConfigPath)) {
    const configData = fs.readFileSync(userConfigPath, 'utf-8')
    existingConfig = JSON.parse(configData)
  }
  const mergedConfig: UserConfig = {
    LLM: userConfig.LLM || existingConfig.LLM,
    OPENAI_API_KEY: userConfig.OPENAI_API_KEY || existingConfig.OPENAI_API_KEY,
    GOOGLE_API_KEY: userConfig.GOOGLE_API_KEY || existingConfig.GOOGLE_API_KEY
  }
  fs.writeFileSync(userConfigPath, JSON.stringify(mergedConfig))
  return NextResponse.json(mergedConfig)
} 