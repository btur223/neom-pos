import { useState, useMemo } from 'react'
import { Plus, Trash2, Send, AlertTriangle, Edit3 } from 'lucide-react'
import { db } from './lib/db'
import { share } from './lib/share'
import { getStaffList, saveStaffList } from './components/TeamLogin'

const todayStr = () => new Date().toISOString().slice(0, 10)
const fmt = (n) => Number(n || 0).toFixed(3)

export function DashboardScreen({ invoices, ingredients, recipes, settings }) {
  const today = todayStr()
  const todayInvoices = invoices.filter((i) => i.date === today)
  const todaySales = todayInvoices.reduce((s, i) => s + Number(i.total || 0), 0)
  const todayCost = useMemo(() => {
    let cost = 0
    for (const inv of todayInvoices) {
      for (const l of (inv.lines || [])) {
        const rec = recipes.find((r) => r.itemId === l.id || r.itemName === l.name)
        if (rec && rec.lines) {
          for (const rl of rec.lines) {
            const ing = ingredients.find((x) => x.id === rl.ingredientId || x.name === rl.name)
            if (ing) cost += Number(rl.qty || 0) * Number(ing.cost || 0) * Number(l.qty || 1)
          }
        }
      }
    }
    return cost
  }, [todayInvoices, recipes, ingredients])
  const netProfit = todaySales - todayCost
  const lowStock = ingredients.filter((i) => Number(i.stock) <= Number(i.minStock || 500))

  function sendWhatsApp() {
    const msg = `📊 ملخص ${settings.shopName || 'نيوم'} (${today})\n• الطلبات: ${todayInvoices.length}\n• المبيعات: ${fmt(todaySales)} ${settings.currency}\n• صافي الربح: ${fmt(netProfit)} ${settings.currency}`
    share.whatsapp(settings.ownerPhone || '', msg)
  }

  return (
    <div className="space-y-4">
      {lowStock.length > 0 && <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl flex items-center gap-3 text-red-800 text-xs"><AlertTriangle size={20} /><div><span className="font-extrabold">نواقص المخزون: </span>{lowStock.map((x) => `${x.name} (${x.stock} ${x.unit})`).join(' • ')}</div></div>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-sm"><div className="text-xs text-[#123B36]/60">مبيعات اليوم</div><div className="text-xl font-extrabold mt-1">{fmt(todaySales)} {settings.currency}</div></div>
        <div className="bg-white p-4 rounded-2xl shadow-sm"><div className="text-xs text-[#123B36]/60">تكلفة الخامات</div><div className="text-xl font-extrabold mt-1 text-amber-700">{fmt(todayCost)} {settings.currency}</div></div>
        <div className="bg-white p-4 rounded-2xl shadow-sm"><div className="text-xs text-[#123B36]/60">صافي الربح</div><div className="text-xl font-extrabold mt-1 text-emerald-700">{fmt(netProfit)} {settings.currency}</div></div>
        <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col justify-between"><div className="text-xs text-[#123B36]/60">الطلبات: {todayInvoices.length}</div><button onClick={sendWhatsApp} className="mt-2 py-2 px-3 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"><Send size={14} /> ملخص واتساب</button></div>
      </div>
      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <h3 className="font-extrabold text-sm mb-3">آخر الفواتير</h3>
        <div className="space-y-2">{invoices.slice(0, 15).map((inv) => <div key={inv.id} className="flex justify-between items-center text-xs bg-[#F4F1EA] p-3 rounded-xl"><div><span className="font-extrabold ml-2">{inv.number}</span><span>{inv.cashierName}</span> ({inv.paymentMethod})</div><div className="font-extrabold">{fmt(inv.total)} {settings.currency}</div></div>)}</div>
      </div>
    </div>
  )
}

export function InventoryScreen({ items, ingredients, currency }) {
  const [name, setName] = useState(''); const [price, setPrice] = useState('')
  const [ingName, setIngName] = useState(''); const [ingStock, setIngStock] = useState('')
  async function addMenuItem(e) { e.preventDefault(); if (!name || !price) return; await db.insertShared('items', { name, price: Number(price), category: 'مشروبات' }); setName(''); setPrice('') }
  async function addIngredient(e) { e.preventDefault(); if (!ingName) return; await db.insertShared('ingredients', { name: ingName, stock: Number(ingStock || 0), unit: 'جم', minStock: 500 }); setIngName(''); setIngStock('') }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm space-y-4">
        <h3 className="font-extrabold text-base">إدارة أصناف البيع ({items.length})</h3>
        <form onSubmit={addMenuItem} className="grid grid-cols-3 gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم المشروب" required className="p-2.5 rounded-xl bg-[#F4F1EA] text-xs outline-none" />
          <input type="number" step="any" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="السعر" required className="p-2.5 rounded-xl bg-[#F4F1EA] text-xs outline-none" />
          <button type="submit" className="bg-[#123B36] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"><Plus size={15} /> إضافة</button>
        </form>
        <div className="max-h-80 overflow-y-auto space-y-1.5">
          {items.map((it) => (
            <div key={it.id} className="flex justify-between items-center text-xs bg-[#F4F1EA] p-2.5 rounded-xl">
              <span className="font-bold">{it.name}</span>
              <div className="flex items-center gap-2">
                <span>{fmt(it.price)} {currency}</span>
                <button onClick={() => { const p = prompt('السعر الجديد:', it.price); if (p) db.updateShared('items', it.id, { price: Number(p) }) }} className="text-blue-700"><Edit3 size={14} /></button>
                <button onClick={() => db.deleteShared('items', it.id)} className="text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white p-4 rounded-2xl shadow-sm space-y-4">
        <h3 className="font-extrabold text-base">رصيد الخامات ({ingredients.length})</h3>
        <form onSubmit={addIngredient} className="grid grid-cols-4 gap-2">
          <input value={ingName} onChange={(e) => setIngName(e.target.value)} placeholder="اسم الخامة" required className="col-span-2 p-2.5 rounded-xl bg-[#F4F1EA] text-xs outline-none" />
          <input type="number" value={ingStock} onChange={(e) => setIngStock(e.target.value)} placeholder="الكمية (جم)" className="p-2.5 rounded-xl bg-[#F4F1EA] text-xs outline-none" />
          <button type="submit" className="bg-[#123B36] text-white rounded-xl text-xs font-bold">إضافة</button>
        </form>
        <div className="max-h-80 overflow-y-auto space-y-1.5">{ingredients.map((ing) => <div key={ing.id} className="flex justify-between items-center text-xs bg-[#F4F1EA] p-2.5 rounded-xl"><span className="font-bold">{ing.name}</span><span className="font-extrabold">{ing.stock} {ing.unit}</span></div>)}</div>
      </div>
    </div>
  )
}

export function SettingsScreen({ settings }) {
  const [shopName, setShopName] = useState(settings.shopName || 'نيوم')
  const [ownerPhone, setOwnerPhone] = useState(settings.ownerPhone || '')
  const [staff, setStaff] = useState(() => getStaffList())
  const [saved, setSaved] = useState(false)
  async function saveAll(e) { e.preventDefault(); await db.upsertShared('settings', { shopName, ownerPhone, currency: 'ر.ع' }, 'main'); saveStaffList(staff); setSaved(true); setTimeout(() => setSaved(false), 3000) }
  return (
    <form onSubmit={saveAll} className="max-w-lg mx-auto bg-white p-5 rounded-2xl shadow-sm space-y-4">
      <h2 className="font-extrabold text-lg">إعدادات المقهى والأرقام السرية</h2>
      <div><label className="block text-xs font-bold mb-1">اسم المقهى</label><input value={shopName} onChange={(e) => setShopName(e.target.value)} className="w-full p-3 rounded-xl bg-[#F4F1EA] text-sm outline-none" /></div>
      <div><label className="block text-xs font-bold mb-1">رقم واتساب المالك</label><input value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} className="w-full p-3 rounded-xl bg-[#F4F1EA] text-sm outline-none" /></div>
      <div className="space-y-2">
        <label className="block text-xs font-bold">الأرقام السرية للدخول (PIN)</label>
        {staff.map((m, idx) => (
          <div key={m.id} className="flex items-center gap-2 bg-[#F4F1EA] p-2.5 rounded-xl text-xs">
            <input value={m.displayName} onChange={(e) => setStaff((s) => s.map((x, i) => i === idx ? { ...x, displayName: e.target.value } : x))} className="flex-1 bg-white p-2 rounded-lg font-bold outline-none" />
            <input value={m.pin} onChange={(e) => setStaff((s) => s.map((x, i) => i === idx ? { ...x, pin: e.target.value } : x))} className="w-24 bg-white p-2 rounded-lg text-center font-extrabold tracking-widest outline-none" />
          </div>
        ))}
      </div>
      {saved && <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">تم الحفظ بنجاح!</div>}
      <button type="submit" className="w-full py-3.5 rounded-xl bg-[#123B36] text-white font-extrabold text-sm">حفظ الإعدادات</button>
    </form>
  )
}
