import { auth } from './auth'
export const team = {
  async groupId() { return 'neom-main-shop' },
  async currentMember() { return auth.getCurrentUser() },
  async canManage() { return auth.isAppOwner() },
  async openAdmin() { alert('يمكنك تعديل رموز الدخول من إعدادات المالك') },
  async setLoginConfig() { return true },
}
