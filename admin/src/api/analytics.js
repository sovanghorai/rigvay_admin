import { authFetch } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function fetchLeadAnalytics(filters = {}) {
  const query = new URLSearchParams(filters).toString();

  const res = await authFetch(
    `${API_BASE}/admin/lead-analytics?${query}`
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch analytics");
  }

  // ✅ Return only actual data
  return data.data;
}