const API_BASE = '/api'

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `HTTP ${response.status}`)
  }

  if (response.status === 204) return null
  return response.json()
}
