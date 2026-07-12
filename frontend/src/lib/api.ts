// Backend API base URL, shared by every client and server component that
// talks to the Express API. Client components need the NEXT_PUBLIC_
// prefix so the value is available in the browser bundle.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
