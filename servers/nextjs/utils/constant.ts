// lib/env.client.ts
'use client';

export const getEnv = () => {
  console.log('NEXT_PUBLIC_FAST_API', process.env.NEXT_PUBLIC_FAST_API);
  const baseUrl =  process.env.NEXT_PUBLIC_FAST_API || 'http://localhost:8000';

  return {
    BASE_URL: baseUrl,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
    TEMP_DIRECTORY: process.env.TEMP_DIRECTORY || '/tmp',
  };
};
