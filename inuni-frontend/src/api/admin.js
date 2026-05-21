import { apiRequest, postJson } from './client.js'

// Admin login with JWT
export function adminLogin(email, password) {
  return postJson('/api/admin/login', { email, password })
}

// Get admin stats (требует JWT авторизации)
export function getAdminStats() {
  return apiRequest('/api/admin/stats')
}

// Get all hackathons (публичный endpoint)
export function getHackathons() {
  return apiRequest('/api/hackathons')
}

// Create hackathon (admin only, требует JWT)
export function createHackathon(data) {
  return apiRequest('/api/hackathons', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// Update hackathon (admin only, требует JWT)
export function updateHackathon(id, data) {
  return apiRequest(`/api/hackathons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

// Delete hackathon (admin only, требует JWT)
export function deleteHackathon(id) {
  return apiRequest(`/api/hackathons/${id}`, {
    method: 'DELETE'
  })
}
