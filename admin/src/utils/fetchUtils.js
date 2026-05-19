const API_BASE = import.meta.env.VITE_API_BASE_URL

/**
 * Enhanced fetch wrapper with automatic JWT token handling
 * Automatically adds Authorization header to all requests
 */
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  const text = await response.text()
  let data

  try {
    data = text ? JSON.parse(text) : {}
  } catch (e) {
    data = { message: text }
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed')
    error.status = response.status
    error.payload = data
    throw error
  }

  return data
}

/**
 * POST request with auth
 */
export const post = (endpoint, body, options = {}) => {
  return fetchWithAuth(`${API_BASE}${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
  })
}

/**
 * GET request with auth
 */
export const get = (endpoint, options = {}) => {
  return fetchWithAuth(`${API_BASE}${endpoint}`, {
    method: 'GET',
    ...options,
  })
}

/**
 * PUT request with auth
 */
export const put = (endpoint, body, options = {}) => {
  return fetchWithAuth(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    ...options,
  })
}

/**
 * DELETE request with auth
 */
export const del = (endpoint, options = {}) => {
  return fetchWithAuth(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
    ...options,
  })
}

/**
 * PATCH request with auth
 */
export const patch = (endpoint, body, options = {}) => {
  return fetchWithAuth(`${API_BASE}${endpoint}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
    ...options,
  })
}

export default {
  fetchWithAuth,
  post,
  get,
  put,
  del,
  patch,
}
