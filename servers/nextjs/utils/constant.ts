// lib/env.client.ts
'use client';

export const getEnv = () => {
  if (typeof window !== 'undefined') {
    return {
      // @ts-ignore
      BASE_URL: window.env?.NEXT_PUBLIC_FAST_API || 'http://localhost:8000',
      // @ts-ignore
      USER_CONFIG_PATH: window.env?.NEXT_PUBLIC_USER_CONFIG_PATH || '',
        // @ts-ignore
      NEXT_PUBLIC_URL: window.env?.NEXT_PUBLIC_URL || '',
      // @ts-ignore
      TEMP_DIRECTORY: window.env?.TEMP_DIRECTORY || '',
    };
  }

  return {
    BASE_URL: 'http://localhost:8000',
    USER_CONFIG_PATH: '',
 
    NEXT_PUBLIC_URL: '',
    
    TEMP_DIRECTORY: '',
  };
};
