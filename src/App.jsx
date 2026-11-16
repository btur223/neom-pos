import { useState, useEffect, useMemo } from 'react'
import { ShoppingCart, Truck, LayoutDashboard, Boxes, SlidersHorizontal, LogOut, Plus, Trash2, Printer, Send, AlertTriangle, CheckCircle2, Search, Edit3 } from 'lucide-react'
import { db } from './lib/db'
import { auth } from './lib/auth'
import { useLiveShared } from './lib/useLive'
import { share } from './lib/share'
import TeamLogin, { getStaffList, saveStaffList } from './components/TeamLogin'

const todayStr = () => new Date().toISOString().slice(0, 10)
const fmt = (n) => Number(n || 0).toFixed(3)

export default function App() {
  const [user, setUser] = useState(() => auth.getCurrentUser())
  const isManager = user?.role === 'manager'
  const [tab, setTab] = useState(isManager ? 'dashboard' : 'sales')

  useEffect(() => auth.onAuthChange(() => {
    const u = auth.getCurrentUser()
    setUser(u)
    if (u) setTab(u.role === 'manager' ? 'dashboard' : 'sales')
  }), [])

  const { data: items } = useLiveShared('items', { order: 'name' })
  const { data: ingredients } = useLiveShared('ingredients', { order: 'name' })
  const { data: recipes } = useLiveShared('recipes')
  const { data: invoices } = useLiveShared('invoices', { order: '-createdAt', limit: 200 })
  const { data: shipments } = useLiveShared('shipments', { order: '-createdAt', limit: 100 })
  const { data: settingsList } = useLiveShared('settings')
  const settings = settingsList?.[0] || { id: 'main', currency: 'ر.ع', ownerPhone: '', shopName: 'نيوم' }

  if (!user) return <TeamLogin appName={settings.shopName || 'نيوم'} onSignedIn={() => setUser(auth.getCurrentUser())} />

  const navItems = isManager
    ? [
        { id: 'dashboard', label: 'الرئيسية والأرباح', icon: LayoutDashboard },
        { id: 'sales', label: 'الكاشير', icon: ShoppingCart },
        { id: 'materials', label: 'استلام الخامات', icon: Truck },
        { id: 'inventory', label: 'المخزن والوصفات', icon: Boxes },
        { id: 'settings', label: 'الإعدادات والموظفين', icon: SlidersHorizontal },
      ]
    : [
        { id: 'sales', label: 'الكاشير', icon: ShoppingCart },
        { id: 'materials', label: 'استلام الخامات', icon: Truck },
      ]

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F1EA] text-[#123B36]" dir="rtl">
      {/* الشريط العلوي */}
      <header className="bg-[#123B36] text-[#F6F3EC] px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-xl tracking-wide">{settings.shopName || 'نيوم'}</span>
          <span className="text-xs bg-white/15 px-2.5 py-1 rounded-full">{user.displayName}</span>
        </div>
        <nav className="flex items-center gap-1.5 overflow-x-auto">
          {navItems.map((n) => {
            const Icon = n.icon
            const active = tab === n.id
            return (
              <button key={n.id} onClick={() => setTab(n.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${active ? 'bg-[#F4F1EA] text-[#123B36]' : 'text-white/80 hover:bg-white/10'}`}>
                <Icon size={16} />
                <span>{n.label}</span>
              </button>
            )
          })}
          <button onClick={() => auth.signOut()} title="خروج" className="p-2 rounded-xl text-red-200 hover:bg-red-500/20 mr-1">
            <LogOut size={18} />
          </button>
        </nav>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4">
        {tab === 'sales' && <SalesScreen items={items} recipes={recipes} ingredients={ingredients} invoices={invoices} user={user} currency={settings.currency} shopName={settings.shopName} />}
        {tab === 'materials' && <MaterialsScreen ingredients={ingredients} shipments={shipments} currency={settings.currency} />}
        {tab === 'dashboard' && isManager && <DashboardScreen invoices={invoices} items={items} ingredients={ingredients} recipes={recipes} shipments={shipments} settings={settings} />}
        {tab === 'inventory' && isManager && <InventoryScreen items={items} ingredients={ingredients} recipes={recipes} currency={settings.currency} />}
        {tab === 'settings' && isManager && <SettingsScreen settings={settings} />}
      </main>
    </div>
  )
}

/* ==================== 1. شاشة الكاشير السريع ==================== */
function SalesScreen({ items, recipes, ingredients, invoices, user, currency, shopName }) {
  const [cat, setCat] = useState('الكل')
  const [q, setQ] = useState('')
  const [cart, setCart] = useState([])
  const [payMethod, setPayMethod] = useState('نقدي')
  const [lastReceipt, setLastReceipt] = useState(null)
  const [busy, setBusy] = useState(false)

  const cats = useMemo(() => ['الكل', ...new Set(items.map((i) => i.category).filter(Boolean))], [items])
  const filtered = useMemo(() => items.filter((i) => (cat === 'الكل' || i.category === cat) && (!q || i.name.includes(q))), [items, cat, q])
  const total = cart.reduce((s, l) => s + l.price * l.qty, 0)

  const todayCount = invoices.filter((inv) => inv.date === todayStr()).length
  const nextOrderNum = `#${String(todayCount + 1).padStart(2, '0')}`

  function addItem(item) {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.id === item.id)
      if (idx > -1) { const copy = [...prev]; copy[idx].qty += 1; return copy }
      return [...prev, { id: item.id, name: item.name, price: Number(item.price), qty: 1 }]
    })
  }

  async function checkout() {
    if (!cart.length || busy) return
    setBusy(true)
    try {
      const inv = await db.insertShared('invoices', {
        date: todayStr(),
        number: nextOrderNum,
        total,
        amountPaid: total,
        paymentMethod: payMethod,
        lines: cart,
        cashierId: user.id,
        cashierName: user.displayName,
        stockDeducted: true,
      })
      // خصم الخامات تلقائياً بالجرام حسب الوصفة
      for (const line of cart) {
        const rec = recipes.find((r) => r.itemId === line.id || r.itemName === line.name)
        if (rec?.lines?.length) {
          for (const rl of rec.lines) {
            const ing = ingredients.find((x) => x.id === rl.ingredientId || x.name === rl.name)
            if (ing) await db.incrementShared('ingredients', ing.id, 'stock', -(Number(rl.qty) * line.qty))
          }
        }
      }
      setLastReceipt({ ...inv, lines: cart })
      setCart([])
    } finally { setBusy(false) }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* قائمة الأصناف */}
      <div className="lg:col-span-2 space-y-3">
        <div className="flex flex-wrap gap-2 items-center bg-white p-3 rounded-2xl shadow-sm">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#123B36]/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث سريع عن مشروب أو صنف..."
              className="w-full pr-9 pl-3 py-2 rounded-xl bg-[#F4F1EA] text-sm outline-none" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${cat === c ? 'bg-[#123B36] text-white' : 'bg-[#F4F1EA] text-[#123B36]'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-sm text-[#123B36]/60">
            لا توجد أصناف مضافة بعد. يمكن للمالك إضافة الأصناف من تبويب "المخزن والوصفات".
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {filtered.map((item) => (
              <button key={item.id} onClick={() => addItem(item)}
                className="bg-white p-3.5 rounded-2xl shadow-sm border border-[#123B36]/10 hover:border-[#123B36] text-right flex flex-col justify-between active:scale-95 transition">
                <span className="font-bold text-sm leading-snug">{item.name}</span>
                <span className="text-xs font-extrabold text-[#123B36]/70 mt-2">{fmt(item.price)} {currency}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* سلة الطلب والدفع */}
      <div className="bg-white p-4 rounded-2xl shadow-md border border-[#123B36]/10 flex flex-col justify-between h-fit sticky top-20">
        <div>
          <div className="flex items-center justify-between border-b pb-3 mb-3">
            <h2 className="font-extrabold text-base">الطلب الحالي</h2>
            <span className="bg-[#123B36] text-white text-xs font-bold px-2.5 py-1 rounded-lg">طلب {nextOrderNum}</span>
          </div>

          {cart.length === 0 ? (
            <p className="text-center text-xs text-[#123B36]/45 py-10">اضغط على الأصناف لإضافتها للطلب</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {cart.map((l, idx) => (
                <div key={l.id} className="flex items-center justify-between bg-[#F4F1EA] p-2.5 rounded-xl text-xs">
                  <div className="flex-1">
                    <div className="font-bold">{l.name}</div>
                    <div className="text-[#123B36]/60">{fmt(l.price)} × {l.qty}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setCart((p) => p.map((x, i) => i === idx ? { ...x, qty: Math.max(1, x.qty - 1) } : x))} className="w-7 h-7 bg-white rounded-lg font-bold">-</button>
                    <span className="w-5 text-center font-bold">{l.qty}</span>
