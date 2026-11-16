import { supabase } from './supabase'
function applyFilters(query, filters) {
  if (!filters) return query
  for (const [key, val] of Object.entries(filters)) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      if (val.gte !== undefined) query = query.gte(key, val.gte)
      if (val.lte !== undefined) query = query.lte(key, val.lte)
    } else if (val !== undefined && val !== '') query = query.eq(key, val)
  }
  return query
}
export const db = {
  async listShared(coll, opts = {}) {
    let q = supabase.from(coll).select('*')
    q = applyFilters(q, opts.filters)
    if (opts.order) { const desc = opts.order.startsWith('-'); q = q.order(desc ? opts.order.slice(1) : opts.order, { ascending: !desc }) }
    if (opts.limit) q = q.limit(opts.limit)
    const { data, error } = await q; if (error) throw error; return data || []
  },
  async getShared(coll, id) { const { data } = await supabase.from(coll).select('*').eq('id', id).maybeSingle(); return data },
  async insertShared(coll, data, id, meta = {}) {
    const row = { ...data, ...meta }; if (id) row.id = id
    const { data: res, error } = await supabase.from(coll).insert(row).select().single(); if (error) throw error; return res
  },
  async insertManyShared(coll, rows, meta = {}) {
    if (!rows?.length) return []
    const payload = rows.map((r) => ({ ...r, groupId: meta.groupId, visibleTo: meta.visibleTo }))
    const { data, error } = await supabase.from(coll).upsert(payload).select(); if (error) throw error; return data || []
  },
  async updateShared(coll, id, patch) {
    const { data, error } = await supabase.from(coll).update(patch).eq('id', id).select().single(); if (error) throw error; return data
  },
  async upsertShared(coll, patch, id, meta = {}) {
    const { data, error } = await supabase.from(coll).upsert({ id, ...patch, ...meta }).select().single(); if (error) throw error; return data
  },
  async deleteShared(coll, id) { await supabase.from(coll).delete().eq('id', id) },
  async incrementShared(coll, id, field, by) {
    const cur = await this.getShared(coll, id); if (!cur) return
    await this.updateShared(coll, id, { [field]: Math.round(((Number(cur[field]) || 0) + Number(by)) * 1000) / 1000 })
  },
  async batch(ops) {
    for (const op of ops) {
      if (op.action === 'incrementShared') await this.incrementShared(op.collection, op.id, op.field, op.by)
      else if (op.action === 'updateShared') await this.updateShared(op.collection, op.id, op.data)
      else if (op.action === 'insertShared') await this.insertShared(op.collection, op.data, op.id, { groupId: op.groupId, visibleTo: op.visibleTo })
    }
  },
  async sumShared(coll, field, filters) { const rows = await this.listShared(coll, { filters }); return rows.reduce((s, r) => s + (Number(r[field]) || 0), 0) },
  async countShared(coll, filters) { return (await this.listShared(coll, { filters })).length },
  async groupByShared(coll, groupField, opts = {}) {
    const rows = await this.listShared(coll, { filters: opts.filters }); const map = new Map()
    for (const r of rows) {
      const k = typeof groupField === 'object' && groupField.month ? String(r[groupField.month] || '').slice(0, 7) : r[groupField]
      if (!k) continue; const cur = map.get(k) || { key: k, value: 0, count: 0 }; cur.value += Number(r[opts.field]) || 0; cur.count += 1; map.set(k, cur)
    }
    return [...map.values()]
  },
}
