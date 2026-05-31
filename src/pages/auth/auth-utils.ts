export function translateAuthError(message: string | null, t: (k: string) => string): string | null {
  if (!message) return null
  const lower = message.toLowerCase()
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return t('auth.errors.invalidCredentials')
  }
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return t('auth.errors.userExists')
  }
  if (lower.includes('password should be') || lower.includes('weak')) {
    return t('auth.errors.weakPassword')
  }
  return message
}
