import { useEffect, useState } from 'react'
import { useLiveShared } from './useLive'
import { outbox } from './outbox'
export function useOfflineShared(coll, opts) {
  const { data, loading } = useLiveShared(coll, opts); const cacheKey = `neom.cache.${coll}`
  useEffect(() => { if (data?.length) localStorage.setItem(cacheKey, JSON.stringify(data)) }, [data, cacheKey])
  const cached = (() => { try { return JSON.parse(localStorage.getItem(cacheKey) || '[]') } catch { return [] } })()
  return { data: data?.length ? data : cached, stale: loading }
}
export function useOutboxStatus() {
  const [st, setSt] = useState(() => outbox.status())
  useEffect(() => outbox.subscribe(() => setSt(outbox.status())), [])
  return st
}
