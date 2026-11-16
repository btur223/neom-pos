const USER_KEY = 'neom.session.user'; let listeners = []
export const auth = {
  getCurrentUser() { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') } catch { return null } },
  isAppOwner() { return this.getCurrentUser()?.role === 'manager' },
  signIn(user) { localStorage.setItem(USER_KEY, JSON.stringify(user)); listeners.forEach((fn) => fn()) },
  signOut() { localStorage.removeItem(USER_KEY); listeners.forEach((fn) => fn()) },
  onAuthChange(fn) { listeners.push(fn); return () => { listeners = listeners.filter((l) => l !== fn) } },
}
