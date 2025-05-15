// lib/env.client.ts
'use client';

export const getEnv = () => {
  return {
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000',
    USER_CONFIG_PATH: process.env.NEXT_PUBLIC_USER_CONFIG_PATH || '/tmp/userConfig.json',
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL || '/tmp',
    TEMP_DIRECTORY: process.env.TEMP_DIRECTORY || '/tmp',
  };
};
