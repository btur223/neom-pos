import { useState, useEffect, useMemo } from 'react'
import { ShoppingCart, Truck, LayoutDashboard, Boxes, SlidersHorizontal, LogOut, Trash2, Printer, CheckCircle2, Search, MessageCircle, Award, AlertTriangle, Clock, Download, QrCode, X, PauseCircle, PlayCircle, Percent, StickyNote, Coffee, CalendarClock, Store, Ticket, Star } from 'lucide-react'
import { db } from './lib/db'
import { auth } from './lib/auth'
import { useLiveShared } from './lib/useLive'
import TeamLogin from './components/TeamLogin'
import { DashboardScreen, InventoryScreen, SettingsScreen } from './AdminScreens'

const todayStr = () => new Date().toISOString().slice(0, 10)
const fmt = (n) => Number(n || 0).toFixed(3)

export default function App() {
  const isQrMenu = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('menu') === '1'
  const [user, setUser] = useState(() => auth.getCurrentUser())
  const isManager = user?.role === 'manager'
  const [tab, setTab] = useState(isManager ? 'dashboard' : 'sales')
  const [showShiftModal, setShowShiftModal] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)

  useEffect(() => auth.onAuthChange(() => {
    const u = auth.getCurrentUser(); setUser(u)
    if (u) setTab(u.role === 'manager' ? 'dashboard' : 'sales')
  }), [])

  const { data: items } = useLiveShared('items', { order: 'name' })
  const { data: ingredients } = useLiveShared('ingredients', { order: 'name' })
  const { data: recipes } = useLiveShared('recipes')
  const { data: invoices } = useLiveShared('invoices', { order: '-createdAt', limit: 300 })
  const { data: shipments } = useLiveShared('shipments', { order: '-createdAt', limit: 100 })
  const { data: customers } = useLiveShared('customers')
  const { data: shifts } = useLiveShared('shifts', { order: '-opened_at', limit: 30 })
  const { data: settingsList } = useLiveShared('settings')
  const { data: tableOrders } = useLiveShared('table_orders', { order: '-createdAt', limit: 50 })
const settings = (settingsList && settingsList.length > 0) ? settingsList : { id: 'main', currency: 'ر.ع', ownerPhone: '', shopName: 'نيوم' }
  const f = { branches: true, barista: true, loyalty: true, qrMenu: true, holdDiscount: true, shifts: true, expiryCredit: true, analytics: true, quickCash: true, feedback: true, coupons: true, ...(settings.features || {}) }
  const branchesList = settings.branches || ['الفرع الرئيسي - صلالة']
  const [currentBranch, setCurrentBranch] = useState(() => localStorage.getItem('neom_branch') || branchesList)

  if (isQrMenu) return <PublicQrMenu items={items} shopName={settings.shopName || 'نيوم'} currency={settings.currency || 'ر.ع'} showFeedback={f.feedback} />
  if (!user) return <TeamLogin appName={settings.shopName || 'نيوم'} onSignedIn={() => setUser(auth.getCurrentUser())} />

  const lowStockItems = (ingredients || []).filter((i) => Number(i.stock || 0) <= Number(i.minStock || 500))
  const expiringItems = f.expiryCredit ? (shipments || []).filter((s) => s.expiry_date && ((new Date(s.expiry_date) - new Date(todayStr())) / (1000 * 60 * 60 * 24)) <= 5 && ((new Date(s.expiry_date) - new Date(todayStr())) / (1000 * 60 * 60 * 24)) >= -2) : []
  const openShift = (shifts || []).find((s) => s.status === 'open')

  function exportInvoicesCsv() {
    const headers = ['رقم الطلب', 'التاريخ', 'الفرع', 'الكاشير', 'طريقة الدفع', 'الخصم', 'الإجمالي']
    const rows = (invoices || []).map((inv) => [inv.number, inv.date, inv.branch || '', inv.cashierName || '', inv.paymentMethod || '', fmt(inv.discount || 0), fmt(inv.total)])
    const csv = '\uFEFF' + [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `neom-sales-${todayStr()}.csv`; a.click()
  }

  const baseNav = [
    ...(isManager ? [{ id: 'dashboard', label: 'الرئيسية والأرباح', icon: LayoutDashboard }] : []),
    { id: 'sales', label: 'الكاشير', icon: ShoppingCart },
    ...(f.barista ? [{ id: 'barista', label: 'الباريستا', icon: Coffee }] : []),
    { id: 'materials', label: 'استلام الخامات', icon: Truck },
    ...(isManager ? [{ id: 'inventory', label: 'المخزن والوصفات', icon: Boxes }, { id: 'settings', label: 'الإعدادات', icon: SlidersHorizontal }] : []),
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F1EA] text-[#123B36]" dir="rtl">
      <header className="bg-[#123B36] text-[#F6F3EC] px-4 py-3 flex flex-wrap items-center justify-between gap-2 shadow-md sticky top-0 z-30">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-extrabold text-xl">{settings.shopName || 'نيوم'}</span>
          <span className="text-xs bg-white/15 px-2.5 py-1 rounded-full">{user.displayName}</span>
          {f.branches && branchesList.length > 0 && (
            <div className="flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-full text-xs">
              <Store size={13} className="text-amber-300" />
              <select
                value={currentBranch}
                onChange={(e) => { setCurrentBranch(e.target.value); localStorage.setItem('neom_branch', e.target.value) }}
                className="bg-transparent text-white font-bold outline-none cursor-pointer"
              >
                {branchesList.map((b) => <option key={b} value={b} className="text-[#123B36]">{b}</option>)}
              </select>
            </div>
          )}
          {f.shifts && (
            <button onClick={() => setShowShiftModal(true)} className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${openShift ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40' : 'bg-amber-500/20 text-amber-200 border border-amber-400/40'}`}>
              <Clock size={13} /><span>{openShift ? 'الوردية مفتوحة' : 'فتح وردية'}</span>
            </button>
          )}
        </div>
        <nav className="flex items-center gap-1.5 overflow-x-auto">
          {baseNav.map((n) => { const Icon = n.icon; return <button key={n.id} onClick={() => setTab(n.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${tab === n.id ? 'bg-[#F4F1EA] text-[#123B36]' : 'text-white/80'}`}><Icon size={16} /><span>{n.label}</span></button> })}
          {f.qrMenu && <button onClick={() => setShowQrModal(true)} title="منيو الباركود للطاولات" className="p-2 rounded-xl bg-white/10 text-amber-200 hover:bg-white/20"><QrCode size={17} /></button>}
          {isManager && <button onClick={exportInvoicesCsv} title="تصدير المبيعات Excel" className="p-2 rounded-xl bg-white/10 text-emerald-200 hover:bg-white/20"><Download size={17} /></button>}
          <button onClick={() => auth.signOut()} className="p-2 rounded-xl text-red-200 mr-1"><LogOut size={18} /></button>
        </nav>
      </header>

      {(lowStockItems.length > 0 || expiringItems.length > 0) && (
        <div className="bg-red-600 text-white px-4 py-2 text-xs font-bold flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-4">
            {lowStockItems.length > 0 && (
              <span className="flex items-center gap-1.5"><AlertTriangle size={15} /> نواقص المخزون ({lowStockItems.length}): {lowStockItems.slice(0, 4).map((x) => `${x.name} (${x.stock} ${x.unit})`).join(' • ')}</span>
            )}
            {expiringItems.length > 0 && (
              <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-0.5 rounded-lg"><CalendarClock size={15} /> قريب الانتهاء: {expiringItems.slice(0, 3).map((x) => `${x.material} (${x.expiry_date})`).join(' • ')}</span>
            )}
          </div>
          {isManager && <button onClick={() => setTab('inventory')} className="underline shrink-0">عرض المخزن</button>}
        </div>
      )}

      <main className="flex-1 w-full px-3 sm:px-6 py-4">
        {tab === 'sales' && <SalesScreen items={items} recipes={recipes} ingredients={ingredients} invoices={invoices} customers={customers} tableOrders={tableOrders} user={user} currency={settings.currency} shopName={settings.shopName} features={f} coupons={settings.coupons || []} currentBranch={currentBranch} />}
        {tab === 'barista' && f.barista && <BaristaScreen invoices={invoices} currentBranch={currentBranch} showBranch={f.branches} />}
        {tab === 'materials' && <MaterialsScreen ingredients={ingredients} shipments={shipments} currency={settings.currency} isManager={isManager} features={f} currentBranch={currentBranch} />}
        {tab === 'dashboard' && isManager && <DashboardScreen invoices={invoices} ingredients={ingredients} recipes={recipes} settings={settings} features={f} currentBranch={currentBranch} />}
        {tab === 'inventory' && isManager && <InventoryScreen items={items} ingredients={ingredients} recipes={recipes} currency={settings.currency} />}
        {tab === 'settings' && isManager && <SettingsScreen settings={settings} />}
      </main>

      {showShiftModal && <ShiftModal openShift={openShift} shifts={shifts} invoices={invoices} user={user} currency={settings.currency} onClose={() => setShowShiftModal(false)} />}
      {showQrModal && <QrMenuModal shopName={settings.shopName || 'نيوم'} onClose={() => setShowQrModal(false)} />}
    </div>
  )
}

function SalesScreen({ items, recipes, ingredients, invoices, customers, tableOrders = [], user, currency, shopName }) {
  const [cat, setCat] = useState('الكل'); const [q, setQ] = useState(''); const [cart, setCart] = useState([])
  const [payMethod, setPayMethod] = useState('نقدي'); const [lastReceipt, setLastReceipt] = useState(null); const [busy, setBusy] = useState(false)
  const [phone, setPhone] = useState(''); const [redeemDiscount, setRedeemDiscount] = useState(0)
  const [manualDiscount, setManualDiscount] = useState(''); const [orderNote, setOrderNote] = useState('')
  const [heldOrders, setHeldOrders] = useState([])
  const [activeTableOrder, setActiveTableOrder] = useState(null)

  const pendingOrders = (tableOrders || []).filter((o) => o.status === 'pending')
  const cats = useMemo(() => ['الكل', ...new Set(items.map((i) => i.category).filter(Boolean))], [items])
  const filtered = useMemo(() => items.filter((i) => (cat === 'الكل' || i.category === cat) && (!q || i.name.includes(q))), [items, cat, q])
  const cleanPhone = phone.replace(/\D/g, '')
  const customer = useMemo(() => cleanPhone.length >= 8 ? (customers || []).find((c) => c.phone === cleanPhone) : null, [customers, cleanPhone])

  const subTotal = cart.reduce((s, l) => s + l.price * l.qty, 0)
  const extraDiscount = Number(manualDiscount || 0)
  const totalDiscount = redeemDiscount + extraDiscount
  const total = Math.max(0, subTotal - totalDiscount)
  const nextOrderNum = `#${String(invoices.filter((inv) => inv.date === todayStr()).length + 1).padStart(2, '0')}`

  function addItem(item) {
    setCart((prev) => { const idx = prev.findIndex((x) => x.id === item.id); if (idx > -1) { const c = [...prev]; c[idx].qty += 1; return c } return [...prev, { id: item.id, name: item.name, price: Number(item.price), qty: 1 }] })
  }

  function holdCurrentOrder() {
    if (!cart.length) return
    const label = activeTableOrder ? `طاولة ${activeTableOrder.table_num}` : (orderNote || `طلب معلق ${heldOrders.length + 1}`)
    setHeldOrders((prev) => [...prev, { id: Date.now(), label, cart, note: orderNote, discount: manualDiscount }])
    setCart([]); setOrderNote(''); setManualDiscount(''); setActiveTableOrder(null)
  }

  function resumeHeldOrder(held) {
    if (cart.length > 0 && !confirm('السلة الحالية تحتوي على أصناف، هل تريد استبدالها بالطلب المعلق؟')) return
    setCart(held.cart); setOrderNote(held.note || ''); setManualDiscount(held.discount || '')
    setHeldOrders((prev) => prev.filter((x) => x.id !== held.id))
  }

  async function checkout() {
    if (!cart.length || busy) return; setBusy(true)
    try {
      const inv = await db.insertShared('invoices', {
        date: todayStr(),
        number: nextOrderNum,
        total,
        discount: totalDiscount,
        note: orderNote.trim() || null,
        amountPaid: total,
        paymentMethod: payMethod,
        lines: cart,
        cashierId: user.id,
        cashierName: user.displayName,
        customerPhone: cleanPhone || null,
        stockDeducted: true
      })
      for (const line of cart) {
        const rec = recipes.find((r) => r.itemId === line.id || r.itemName === line.name)
        if (rec && rec.lines) { for (const rl of rec.lines) { const ing = ingredients.find((x) => x.id === rl.ingredientId || x.name === rl.name); if (ing) await db.incrementShared('ingredients', ing.id, 'stock', -(Number(rl.qty) * line.qty)) } }
      }
      const earnedPts = Math.floor(total * 10)
      if (cleanPhone.length >= 8) {
        if (customer) {
          const nextPts = Math.max(0, Number(customer.points || 0) - (redeemDiscount > 0 ? 50 : 0) + earnedPts)
          await db.updateShared('customers', customer.id, { points: nextPts, total_spent: Number(customer.total_spent || 0) + total, visits: Number(customer.visits || 0) + 1 })
        } else {
          await db.insertShared('customers', { phone: cleanPhone, points: earnedPts, total_spent: total, visits: 1 })
        }
      }
      if (activeTableOrder) {
        await db.updateShared('table_orders', activeTableOrder.id, { status: 'completed' })
        setActiveTableOrder(null)
      }
      setLastReceipt({ ...inv, lines: cart, phone: cleanPhone, earnedPts, note: orderNote, discount: totalDiscount })
      setCart([]); setRedeemDiscount(0); setManualDiscount(''); setOrderNote(''); setPhone('')
    } finally { setBusy(false) }
  }

  function sendWhatsApp(rec) {
    const linesTxt = rec.lines.map((l) => `- ${l.name} × ${l.qty} = ${fmt(l.price * l.qty)} ${currency}`).join('\n')
    const msg = `مرحباً بك في مقهى *${shopName || 'نيوم'}* ☕\nرقم الطلب: *${rec.number}*\nالتاريخ: ${rec.date}\n\n${linesTxt}\n${rec.discount > 0 ? `\nالخصم: -${fmt(rec.discount)} ${currency}` : ''}\n*الإجمالي: ${fmt(rec.total)} ${currency}*\n${rec.earnedPts ? `نقاط الولاء المكتسبة: +${rec.earnedPts} نقطة ⭐\n` : ''}شكراً لزيارتكم!`
    const target = rec.phone ? (rec.phone.startsWith('968') ? rec.phone : `968${rec.phone}`) : ''
    window.open('https://wa.me' + '/' + target + '?text=' + encodeURIComponent(msg), '_blank')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-3">
        {pendingOrders.length > 0 && (
          <div className="bg-amber-50 border-2 border-amber-400 p-3 rounded-2xl space-y-2">
            <div className="font-extrabold text-xs text-amber-900">🔔 طلبات جديدة من الطاولات ({pendingOrders.length})</div>
            <div className="flex flex-wrap gap-2">
              {pendingOrders.map((ord) => (
                <div key={ord.id} className="bg-white border border-amber-300 p-2.5 rounded-xl text-xs flex items-center gap-3 shadow-sm">
                  <div>
                    <div className="font-extrabold text-[#123B36]">طاولة {ord.table_num} • {fmt(ord.total)} {currency}</div>
                    <div className="text-[11px] text-[#123B36]/70">{(ord.lines || []).map((l) => `${l.name}×${l.qty}`).join('، ')}</div>
                    {ord.customer_note && <div className="text-[10px] text-amber-700 font-bold">ملاحظة: {ord.customer_note}</div>}
                  </div>
                  <button onClick={() => { setCart(ord.lines || []); setOrderNote(ord.customer_note || `طاولة ${ord.table_num}`); setActiveTableOrder(ord) }} className="bg-[#123B36] text-white px-3 py-1.5 rounded-lg font-bold">اعتماد</button>
                  <button onClick={() => db.updateShared('table_orders', ord.id, { status: 'cancelled' })} className="text-red-500 font-bold px-1">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {heldOrders.length > 0 && (
          <div className="bg-blue-50 border border-blue-300 p-2.5 rounded-2xl flex flex-wrap items-center gap-2 text-xs">
            <span className="font-extrabold text-blue-900 flex items-center gap-1"><PauseCircle size={15} /> طلبات معلقة:</span>
            {heldOrders.map((h) => (
              <div key={h.id} className="bg-white border border-blue-200 px-2.5 py-1 rounded-xl flex items-center gap-2 shadow-xs">
                <span className="font-bold">{h.label} ({h.cart.length} أصناف)</span>
                <button onClick={() => resumeHeldOrder(h)} className="text-emerald-700 font-extrabold flex items-center gap-0.5"><PlayCircle size={14} /> استرجاع</button>
                <button onClick={() => setHeldOrders((p) => p.filter((x) => x.id !== h.id))} className="text-red-500 font-bold">✕</button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 items-center bg-white p-3 rounded-2xl shadow-sm">
          <div className="relative flex-1 min-w-[180px]"><Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#123B36]/40" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث سريع..." className="w-full pr-9 pl-3 py-2 rounded-xl bg-[#F4F1EA] text-sm outline-none" /></div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">{cats.map((c) => <button key={c} onClick={() => setCat(c)} className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${cat === c ? 'bg-[#123B36] text-white' : 'bg-[#F4F1EA]'}`}>{c}</button>)}</div>
        </div>
        {filtered.length === 0 ? <div className="bg-white p-8 rounded-2xl text-center text-sm text-[#123B36]/60">لا توجد أصناف بعد.</div> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">{filtered.map((item) => <button key={item.id} onClick={() => addItem(item)} className="bg-white p-3.5 rounded-2xl shadow-sm border border-[#123B36]/10 text-right flex flex-col justify-between hover:border-[#123B36]/40 transition"><span className="font-bold text-sm">{item.name}</span><span className="text-xs font-extrabold text-[#123B36]/70 mt-2">{fmt(item.price)} {currency}</span></button>)}</div>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-md border border-[#123B36]/10 flex flex-col justify-between h-fit sticky top-20">
        <div>
          <div className="flex items-center justify-between border-b pb-3 mb-3">
            <h2 className="font-extrabold text-base">الطلب الحالي</h2>
            <div className="flex items-center gap-1.5">
              {cart.length > 0 && <button onClick={holdCurrentOrder} title="تعليق الطلب" className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><PauseCircle size={13} /> تعليق</button>}
              <span className="bg-[#123B36] text-white text-xs font-bold px-2.5 py-1 rounded-lg">طلب {nextOrderNum}</span>
            </div>
          </div>

         <div className="mb-3 bg-[#F4F1EA] p-2.5 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2"><Award size={15} className="text-amber-600" /><input value={phone} onChange={(e) => { setPhone(e.target.value); setRedeemDiscount(0) }} placeholder="جوال العميل لنقاط الولاء (اختياري)" className="bg-transparent text-xs w-full outline-none font-bold" /></div>
            {customer && (
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#123B36]/10">
                <span className="font-bold text-emerald-700">رصيد العميل: {customer.points} نقطة</span>
                {Number(customer.points) >= 50 && (
                  <button onClick={() => setRedeemDiscount(redeemDiscount > 0 ? 0 : 0.5)} className={`px-2 py-0.5 rounded font-bold ${redeemDiscount > 0 ? 'bg-amber-600 text-white' : 'bg-white text-amber-700'}`}>
                    {redeemDiscount > 0 ? 'إلغاء الخصم' : 'استبدال 50 نقطة (-0.500)'}
                  </button>
                )}
              </div>
            )}
          </div>

          {cart.length === 0 ? <p className="text-center text-xs text-[#123B36]/45 py-8">اضغط على الأصناف لإضافتها</p> : (
            <div className="space-y-2 max-h-56 overflow-y-auto">{cart.map((l, idx) => (
              <div key={l.id} className="flex items-center justify-between bg-[#F4F1EA] p-2.5 rounded-xl text-xs">
                <div className="flex-1"><div className="font-bold">{l.name}</div><div className="text-[#123B36]/60">{fmt(l.price)} × {l.qty}</div></div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setCart((p) => p.map((x, i) => i === idx ? { ...x, qty: Math.max(1, x.qty - 1) } : x))} className="w-7 h-7 bg-white rounded-lg font-bold">-</button>
                  <span className="w-5 text-center font-bold">{l.qty}</span>
                  <button onClick={() => setCart((p) => p.map((x, i) => i === idx ? { ...x, qty: x.qty + 1 } : x))} className="w-7 h-7 bg-white rounded-lg font-bold">+</button>
                  <button onClick={() => setCart((p) => p.filter((_, i) => i !== idx))} className="text-red-600 p-1"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}</div>
          )}

          {cart.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="relative">
                <StickyNote size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#123B36]/40" />
                <input value={orderNote} onChange={(e) => setOrderNote(e.target.value)} placeholder="ملاحظة (بدون سكر...)" className="w-full bg-[#F4F1EA] pr-7 pl-2 py-1.5 rounded-xl text-[11px] outline-none" />
              </div>
              <div className="relative">
                <Percent size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#123B36]/40" />
                <input type="number" step="0.050" min="0" value={manualDiscount} onChange={(e) => setManualDiscount(e.target.value)} placeholder={`خصم (${currency})`} className="w-full bg-[#F4F1EA] pr-7 pl-2 py-1.5 rounded-xl text-[11px] outline-none font-bold" />
              </div>
            </div>
          )}
        </div>

        <div className="border-t pt-3 mt-4 space-y-3">
          <div className="flex gap-2">{['نقدي', 'بطاقة', 'تحويل'].map((m) => <button key={m} onClick={() => setPayMethod(m)} className={`flex-1 py-2 rounded-xl text-xs font-bold ${payMethod === m ? 'bg-[#123B36] text-white' : 'bg-[#F4F1EA]'}`}>{m}</button>)}</div>
          {totalDiscount > 0 && <div className="flex justify-between text-xs font-bold text-amber-700"><span>إجمالي الخصم:</span><span>-{fmt(totalDiscount)} {currency}</span></div>}
          <div className="flex justify-between items-center text-lg font-extrabold"><span>الإجمالي:</span><span>{fmt(total)} {currency}</span></div>
          <button onClick={checkout} disabled={!cart.length || busy} className="w-full py-3.5 rounded-xl bg-[#123B36] text-white font-extrabold text-base disabled:opacity-40">{busy ? 'جاري الحفظ...' : 'إتمام البيع'}</button>

          {lastReceipt && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between"><span className="font-bold text-emerald-800">تم حفظ {lastReceipt.number}</span><span className="text-emerald-700 font-bold">{fmt(lastReceipt.total)} {currency}</span></div>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-1 bg-[#123B36] text-white py-2 rounded-lg font-bold"><Printer size={14} /> طباعة</button>
                <button onClick={() => sendWhatsApp(lastReceipt)} className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 text-white py-2 rounded-lg font-bold"><MessageCircle size={14} /> واتساب</button>
              </div>
            </div>
          )}
        </div>

        {lastReceipt && (
          <div id="receipt-print" className="hidden print:block p-4 text-center text-xs" dir="rtl">
            <h3 className="font-bold text-base">{shopName || 'نيوم'}</h3>
            <p>طلب: {lastReceipt.number} | {lastReceipt.date}</p>
            {lastReceipt.note && <p className="font-bold mt-1">ملاحظة: {lastReceipt.note}</p>}
            <hr className="my-2" />
            {lastReceipt.lines.map((l) => <div key={l.id} className="flex justify-between my-1"><span>{l.name} × {l.qty}</span><span>{fmt(l.price * l.qty)}</span></div>)}
            <hr className="my-2" />
            {lastReceipt.discount > 0 && <div className="flex justify-between my-1"><span>الخصم:</span><span>-{fmt(lastReceipt.discount)}</span></div>}
            <p className="font-bold">الإجمالي: {fmt(lastReceipt.total)} {currency}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function BaristaScreen({ invoices = [], currentBranch, showBranch }) {
  const [doneIds, setDoneIds] = useState([])
  const todayOrders = invoices.filter((i) => i.date === todayStr() && !doneIds.includes(i.id) && (!showBranch || !i.branch || i.branch === currentBranch))

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between border border-[#123B36]/10">
        <h2 className="font-extrabold text-lg flex items-center gap-2"><Coffee size={22} /> شاشة تحضير الباريستا ({todayOrders.length})</h2>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl">تحديث فوري</span>
      </div>
      {todayOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center text-sm font-bold text-[#123B36]/50">لا توجد طلبات قيد التحضير حالياً ☕</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {todayOrders.map((inv) => (
            <div key={inv.id} className="bg-white p-4 rounded-2xl shadow-md border-2 border-[#123B36]/20 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex justify-between items-center border-b pb-2 mb-2">
                  <span className="font-extrabold text-lg text-[#123B36]">طلب {inv.number}</span>
                  <span className="text-[11px] bg-[#F4F1EA] px-2 py-0.5 rounded-lg font-bold">{inv.cashierName || 'كاشير'}</span>
                </div>
                <div className="space-y-1.5 text-sm font-extrabold">
                  {(inv.lines || []).map((l, idx) => (
                    <div key={idx} className="bg-[#F4F1EA] px-2.5 py-1.5 rounded-xl flex justify-between">
                      <span>{l.name}</span>
                      <span className="text-amber-800">× {l.qty}</span>
                    </div>
                  ))}
                </div>
                {inv.note && <div className="mt-2 bg-amber-100 text-amber-950 p-2 rounded-xl text-xs font-extrabold">📝 {inv.note}</div>}
              </div>
              <button onClick={() => setDoneIds((p) => [...p, inv.id])} className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5">
                <CheckCircle2 size={16} /> تم التحضير والتسليم
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MaterialsScreen({ ingredients, shipments = [], currency, isManager, features = {}, currentBranch = 'الفرع الرئيسي - صلالة' }) {
  const [material, setMaterial] = useState(''); const [qty, setQty] = useState(''); const [unit, setUnit] = useState('كيلو'); const [price, setPrice] = useState(''); const [supplier, setSupplier] = useState(''); const [payStatus, setPayStatus] = useState('مدفوع'); const [expiryDate, setExpiryDate] = useState(''); const [done, setDone] = useState(false)
  async function handleSave(e) {
    e.preventDefault(); if (!material || !qty) return
    const numQty = Number(qty); const baseQty = numQty * ((unit === 'كيلو' || unit === 'لتر') ? 1000 : 1)
    const baseUnit = unit === 'كيلو' ? 'جم' : unit === 'لتر' ? 'مل' : unit; const totalCost = Number(price || 0); const unitCost = baseQty > 0 ? totalCost / baseQty : 0
    await db.insertShared('shipments', { date: todayStr(), material: material.trim(), supplier: supplier.trim(), qty: numQty, unit, price: totalCost, total: totalCost, pay_status: payStatus, expiry_date: expiryDate || null, branch: currentBranch })
    const existing = ingredients.find((i) => i.name.trim() === material.trim())
    if (existing) { await db.incrementShared('ingredients', existing.id, 'stock', baseQty); if (unitCost > 0) await db.updateShared('ingredients', existing.id, { cost: unitCost }) }
    else { await db.insertShared('ingredients', { name: material.trim(), unit: baseUnit, stock: baseQty, cost: unitCost, minStock: 500 }) }
    setMaterial(''); setQty(''); setPrice(''); setSupplier(''); setExpiryDate(''); setDone(true); setTimeout(() => setDone(false), 3000)
  }

  const totalPurchases = shipments.reduce((s, x) => s + Number(x.total || x.price || 0), 0)
  const unpaidTotal = shipments.filter((x) => x.pay_status === 'آجل').reduce((s, x) => s + Number(x.total || x.price || 0), 0)

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <form onSubmit={handleSave} className="bg-white p-5 rounded-2xl shadow-sm space-y-4 border border-[#123B36]/10">
        <h2 className="font-extrabold text-lg">تسجيل استلام خامات وفواتير الموردين</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="block text-xs font-bold mb-1">اسم المادة *</label><input list="ing-list" value={material} onChange={(e) => setMaterial(e.target.value)} required className="w-full p-3 rounded-xl bg-[#F4F1EA] text-sm outline-none" /><datalist id="ing-list">{ingredients.map((i) => <option key={i.id} value={i.name} />)}</datalist></div>
          <div><label className="block text-xs font-bold mb-1">اسم المورد</label><input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="اختياري..." className="w-full p-3 rounded-xl bg-[#F4F1EA] text-sm outline-none" /></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-xs font-bold mb-1">الكمية *</label><input type="number" step="any" value={qty} onChange={(e) => setQty(e.target.value)} required className="w-full p-3 rounded-xl bg-[#F4F1EA] text-sm outline-none" /></div>
          <div><label className="block text-xs font-bold mb-1">الوحدة</label><select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full p-3 rounded-xl bg-[#F4F1EA] text-sm font-bold"><option value="كيلو">كيلو (جرام)</option><option value="جرام">جرام</option><option value="لتر">لتر (مل)</option><option value="مل">مل</option><option value="حبة">حبة</option></select></div>
          <div><label className="block text-xs font-bold mb-1">السعر الإجمالي ({currency})</label><input type="number" step="any" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-3 rounded-xl bg-[#F4F1EA] text-sm outline-none" /></div>
        </div>
        {features.expiryCredit && (
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold mb-1">حالة الدفع للمورد</label><select value={payStatus} onChange={(e) => setPayStatus(e.target.value)} className="w-full p-3 rounded-xl bg-[#F4F1EA] text-sm font-bold outline-none"><option value="مدفوع">مدفوع (كاش/تحويل)</option><option value="آجل">آجل (ذمم للمورد)</option></select></div>
            <div><label className="block text-xs font-bold mb-1">تاريخ انتهاء الصلاحية</label><input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full p-3 rounded-xl bg-[#F4F1EA] text-sm outline-none" /></div>
          </div>
        )}
        {done && <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2"><CheckCircle2 size={16} /> تم الحفظ وتحديث المخزون!</div>}
        <button type="submit" className="w-full py-3.5 rounded-xl bg-[#123B36] text-white font-extrabold text-sm">حفظ وتحديث المخزون</button>
      </form>

      {shipments.length > 0 && (
        <div className="bg-white p-5 rounded-2xl shadow-sm space-y-3 border border-[#123B36]/10">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h3 className="font-extrabold text-sm">سجل المشتريات وذمم الموردين ({shipments.length})</h3>
            {isManager && (
              <div className="flex gap-2 text-xs font-extrabold">
                <span className="text-amber-800 bg-amber-50 px-3 py-1 rounded-xl">المشتريات: {fmt(totalPurchases)} {currency}</span>
                {features.expiryCredit && unpaidTotal > 0 && <span className="text-red-700 bg-red-50 px-3 py-1 rounded-xl border border-red-200">ديون الموردين: {fmt(unpaidTotal)} {currency}</span>}
              </div>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
            {shipments.map((s) => (
              <div key={s.id} className="flex flex-wrap justify-between items-center gap-2 bg-[#F4F1EA] p-3 rounded-xl">
                <div>
                  <div className="font-extrabold flex items-center gap-2">
                    <span>{s.material} ({s.qty} {s.unit || ''})</span>
                    {features.expiryCredit && (s.pay_status === 'آجل' ? <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-md text-[10px]">آجل</span> : <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-[10px]">مدفوع</span>)}
                  </div>
                  <div className="text-[11px] text-[#123B36]/60 mt-0.5">{s.date} {s.supplier ? `• ${s.supplier}` : ''} {s.expiry_date ? `• ينتهي: ${s.expiry_date}` : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#123B36]">{fmt(s.total || s.price)} {currency}</span>
                  {isManager && features.expiryCredit && s.pay_status === 'آجل' && <button onClick={() => db.updateShared('shipments', s.id, { pay_status: 'مدفوع' })} className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-bold text-[10px]">تسديد</button>}
                  {isManager && <button onClick={() => db.deleteShared('shipments', s.id)} className="text-red-500 p-1"><Trash2 size={15} /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
function ShiftModal({ openShift, shifts, invoices, user, currency, onClose }) {
  const [cashInput, setCashInput] = useState('')
  const todayInvoices = (invoices || []).filter((i) => i.date === todayStr())
  const cashSales = todayInvoices.filter((i) => i.paymentMethod === 'نقدي').reduce((s, i) => s + Number(i.total || 0), 0)
  const cardSales = todayInvoices.filter((i) => i.paymentMethod !== 'نقدي').reduce((s, i) => s + Number(i.total || 0), 0)

  async function handleOpen() {
    await db.insertShared('shifts', { cashier_name: user.displayName, opening_cash: Number(cashInput || 0), status: 'open', opened_at: new Date().toISOString() })
    onClose()
  }
  async function handleClose() {
    const expected = Number(openShift.opening_cash || 0) + cashSales
    await db.updateShared('shifts', openShift.id, { closing_cash: Number(cashInput || 0), expected_cash: expected, cash_sales: cashSales, card_sales: cardSales, status: 'closed', closed_at: new Date().toISOString() })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4">
        <div className="flex justify-between items-center border-b pb-3"><h3 className="font-extrabold text-base">{openShift ? 'إغلاق الوردية ومطابقة الصندوق' : 'فتح وردية جديدة'}</h3><button onClick={onClose}><X size={18} /></button></div>
        {openShift ? (
          <div className="space-y-3 text-xs">
            <div className="bg-[#F4F1EA] p-3 rounded-xl space-y-1.5">
              <div className="flex justify-between"><span>الرصيد الافتتاحي:</span><b>{fmt(openShift.opening_cash)} {currency}</b></div>
              <div className="flex justify-between"><span>مبيعات الكاش اليوم:</span><b>{fmt(cashSales)} {currency}</b></div>
              <div className="flex justify-between"><span>مبيعات البطاقة/التحويل:</span><b>{fmt(cardSales)} {currency}</b></div>
              <div className="flex justify-between border-t pt-1.5 text-sm text-emerald-800"><span>الكاش المتوقع بالدرج:</span><b>{fmt(Number(openShift.opening_cash || 0) + cashSales)} {currency}</b></div>
            </div>
            <div><label className="block font-bold mb-1">الكاش الفعلي المعدود في الدرج ({currency})</label><input type="number" step="any" value={cashInput} onChange={(e) => setCashInput(e.target.value)} className="w-full p-3 rounded-xl bg-[#F4F1EA] outline-none font-bold" /></div>
            <button onClick={handleClose} className="w-full py-3 rounded-xl bg-red-600 text-white font-extrabold">إغلاق الوردية وحفظ التقرير</button>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div><label className="block font-bold mb-1">رصيد العهدة الافتتاحي في الدرج ({currency})</label><input type="number" step="any" value={cashInput} onChange={(e) => setCashInput(e.target.value)} placeholder="0.000" className="w-full p-3 rounded-xl bg-[#F4F1EA] outline-none font-bold" /></div>
            <button onClick={handleOpen} className="w-full py-3 rounded-xl bg-[#123B36] text-white font-extrabold">بدء الوردية الآن</button>
          </div>
        )}
        {shifts?.length > 0 && (
          <div className="border-t pt-3 space-y-1.5 max-h-36 overflow-y-auto text-[11px]">
            <div className="font-bold text-[#123B36]/60">آخر الورديات:</div>
            {shifts.slice(0, 5).map((s) => <div key={s.id} className="flex justify-between bg-[#F4F1EA] p-2 rounded-lg"><span>{s.cashier_name} ({s.status === 'open' ? 'مفتوحة' : 'مغلقة'})</span><span>كاش: {fmt(s.closing_cash || s.opening_cash)}</span></div>)}
          </div>
        )}
      </div>
    </div>
  )
}

function QrMenuModal({ shopName, onClose }) {
  const [tableNum, setTableNum] = useState('')
  const base = `${window.location.origin}/?menu=1`
  const menuUrl = tableNum ? `${base}&table=${encodeURIComponent(tableNum)}` : base
  const qrImg = 'https://quickchart.io' + '/qr?size=260&margin=2&text=' + encodeURIComponent(menuUrl)
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-center space-y-4">
        <div className="flex justify-between items-center border-b pb-3"><h3 className="font-extrabold text-base">منيو الباركود والطلب المباشر</h3><button onClick={onClose}><X size={18} /></button></div>
        <div className="text-right">
          <label className="block text-xs font-bold mb-1">رقم الطاولة (اختياري لتخصيص الباركود):</label>
          <input value={tableNum} onChange={(e) => setTableNum(e.target.value)} placeholder="مثلاً: 1 أو 2 أو جلسة 3" className="w-full bg-[#F4F1EA] px-3 py-2 rounded-xl text-xs font-bold outline-none" />
        </div>
        <img src={qrImg} alt="QR Menu" className="mx-auto rounded-xl border p-2 w-52 h-52 object-contain" />
        <p className="text-xs text-[#123B36]/70">يمسح الزبون الباركود في مقهى <b>{shopName}</b> ويطلب مباشرة فتصل الفاتورة للكاشير.</p>
        <div className="flex gap-2">
          <button onClick={() => { navigator.clipboard.writeText(menuUrl); alert('تم نسخ الرابط!') }} className="flex-1 py-2.5 rounded-xl bg-[#F4F1EA] font-bold text-xs">نسخ الرابط</button>
          <a href={menuUrl} target="_blank" rel="noreferrer" className="flex-1 py-2.5 rounded-xl bg-[#123B36] text-white font-bold text-xs">معاينة المنيو</a>
        </div>
      </div>
    </div>
  )
}
     function PublicQrMenu({ items, shopName, currency, showFeedback = true }) {
  const [cart, setCart] = useState([]); const [note, setNote] = useState(''); const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false)
  const [rating, setRating] = useState(5); const [fbComment, setFbComment] = useState(''); const [fbSent, setFbSent] = useState(false)
  const params = new URLSearchParams(window.location.search)
  const tableNum = params.get('table') || 'عام'
  const cats = [...new Set(items.map((i) => i.category).filter(Boolean))]
  const total = cart.reduce((s, l) => s + l.price * l.qty, 0)

  function add(it) {
    setCart((p) => { const idx = p.findIndex((x) => x.id === it.id); if (idx > -1) { const c = [...p]; c[idx].qty += 1; return c } return [...p, { id: it.id, name: it.name, price: Number(it.price), qty: 1 }] })
  }

  async function sendOrder() {
    if (!cart.length || busy) return; setBusy(true)
    try {
      await db.insertShared('table_orders', { table_num: tableNum, lines: cart, total, customer_note: note, status: 'pending' })
      setSent(true); setCart([]); setNote('')
    } finally { setBusy(false) }
  }

  async function sendFeedback(e) {
    e.preventDefault()
    await db.insertShared('feedbacks', { rating, comment: fbComment.trim(), table_num: tableNum })
    setFbSent(true)
  }
       return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#123B36] pb-28" dir="rtl">
      <header className="bg-[#123B36] text-white p-4 text-center sticky top-0 z-20 shadow-md">
        <h1 className="font-extrabold text-xl">{shopName}</h1>
        <p className="text-xs text-amber-200 mt-0.5">منيو الطاولة رقم ({tableNum})</p>
      </header>

      {sent ? (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-3xl text-center space-y-4 shadow-md">
          <CheckCircle2 size={44} className="mx-auto text-emerald-600" />
          <h2 className="font-extrabold text-lg">تم إرسال طلبك للكاشير بنجاح!</h2>
          <p className="text-xs text-[#123B36]/70">سيتم تحضير طلبك وتقديمه لطاولتك حالاً.</p>
          {showFeedback && !fbSent && (
            <form onSubmit={sendFeedback} className="bg-[#F4F1EA] p-4 rounded-2xl space-y-2 text-right">
              <div className="font-extrabold text-xs text-center">قيّم تجربتك معنا ☕</div>
              <div className="flex justify-center gap-2 text-xl">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} onClick={() => setRating(n)} className={n <= rating ? 'opacity-100 scale-110' : 'opacity-30'}>⭐</button>
                ))}
              </div>
              <input value={fbComment} onChange={(e) => setFbComment(e.target.value)} placeholder="اكتب ملاحظتك أو اقتراحك (اختياري)..." className="w-full bg-white p-2 rounded-xl text-xs outline-none" />
              <button type="submit" className="w-full py-2 rounded-xl bg-amber-500 text-[#123B36] font-extrabold text-xs">إرسال التقييم</button>
            </form>
          )}
          {fbSent && <div className="text-xs font-extrabold text-emerald-700">شكراً لتقييمك الجميل! ❤️</div>}
          <button onClick={() => { setSent(false); setFbSent(false) }} className="bg-[#123B36] text-white px-6 py-2.5 rounded-xl text-xs font-bold">طلب أصناف إضافية</button>
        </div>
      ) : (
      <div className="max-w-2xl mx-auto p-4 space-y-5">
          {cats.map((c) => (
            <div key={c} className="space-y-2">
              <h2 className="font-extrabold text-sm text-[#123B36] border-r-4 border-[#123B36] pr-2">{c}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.filter((i) => i.category === c).map((it) => (
                  <div key={it.id} className="bg-white p-3.5 rounded-2xl shadow-xs flex items-center justify-between">
                    <div><div className="font-bold text-sm">{it.name}</div><div className="text-xs font-extrabold text-emerald-800 mt-0.5">{fmt(it.price)} {currency}</div></div>
                    <button onClick={() => add(it)} className="bg-[#123B36] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold">+ أضف</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {cart.length > 0 && !sent && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t p-3 shadow-xl z-30">
          <div className="max-w-2xl mx-auto space-y-2">
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="ملاحظات للباريستا (بدون سكر، ثلج زيادة...)" className="w-full bg-[#F4F1EA] px-3 py-2 rounded-xl text-xs outline-none" />
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold">{cart.reduce((s, l) => s + l.qty, 0)} أصناف • الإجمالي: {fmt(total)} {currency}</div>
              <button onClick={sendOrder} disabled={busy} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-xs font-extrabold">{busy ? 'جاري الإرسال...' : 'إرسال الطلب الآن'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
