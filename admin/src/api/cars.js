import { authFetch } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function handleJsonResponse(res) {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function getAllCars() {
  const res = await authFetch(`${API_BASE}/admin/cars`);
  const data = await handleJsonResponse(res);
  return data?.data || [];
}

export async function getUnapprovedCars() {
  const res = await authFetch(`${API_BASE}/admin/cars-unapproved`);
  const data = await handleJsonResponse(res);
  return data?.data || [];
}

export async function approveCar(id) {
  const res = await authFetch(
    `${API_BASE}/admin/car-approve/${id}`,
    { method: "POST" }
  );
  const data = await handleJsonResponse(res);
  return data?.data;
}
