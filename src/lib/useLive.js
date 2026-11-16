import { useEffect, useState } from 'react'
import { db } from './db'
import { supabase } from './supabase'
export function useLiveShared(coll, opts = {}) {
  const [data, setData] = useState([]); const [loading, setLoading] = useState(true); const key = JSON.stringify(opts)
  useEffect(() => {
    let alive = true
    const load = () => db.listShared(coll, opts).then((rows) => { if (alive) { setData(rows); setLoading(false) } }).catch(() => { if (alive) setLoading(false) })
    load()
    const ch = supabase.channel(`live-${coll}-${Math.random()}`).on('postgres_changes', { event: '*', schema: 'public', table: coll }, load).subscribe()
    return () => { alive = false; supabase.removeChannel(ch) }
  }, [coll, key])
  return { data, loading }
}
