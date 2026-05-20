export function toShortName(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

export function buildDmFromMatch({ name, initials, color, role }) {
  const shortName = toShortName(name)
  return {
    name: shortName,
    fullName: name,
    initials: initials || shortName.slice(0, 2).toUpperCase(),
    color: color || 'linear-gradient(135deg,#e63946,#1d4ed8)',
    role: role || '',
    preview: 'Новый мэтч — напиши первым!',
    unread: 0,
  }
}
