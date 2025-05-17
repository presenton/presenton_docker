// lib/env.client.ts
'use client';

export const getEnv = () => {
  return {
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000',
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
    TEMP_DIRECTORY: process.env.TEMP_DIRECTORY || '/tmp',
  };
};
