export function isValidEmail(email: string): boolean {
  if (!email) return false
  const s = email.trim()
  // Simple but robust-ish regex for common email formats
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(s)
}

export function normalizeEmail(email: string): string {
  return email.trim()
}
