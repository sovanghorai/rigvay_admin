import { authFetch } from './auth'

const API_BASE = 'http://localhost:3000/api'

async function handleJsonResponse(res) { 
  const text = await res.text()
  let data
  try { data = text ? JSON.parse(text) : {} } catch (e) { data = { message: text } }
  if (!res.ok) {
    const err = new Error(data?.message || 'Request failed')
    err.status = res.status
    err.payload = data
    throw err
  }
  return data
}

export async function getAllDealers() {
  const res = await authFetch(`${API_BASE}/admin/dealers`, { method: 'GET' })
  const data = await handleJsonResponse(res)
  return data?.data || []
}

export async function getUnapprovedDealers() {
  const res = await authFetch(`${API_BASE}/admin/dealers-unapproved`, { method: 'GET' })
  const data = await handleJsonResponse(res)
  return data?.data || []
}

export async function approveDealer(id) {
  const res = await authFetch(`${API_BASE}/admin/dealer-approve/${id}`, { method: 'POST' })
  const data = await handleJsonResponse(res)
  return data?.data || null
}
