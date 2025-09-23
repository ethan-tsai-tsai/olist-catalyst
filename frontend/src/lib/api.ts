// This file centralizes the logic for determining the API base URL.
// It checks for a public environment variable and falls back to a relative path for development.

export const getApiBaseUrl = (): string => {
  // This environment variable will be set in the Vercel project settings.
  // In local development, it will be undefined, and the proxy will be used.
  return process.env.NEXT_PUBLIC_API_URL || '';
};
