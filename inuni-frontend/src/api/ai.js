const AI_BASE = '/api/ai'

export async function analyzeProfile(profile) {
  const res = await fetch(`${AI_BASE}/profile/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile })
  })
  return res.json()
}

export async function generateBio(profileData) {
  const res = await fetch(`${AI_BASE}/profile/generate-bio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  })
  return res.json()
}
