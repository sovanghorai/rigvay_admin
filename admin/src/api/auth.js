const API_BASE = import.meta.env.VITE_API_BASE_URL

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
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

export async function sendLoginOtp(phone) {
  return postJson(`${API_BASE}/admin/send-login-otp`, { 'phone': phone })
}

export async function verifyLoginOtp(phone, otp) {
  return postJson(`${API_BASE}/admin/verify-login-otp`, { 'phone': phone, 'otp': otp })
}

export function authFetch(url, opts = {}) {
  const token = localStorage.getItem('admin_access_token')
  const headers = opts.headers ? { ...opts.headers } : {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  
  return fetch(url, { ...opts, headers })
}

export default { sendLoginOtp, verifyLoginOtp, authFetch }
