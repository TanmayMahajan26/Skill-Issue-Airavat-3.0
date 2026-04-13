const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  // Always ensure we point to the backend properly
  const url = `${API_URL.replace(/\/$/, '')}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    if (!res.ok) {
      console.error(`API error: ${res.status} on ${url}`);
      throw new Error(`API error: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API call failed: ${url}`, error);
    return null;
  }
}
