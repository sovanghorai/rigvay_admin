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

export async function getAllCars(page = 1) {
  const res = await authFetch(`${API_BASE}/admin/cars?page=${page}`);
  return handleJsonResponse(res);
}

export async function getUnapprovedCars(page = 1) {
  const res = await authFetch(
    `${API_BASE}/admin/cars-unapproved?page=${page}`
  );
  return handleJsonResponse(res);
}
export async function approveCar(id) {
  const res = await authFetch(
    `${API_BASE}/admin/car-approve/${id}`,
    { method: "POST" }
  );
  return handleJsonResponse(res);
}

export async function rejectCar(id) {
  const res = await authFetch(
    `${API_BASE}/admin/car-reject/${id}`,
    { method: "POST" }
  );
  return handleJsonResponse(res);
}

export async function markSold(id) {
  const res = await authFetch(
    `${API_BASE}/admin/car-sold/${id}`,
    { method: "POST" }
  );
  return handleJsonResponse(res);
}
export async function deleteCar(id) {
  const res = await authFetch(
    `${API_BASE}/admin/car-deleted/${id}`,
    {
      method: "POST",   // ✅ Important
    }
  );

  return handleJsonResponse(res);
}
export async function getDealerProfile(dealerId) {
  const res = await authFetch(
    `${API_BASE}/admin/car-dealer/${dealerId}`
  );
  return handleJsonResponse(res);
}

export async function getAdminCarById(id) {
  const res = await authFetch(
    `${API_BASE}/admin/car-get/${id}`
  );
  return handleJsonResponse(res);
}

export async function editAdminCar(id, formData) {
  const res = await authFetch(
    `${API_BASE}/admin/car-edit/${id}`,
    {
      method: "PUT",
      body: formData
    }
  );
  return handleJsonResponse(res);
}