import { apiRequest, postJson, getApiBaseUrl } from './client.js'

// ===== AUTH =====
export function register(email, password, firstName, lastName) {
  return postJson('/api/auth/register', { email, password, firstName, lastName })
}

export function login(email, password) {
  return postJson('/api/auth/login', { email, password })
}

export function refreshToken(refreshToken) {
  return postJson('/api/auth/refresh', { refreshToken })
}

export function logout(refreshToken) {
  return postJson('/api/auth/logout', { refreshToken })
}

export function getCurrentUser() {
  return apiRequest('/api/auth/me')
}

// ===== PROFILES =====
export function getProfile(userId) {
  return apiRequest(`/api/profiles/${userId}`)
}

export function updateProfile(userId, updates) {
  return apiRequest(`/api/profiles/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export function uploadProfilePhoto(userId, file) {
  const formData = new FormData()
  formData.append('photo', file)
  
  // Получаем токен из localStorage
  const token = localStorage.getItem('accessToken')
  const headers = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return fetch(`${getApiBaseUrl()}/api/profiles/${userId}/photo`, {
    method: 'POST',
    headers,
    body: formData,
  }).then(res => {
    if (!res.ok) throw new Error('Upload failed')
    return res.json()
  })
}

// ===== TEAMS =====
export function getTeams(searchQuery = '', category = '') {
  const params = new URLSearchParams()
  if (searchQuery) params.append('q', searchQuery)
  if (category && category !== 'all') params.append('category', category)
  
  const queryString = params.toString()
  return apiRequest(`/api/teams${queryString ? '?' + queryString : ''}`)
}

export function getUserTeams(userId) {
  return apiRequest(`/api/teams/user/${userId}`)
}

export function createTeam(teamData) {
  return postJson('/api/teams', teamData)
}

export function deleteTeam(teamId) {
  return apiRequest(`/api/teams/${teamId}`, { method: 'DELETE' })
}

// ===== APPLICATIONS =====
export function createApplication(teamId, userId, message = '') {
  return postJson('/api/applications', { team_id: teamId, user_id: userId, message })
}

export function getTeamApplications(teamId) {
  return apiRequest(`/api/applications/team/${teamId}`)
}

export function getOwnerApplications(ownerId) {
  return apiRequest(`/api/applications/owner/${ownerId}`)
}

export function getUserApplications(userId) {
  return apiRequest(`/api/applications/user/${userId}`)
}

export function updateApplicationStatus(appId, status) {
  return apiRequest(`/api/applications/${appId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

// ===== MESSAGES =====
export function getMessages(teamId, channelType = 'team', limit = 50, offset = 0) {
  return apiRequest(`/api/messages/${teamId}?channel_type=${channelType}&limit=${limit}&offset=${offset}`)
}

export function getGeneralMessages(channel, limit = 50, offset = 0) {
  return apiRequest(`/api/messages/general/${channel}?limit=${limit}&offset=${offset}`)
}

export function sendMessage(teamId, userId, content, channelType = 'team') {
  return postJson('/api/messages', { 
    team_id: teamId, 
    user_id: userId, 
    content,
    channel_type: channelType 
  })
}

// ===== AI =====
export function analyzeProfile(profile) {
  return postJson('/api/ai/profile/analyze', { profile })
}

export function generateProfileBio(profile) {
  return postJson('/api/ai/profile/generate-bio', profile)
}
