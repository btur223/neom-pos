import { db } from './db'
const QUEUE_KEY = 'neom.offline.outbox'; let listeners = []; const notify = () => listeners.forEach((fn) => fn())
const getQueue = () => { try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') } catch { return [] } }
const setQueue = (q) => { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); notify() }
export const outbox = {
  async insertShared(coll, data, opts) {
    try { return await db.insertShared(coll, data, undefined, opts) }
    catch { const q = getQueue(); const item = { id: `off-${Date.now()}`, coll, data, opts, failed: false }; q.push(item); setQueue(q); return { ...data, id: item.id, _pending: true } }
  },
  async flush() {
    const q = getQueue(); if (!q.length || !navigator.onLine) return; const rem = []
    for (const item of q) { try { await db.insertShared(item.coll, item.data, undefined, item.opts) } catch { rem.push({ ...item, failed: true }) } }
    setQueue(rem)
  },
  retryFailed() { this.flush() },
  subscribe(fn) { listeners.push(fn); return () => { listeners = listeners.filter((l) => l !== fn) } },
  status() { const q = getQueue(); return { pending: q.length, syncing: false, failed: q.filter((x) => x.failed).length } },
}
if (typeof window !== 'undefined') window.addEventListener('online', () => outbox.flush())
