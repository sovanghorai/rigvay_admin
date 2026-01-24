import { authFetch } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function handleJsonResponse(res) {
  const text = await res.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = { message: text };
  }

  if (!res.ok) {
    const err = new Error(data?.message || "Request failed");
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  return data;
}

/* ================= DEALERS ================= */

export async function getAllDealers() {
  const res = await authFetch(`${API_BASE}/admin/dealers`, { method: "GET" });
  const data = await handleJsonResponse(res);
  return data?.data || [];
}

export async function getUnapprovedDealers() {
  const res = await authFetch(`${API_BASE}/admin/dealers-unapproved`, {
    method: "GET"
  });
  const data = await handleJsonResponse(res);
  return data?.data || [];
}

export async function approveDealer(dealerProfileId) {
  const res = await authFetch(
    `${API_BASE}/admin/dealer-approve/${dealerProfileId}`,
    { method: "POST" }
  );
  const data = await handleJsonResponse(res);
  return data?.data || null;
}

export async function searchDealers(query) {
  const res = await authFetch(
    `${API_BASE}/admin/dealers/search?q=${encodeURIComponent(query)}`,
    { method: "GET" }
  );
  const data = await handleJsonResponse(res);
  return data?.data || [];
}

/* ================= PLANS ================= */

export async function getPlans() {
  const res = await authFetch(`${API_BASE}/admin/plans`, { method: "GET" });
  const data = await handleJsonResponse(res);
  return data?.data || [];
}

export async function changeDealerPlan(dealerProfileId, planId) {
  const res = await authFetch(`${API_BASE}/admin/assign-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dealerProfileId, planId })
  });

  const data = await handleJsonResponse(res);
  return data?.data || null;
}

/* ================= SUBSCRIPTIONS ================= */
/**
 * dealerProfileId = DealerProfile._id
 * Backend resolves DealerProfile → dealer internally
 */

export async function getDealerSubscription(dealerProfileId) {
  const res = await authFetch(
    `${API_BASE}/admin/dealers/${dealerProfileId}/subscription`,
    { method: "GET" }
  );
  const data = await handleJsonResponse(res);
  return data?.data || null;
}

export async function getDealerAllSubscriptions(dealerProfileId) {
  const res = await authFetch(
    `${API_BASE}/admin/dealers/${dealerProfileId}/subscriptions/all`,
    { method: "GET" }
  );
  const data = await handleJsonResponse(res);
  return data?.data || [];
}

export async function deactivateSubscription(dealerProfileId) {
  const res = await authFetch(
    `${API_BASE}/admin/dealers/${dealerProfileId}/subscription/deactivate`,
    { method: "POST" }
  );
  const data = await handleJsonResponse(res);
  return data?.data || null;
}

export async function reactivateSubscription(
  dealerProfileId,
  subscriptionId
) {
  const res = await authFetch(`${API_BASE}/admin/subscription/reactivate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dealerId: dealerProfileId, subscriptionId })
  });

  const data = await handleJsonResponse(res);
  return data?.data || null;
}
