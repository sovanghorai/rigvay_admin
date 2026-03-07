import { authFetch } from './auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function fetchProducers() {
  const res = await authFetch(`${API_BASE}/admin/producers`);
  if (!res.ok) throw new Error('Fetch failed');
  return res.json();
}

export async function createProducer(name) {
  const res = await authFetch(`${API_BASE}/admin/producers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Create failed');
  return res.json();
}

export async function deleteProducer(id) {
  const res = await authFetch(`${API_BASE}/admin/producers/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
}

export async function updateProducerModels(id, models) {
  const res = await authFetch(`${API_BASE}/admin/producers/${id}/models`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ models })
  });
  if (!res.ok) throw new Error('Update models failed');
  return res.json();
}

export async function renameProducer(id, name) {
  const res = await authFetch(`${API_BASE}/admin/producers/${id}/rename`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Rename failed');
  return res.json();
}
