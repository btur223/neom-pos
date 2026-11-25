import { useState, useEffect, useMemo, useRef } from 'react'
import { ShoppingCart, Truck, LayoutDashboard, Boxes, SlidersHorizontal, LogOut, Trash2, CheckCircle2, Search, Award, AlertTriangle, Clock, Download, QrCode, X, PauseCircle, PlayCircle, Percent, StickyNote, Coffee, CalendarClock, Store } from 'lucide-react'
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
    const u = auth.getCurrentUser()
    setUser(u)
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

const settings = (settingsList && settingsList.length > 0) ? settingsList.at(0) : { id: 'main', currency: 'ر.ع', ownerPhone: '', shopName: 'نيوم' }
  const savedLocalFeatures = (() => { try { return JSON.parse(localStorage.getItem('neom_features') || 'null') } catch { return null } })()
  const f = { branches: true, barista: true, loyalty: true, qrMenu: true, holdDiscount: true, shifts: true, expiryCredit: true, analytics: true, quickCash: true, feedback: true, coupons: true, ...(settings.features || {}), ...(savedLocalFeatures || {}) }
  const branchesList = settings.branches || ['الفرع الرئيسي - صلالة']
  const [currentBranch, setCurrentBranch] = useState(() => localStorage.getItem('neom_branch') || branchesList.at(0))

  const [lang, setLang] = useState(() => localStorage.getItem('neom_lang') || 'ar')
  const toggleLang = () => {
    const next = lang === 'ar' ? 'en' : 'ar'
    setLang(next)
    localStorage.setItem('neom_lang', next)
  }

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
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `neom-sales-${todayStr()}.csv`
    a.click()
  }

  const up = user?.perms || (isManager
    ? { pos: true, receiving: true, inventory: true, dashboard: true, discount: true, settings: true }
    : { pos: true, receiving: true, inventory: false, dashboard: false, discount: false, settings: false })

  const baseNav = [
    ...((isManager || up.dashboard) ? [{ id: 'dashboard', label: lang === 'en' ? 'Dashboard' : 'الرئيسية والأرباح', icon: LayoutDashboard }] : []),
    ...((isManager || up.pos) ? [{ id: 'sales', label: lang === 'en' ? 'POS' : 'الكاشير', icon: ShoppingCart }] : []),
    ...((f.barista && (isManager || up.pos)) ? [{ id: 'barista', label: lang === 'en' ? 'Barista' : 'الباريستا', icon: Coffee }] : []),
    ...((isManager || up.receiving) ? [{ id: 'materials', label: lang === 'en' ? 'Receiving' : 'استلام الخامات', icon: Truck }] : []),
    ...((isManager || up.inventory) ? [{ id: 'inventory', label: lang === 'en' ? 'Inventory' : 'المخزن والوصفات', icon: Boxes }] : []),
    ...((isManager || up.settings) ? [{ id: 'settings', label: lang === 'en' ? 'Settings' : 'الإعدادات', icon: SlidersHorizontal }] : []),
  ]

 const activeTab = baseNav.some((n) => n.id === tab) ? tab : (baseNav.at(0)?.id || 'sales')

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F1EA] text-[#123B36]" dir={lang === 'en' ? 'ltr' : 'rtl'}>
      <header className="bg-[#123B36] text-[#F6F3EC] px-4 py-3 flex flex-wrap items-center justify-between gap-2 shadow-md">
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
            <button onClick={() => setShowShiftModal(true)} className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${openShift ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' : 'bg-amber-500/20 text-amber-200 border border-amber-400/30'}`}>
              <Clock size={13} /><span>{openShift ? (lang === 'en' ? 'Shift Open' : 'الوردية مفتوحة') : (lang === 'en' ? 'Open Shift' : 'فتح وردية')}</span>
            </button>
          )}
          <button type="button" onClick={toggleLang} className="text-xs bg-amber-400 text-slate-950 px-2.5 py-1 rounded-full font-extrabold hover:bg-amber-300 transition">
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
        </div>
        <nav className="flex items-center gap-1.5 overflow-x-auto">
          {baseNav.map((n) => {
            const Icon = n.icon
            return (
              <button key={n.id} onClick={() => setTab(n.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition ${activeTab === n.id ? 'bg-amber-400 text-slate-950' : 'bg-white/10 hover:bg-white/20'}`}>
                <Icon size={15} /><span>{n.label}</span>
              </button>
            )
          })}
          {f.qrMenu && <button onClick={() => setShowQrModal(true)} title="QR Menu" className="p-2 rounded-xl bg-white/10 hover:bg-white/20"><QrCode size={16} /></button>}
          {isManager && <button onClick={exportInvoicesCsv} title="Export Excel" className="p-2 rounded-xl bg-white/10 hover:bg-white/20"><Download size={16} /></button>}
          <button onClick={() => auth.signOut()} className="p-2 rounded-xl text-red-200 mr-1"><LogOut size={16} /></button>
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
          <div className="flex items-center gap-2 shrink-0">
            {lowStockItems.length > 0 && (
              <button
                onClick={() => {
                  const txt = `🚨 *نواقص المخزن (${settings.shopName || 'نيوم'})*:\n` + lowStockItems.map((x) => `• ${x.name}: المتبقي ${x.stock} ${x.unit || ''}`).join('\n')
                  window.open(`https://wa.me{encodeURIComponent(txt)}`, '_blank')
                }}
                className="bg-white text-red-700 px-2.5 py-1 rounded-full text-[11px] font-extrabold hover:bg-amber-100 transition"
              >
                واتساب النواقص 📲
              </button>
            )}
            {isManager && <button onClick={() => setTab('inventory')} className="underline">عرض المخزن</button>}
          </div>
        </div>
      )}

      <main className="flex-1 p-4 max-w-7xl w-full mx-auto">
        {activeTab === 'sales' && <SalesScreen items={items} recipes={recipes} ingredients={ingredients} invoices={invoices} customers={customers} tableOrders={tableOrders} user={user} currency={settings.currency || 'ر.ع'} shopName={settings.shopName || 'نيوم'} cashierName={user.displayName} currentBranch={currentBranch} showBranch={f.branches} features={f} settings={settings} lang={lang} />}
        {activeTab === 'barista' && f.barista && <BaristaScreen invoices={invoices} currentBranch={currentBranch} showBranch={f.branches} lang={lang} />}
        {activeTab === 'materials' && <MaterialsScreen ingredients={ingredients} shipments={shipments} currency={settings.currency || 'ر.ع'} isManager={isManager} features={f} currentBranch={currentBranch} lang={lang} />}
        {activeTab === 'dashboard' && <DashboardScreen invoices={invoices} ingredients={ingredients} recipes={recipes} shifts={shifts} settings={settings} features={f} currentBranch={currentBranch} lang={lang} />}
        {activeTab === 'inventory' && <InventoryScreen items={items} ingredients={ingredients} recipes={recipes} settings={settings} features={f} isManager={isManager} currency={settings.currency || 'ر.ع'} lang={lang} />}
        {activeTab === 'settings' && <SettingsScreen settings={settings} lang={lang} />}
      </main>

      {showShiftModal && <ShiftModal openShift={openShift} shifts={shifts} invoices={invoices} user={user} currency={settings.currency || 'ر.ع'} onClose={() => setShowShiftModal(false)} />}
      {showQrModal && <QrMenuModal shopName={settings.shopName || 'نيوم'} onClose={() => setShowQrModal(false)} />}
    </div>
  )
}
 function SalesScreen({ items = [], recipes = [], ingredients = [], invoices = [], customers = [], tableOrders = [], user, currency, shopName, cashierName, currentBranch, showBranch, features = {}, settings = {}, lang = 'ar' }) {
  const [cat, setCat] = useState('الكل')
  const [q, setQ] = useState('')
  const [cart, setCart] = useState([])
  const [payMethod, setPayMethod] = useState('نقدي')
  const [splitCash, setSplitCash] = useState('')
  const [cashTendered, setCashTendered] = useState('')
  const [lastReceipt, setLastReceipt] = useState(null)
  const [busy, setBusy] = useState(false)
  const [phone, setPhone] = useState('')
  const [redeemDiscount, setRedeemDiscount] = useState(0)
  const [manualDiscount, setManualDiscount] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [orderNote, setOrderNote] = useState('')
  const [heldOrders, setHeldOrders] = useState([])
  const [activeTableOrder, setActiveTableOrder] = useState(null)
  const [channel, setChannel] = useState('محلي')
  const [commRate, setCommRate] = useState(0)
  const [lastSentCart, setLastSentCart] = useState([])
  const [kotTicket, setKotTicket] = useState(null)

  const [rushActive, setRushActive] = useState(false)
  const [modItem, setModItem] = useState(null)
  const [modSize, setModSize] = useState('وسط')
  const [modMilk, setModMilk] = useState('حليب عادي')
  const [modSugar, setModSugar] = useState('سكر عادي')
  const [modExtraShot, setModExtraShot] = useState(false)

  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [offlineQueue, setOfflineQueue] = useState(() => {
    try { return JSON.parse(localStorage.getItem('neom_offline_invoices') || '[]') } catch { return [] }
  })

  useEffect(() => {
    const goOnline = async () => {
      setIsOnline(true)
      try {
        const queued = JSON.parse(localStorage.getItem('neom_offline_invoices') || '[]')
        if (queued.length > 0) {
          for (const qInv of queued) {
            await db.insertShared('invoices', qInv)
          }
          localStorage.removeItem('neom_offline_invoices')
          setOfflineQueue([])
        }
      } catch {}
    }
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  function printBaristaTicket() {
    const isFirst = lastSentCart.length === 0
    const added = []
    const cancelled = []

    cart.forEach((curr) => {
      const prev = lastSentCart.find((p) => p.cartKey === curr.cartKey)
      if (!prev) added.push({ ...curr })
      else if (curr.qty > prev.qty) added.push({ ...curr, qty: curr.qty - prev.qty })
      else if (curr.qty < prev.qty) cancelled.push({ ...curr, qty: prev.qty - curr.qty })
    })

    lastSentCart.forEach((prev) => {
      if (!cart.find((c) => c.cartKey === prev.cartKey)) cancelled.push({ ...prev })
    })

    const sections = []
    if (isFirst && added.length) {
      sections.push({ labelAr: 'جديد', labelEn: 'New', lines: added })
    } else {
      if (added.length) sections.push({ labelAr: 'إضافة', labelEn: 'Addition', lines: added })
      if (cancelled.length) sections.push({ labelAr: 'ملغي', labelEn: 'Cancelled', lines: cancelled })
    }
    if (!sections.length && cart.length) {
      sections.push({ labelAr: 'جديد', labelEn: 'New', lines: cart })
    }

    const now = new Date()
    setKotTicket({
      date: todayStr(),
      time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      cashier: cashierName || 'Cashier',
      channel,
      note: orderNote,
      sections,
    })
    setLastSentCart(cart.map((c) => ({ ...c })))
    setTimeout(() => {
      window.print()
      setTimeout(() => setKotTicket(null), 800)
    }, 150)
  }

  const pendingOrders = (tableOrders || []).filter((o) => o.status === 'pending')
  const visibleItems = useMemo(() => (items || []).filter((i) => !(features.itemAvailability && i.out_of_stock)), [items, features.itemAvailability])
  const cats = useMemo(() => ['الكل', ...new Set(visibleItems.map((i) => i.category).filter(Boolean))], [visibleItems])
  const filtered = useMemo(() => visibleItems.filter((i) => (cat === 'الكل' || i.category === cat) && (!q || i.name.includes(q) || (i.name_en && i.name_en.toLowerCase().includes(q.toLowerCase())))), [visibleItems, cat, q])
  const cleanPhone = phone.replace(/\D/g, '')
  const customer = useMemo(() => cleanPhone.length >= 8 ? (customers || []).find((c) => c.phone === cleanPhone) : null, [customers, cleanPhone])

  const subTotal = cart.reduce((s, l) => s + l.price * l.qty, 0)
  const extraDiscount = Number(manualDiscount || 0)
  const couponDiscount = appliedCoupon ? (appliedCoupon.type === 'percent' ? (subTotal * Number(appliedCoupon.value)) / 100 : Number(appliedCoupon.value)) : 0
  const totalDiscount = redeemDiscount + extraDiscount + couponDiscount
  const total = Math.max(0, subTotal - totalDiscount)
  const commissionAmount = Number(((total * commRate) / 100).toFixed(3))
  const nextOrderNum = `#${String((invoices || []).filter((inv) => inv.date === todayStr()).length + offlineQueue.length + 1).padStart(2, '0')}`

  function pushToCart(item, modLabel = '', extraPrice = 0) {
    const finalPrice = Number(item.price) + extraPrice
    const finalName = modLabel ? `${item.name} (${modLabel})` : item.name
    const cartKey = `${item.id}_${modLabel}`
    setCart((prev) => {
      const idx = prev.findIndex((x) => (x.cartKey || x.id) === cartKey)
      if (idx > -1) {
        const c = [...prev]
        c[idx].qty += 1
        return c
      }
      return [...prev, { id: item.id, cartKey, baseName: item.name, name: finalName, name_en: item.name_en || '', price: finalPrice, qty: 1 }]
    })
  }

  function handleItemClick(item) {
    const isDrink = ['القهوة الساخنة', 'القهوة الباردة', 'موهيتو', 'سموثي', 'عصائر فريش', 'ميلك شيك', 'المشروبات الساخنة'].includes(item.category)
    if (features.modifiers && !rushActive && isDrink) {
      setModItem(item)
      setModSize('وسط')
      setModMilk('حليب عادي')
      setModSugar('سكر عادي')
      setModExtraShot(false)
    } else {
      pushToCart(item)
    }
  }

  function confirmModifierAdd() {
    if (!modItem) return
    const parts = []
    let extra = 0
    if (modSize === 'كبير') { parts.push('كبير'); extra += 0.300 }
    if (modMilk !== 'حليب عادي') { parts.push(modMilk); extra += 0.300 }
    if (modSugar !== 'سكر عادي') parts.push(modSugar)
    if (modExtraShot) { parts.push('إكسترا شوت'); extra += 0.300 }
    pushToCart(modItem, parts.join('، '), extra)
    setModItem(null)
  }

  function applyCouponCode() {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    const found = (settings?.coupons || []).find((c) => c.code === code && c.active !== false)
    if (!found) return alert(lang === 'en' ? 'Invalid coupon code' : 'كود الخصم غير صحيح أو منتهي')
    setAppliedCoupon(found)
    setCouponInput('')
  }

  function holdCurrentOrder() {
    if (!cart.length) return
    const label = activeTableOrder ? `طاولة ${activeTableOrder.table_num}` : (orderNote || `طلب معلق ${heldOrders.length + 1}`)
    setHeldOrders((prev) => [...prev, { id: Date.now(), label, cart, note: orderNote, discount: manualDiscount }])
    setCart([])
    setLastSentCart([])
    setOrderNote('')
    setManualDiscount('')
    setActiveTableOrder(null)
  }

  function resumeHeldOrder(held) {
    if (cart.length > 0 && !confirm('السلة الحالية تحتوي على أصناف، هل تريد استبدالها بالطلب المعلق؟')) return
    setCart(held.cart)
    setLastSentCart([])
    setOrderNote(held.note || '')
    setManualDiscount(held.discount || '')
    setHeldOrders((prev) => prev.filter((x) => x.id !== held.id))
  }

  async function checkout() {
    if (!cart.length || busy) return
    setBusy(true)
    try {
      const splitNote = payMethod === 'مزدوج' ? ` [دفع مزدوج: نقدي ${fmt(splitCash)} + بطاقة ${fmt(Math.max(0, total - Number(splitCash || 0)))}]` : ''
      const invoicePayload = {
        date: todayStr(),
        number: nextOrderNum,
        total,
        discount: totalDiscount,
        note: (orderNote.trim() + splitNote).trim() || null,
        amountPaid: total,
        paymentMethod: payMethod === 'مزدوج' ? 'نقدي' : payMethod,
        lines: cart,
        cashierId: user.id,
        cashierName: user.displayName,
        customerPhone: cleanPhone || null,
        stockDeducted: true,
        branch: currentBranch || 'الفرع الرئيسي',
        channel,
        commission: commissionAmount,
      }

      let inv = invoicePayload
      if (!isOnline && features.offlineMode) {
        const nextQ = [...offlineQueue, invoicePayload]
        setOfflineQueue(nextQ)
        localStorage.setItem('neom_offline_invoices', JSON.stringify(nextQ))
      } else {
        inv = await db.insertShared('invoices', invoicePayload)
        for (const line of cart) {
          const itemNameForRec = line.baseName || line.name
          const rec = recipes.find((r) => r.itemId === line.id || r.itemName === itemNameForRec)
          if (rec && rec.lines) {
            for (const rl of rec.lines) {
              const ing = ingredients.find((x) => x.id === rl.ingredientId || x.name === rl.name)
              if (ing) await db.incrementShared('ingredients', ing.id, 'stock', -(Number(rl.qty) * line.qty))
            }
          }
        }
        if (features.auditTrail && totalDiscount > 0) {
          await db.insertShared('audit_logs', {
            action: `خصم يدوي (${fmt(totalDiscount)} ${currency})`,
            user_name: user.displayName,
            details: `فاتورة ${nextOrderNum} - الإجمالي ${fmt(total)} ${currency}`,
            created_at: new Date().toISOString(),
          })
        }
      }
   const earnedPts = Math.floor(total * 10)
      const cupsCount = cart.reduce((s, l) => s + Number(l.qty || 1), 0)
      if (cleanPhone.length >= 8 && isOnline) {
        if (customer) {
          const nextPts = Math.max(0, Number(customer.points || 0) - (redeemDiscount > 0 ? 50 : 0) + earnedPts)
          const nextStamps = ((Number(customer.stamps || 0) + cupsCount) % 8)
          await db.updateShared('customers', customer.id, {
            points: nextPts,
            stamps: nextStamps,
            total_spent: Number(customer.total_spent || 0) + total,
            visits: Number(customer.visits || 0) + 1
          })
        } else {
          await db.insertShared('customers', { phone: cleanPhone, points: earnedPts, stamps: cupsCount % 8, total_spent: total, visits: 1 })
        }
      }
      if (activeTableOrder && isOnline) {
        await db.updateShared('table_orders', activeTableOrder.id, { status: 'completed' })
        setActiveTableOrder(null)
      }
      setLastReceipt({ ...inv, lines: cart, phone: cleanPhone, earnedPts, note: orderNote, discount: totalDiscount })
      setCart([])
      setLastSentCart([])
      setRedeemDiscount(0)
      setManualDiscount('')
      setAppliedCoupon(null)
      setOrderNote('')
      setPhone('')
      setSplitCash('')
      setCashTendered('')
    } finally {
      setBusy(false)
    }
  }

  function sendWhatsApp(rec) {
    const linesTxt = rec.lines.map((l) => `- ${l.name} × ${l.qty} = ${fmt(l.price * l.qty)} ${currency}`).join('\n')
    const msg = `مرحباً بك في مقهى *${shopName || 'نيوم'}* ☕\nرقم الطلب: *${rec.number}*\nالتاريخ: ${rec.date}\n\n${linesTxt}\n${rec.discount > 0 ? `\nالخصم: -${fmt(rec.discount)} ${currency}` : ''}\n*الإجمالي: ${fmt(rec.total)} ${currency}*\n${rec.earnedPts ? `نقاط الولاء المكتسبة: +${rec.earnedPts} نقطة ⭐\n` : ''}شكراً لزيارتكم!`
    const target = rec.phone ? (rec.phone.startsWith('968') ? rec.phone : `968${rec.phone}`) : ''
    window.open('https://wa.me' + target + '?text=' + encodeURIComponent(msg), '_blank')
  }   
const [nowTick, setNowTick] = useState(Date.now())
  const prevPendingRef = useRef(pendingOrders.length)
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 15000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (pendingOrders.length > prevPendingRef.current) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = 880
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.5)
      } catch {}
    }
    prevPendingRef.current = pendingOrders.length
  }, [pendingOrders.length])
 return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-2.5">
        {features.offlineMode && (!isOnline || offlineQueue.length > 0) && (
          <div className={`p-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-between ${!isOnline ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-900 border border-amber-300'}`}>
            <span>{!isOnline ? '📡 وضع العمل بدون إنترنت: يتم حفظ الفواتير محلياً وستُرفع تلقائياً عند عودة الشبكة' : `⏳ جاري مزامنة (${offlineQueue.length}) فاتورة معلقة...`}</span>
            <span className="bg-black/20 px-2.5 py-0.5 rounded-full">{offlineQueue.length}</span>
          </div>
        )}

        {pendingOrders.length > 0 && (
          <div className="bg-amber-50 border-2 border-amber-400 p-3 rounded-2xl space-y-2">
            <div className="font-extrabold text-xs text-amber-900">🔔 طلبات جديدة من الطاولات ({pendingOrders.length})</div>
            <div className="flex flex-wrap gap-2">
              {pendingOrders.map((ord) => (
                <div key={ord.id} className="bg-white border border-amber-300 p-2.5 rounded-xl text-xs flex items-center gap-3 shadow-sm">
                  <div>
                    <div className="font-extrabold text-[#123B36] flex items-center gap-2">
                      <span>طاولة {ord.table_num} • {fmt(ord.total)} {currency}</span>
                      {ord.created_at && (() => {
                        const mins = Math.max(0, Math.floor((nowTick - new Date(ord.created_at).getTime()) / 60000))
                        return (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${mins >= 4 ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-600/20 text-emerald-700'}`}>
                            ⏱ {mins} د
                          </span>
                        )
                      })()}
                    </div>
                    <div className="text-[11px] text-[#123B36]/70">{(ord.lines || []).map((l) => `${l.name}×${l.qty}`).join('، ')}</div>
                    {ord.customer_note && <div className="text-[10px] text-amber-700 font-bold">ملاحظة: {ord.customer_note}</div>}
                  </div>
                  <button onClick={() => { setCart(ord.lines || []); setLastSentCart([]); setOrderNote(ord.customer_note || `طاولة ${ord.table_num}`); setActiveTableOrder(ord) }} className="bg-[#123B36] text-white px-3 py-1.5 rounded-lg font-bold">اعتماد</button>
                  <button onClick={() => db.updateShared('table_orders', ord.id, { status: 'cancelled' })} className="text-red-500 font-bold px-1">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {heldOrders.length > 0 && features.holdDiscount !== false && (
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

        <div className="flex flex-wrap gap-2 items-center bg-white p-2.5 rounded-2xl shadow-sm">
          <div className="relative flex-1 min-w-[160px]">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#123B36]/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={lang === 'en' ? 'Quick search...' : 'بحث سريع...'} className="w-full pr-8 pl-3 py-1.5 rounded-xl bg-[#F4F1EA] text-xs outline-none" />
          </div>
          {features.rushMode && (
            <button
              type="button"
              onClick={() => setRushActive(!rushActive)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1 ${rushActive ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-100 text-amber-900'}`}
            >
              ⚡ {rushActive ? (lang === 'en' ? 'Rush ON' : 'الازدحام مُفعّل') : (lang === 'en' ? 'Rush Mode' : 'وضع الازدحام')}
            </button>
          )}
          <div className="flex gap-1 overflow-x-auto pb-0.5 w-full">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap ${cat === c ? 'bg-[#123B36] text-white' : 'bg-[#F4F1EA]'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? <div className="bg-white p-8 rounded-2xl text-center text-sm text-[#123B36]/60">لا توجد أصناف بعد.</div> : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5">
            {filtered.map((item) => (
              <button key={item.id} onClick={() => handleItemClick(item)} className="bg-white p-2 rounded-xl shadow-xs border border-[#123B36]/10 text-right flex flex-col justify-between hover:border-[#123B36]/40 transition min-h-[66px]">
                <div>
                  <span className="font-bold text-xs leading-tight block line-clamp-2">{lang === 'en' && item.name_en ? item.name_en : item.name}</span>
                  {item.name_en && <span className="text-[10px] text-[#123B36]/55 block truncate">{lang === 'en' ? item.name : item.name_en}</span>}
                </div>
                <span className="text-[11px] font-extrabold text-amber-700 mt-1">{fmt(item.price)} {currency}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-md border border-[#123B36]/10 flex flex-col justify-between h-fit sticky top-20">
        <div>
          <div className="flex items-center justify-between border-b pb-2.5 mb-2.5">
            <h2 className="font-extrabold text-base">{lang === 'en' ? 'Current Order' : 'الطلب الحالي'}</h2>
            <div className="flex items-center gap-1.5">
              {cart.length > 0 && features.holdDiscount !== false && <button onClick={holdCurrentOrder} title="تعليق الطلب" className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1"><PauseCircle size={13} /> {lang === 'en' ? 'Hold' : 'تعليق'}</button>}
              <span className="bg-[#123B36] text-white text-xs font-bold px-2.5 py-1 rounded-lg">{nextOrderNum}</span>
            </div>
          </div>

          {(features.loyalty !== false || features.stamps) && (
            <div className="mb-2.5 bg-[#F4F1EA] p-2 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2"><Award size={15} className="text-amber-600" /><input value={phone} onChange={(e) => { setPhone(e.target.value); setRedeemDiscount(0) }} placeholder={lang === 'en' ? 'Customer phone (optional)' : 'جوال العميل للولاء والطوابع...'} className="bg-transparent text-xs w-full outline-none font-bold" /></div>
              {customer && (
                <div className="space-y-1 text-[11px] pt-1 border-t border-[#123B36]/10">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700">النقاط: {customer.points || 0} ⭐</span>
                    {features.stamps && <span className="font-extrabold text-amber-800">🎟️ الطوابع: {customer.stamps || 0} / 7</span>}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Number(customer.points) >= 50 && (
                      <button onClick={() => setRedeemDiscount(redeemDiscount > 0 ? 0 : 0.5)} className={`px-2 py-0.5 rounded font-bold ${redeemDiscount > 0 ? 'bg-amber-600 text-white' : 'bg-white text-amber-700'}`}>
                        {redeemDiscount > 0 ? 'إلغاء الخصم' : 'استبدال 50 نقطة (-0.500)'}
                      </button>
                    )}
                    {features.stamps && Number(customer.stamps || 0) >= 7 && (
                      <button onClick={() => setRedeemDiscount(redeemDiscount > 0 ? 0 : 1.5)} className="px-2 py-0.5 rounded font-bold bg-emerald-600 text-white">
                        🎁 صرف مشروب مجاني (-1.500)
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {cart.length === 0 ? <p className="text-center text-xs text-[#123B36]/50 py-6">{lang === 'en' ? 'Tap items to add' : 'اضغط على الأصناف لإضافتها'}</p> : (
            <div className="space-y-1.5 max-h-52 overflow-y-auto mb-2.5">
              {cart.map((l, idx) => (
                <div key={l.cartKey || l.id} className="flex items-center justify-between bg-[#F4F1EA] p-2 rounded-xl text-xs">
                  <div>
                    <div className="font-bold">{lang === 'en' && l.name_en ? l.name_en : l.name}</div>
                    <div className="text-[#123B36]/60">{fmt(l.price)} × {l.qty}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCart((p) => p.map((x, i) => i === idx ? { ...x, qty: Math.max(1, x.qty - 1) } : x))} className="w-6 h-6 bg-white rounded-lg font-bold">-</button>
                    <span className="font-bold w-4 text-center">{l.qty}</span>
                    <button onClick={() => setCart((p) => p.map((x, i) => i === idx ? { ...x, qty: x.qty + 1 } : x))} className="w-6 h-6 bg-white rounded-lg font-bold">+</button>
                    <button onClick={() => setCart((p) => p.filter((_, i) => i !== idx))} className="text-red-600 p-1"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && !rushActive && features.holdDiscount !== false && (
            <div className="space-y-1.5 mb-2.5">
              <div className="grid grid-cols-2 gap-1.5">
                <div className="relative">
                  <StickyNote size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#123B36]/40" />
                  <input value={orderNote} onChange={(e) => setOrderNote(e.target.value)} placeholder={lang === 'en' ? 'Note...' : 'ملاحظة...'} className="w-full bg-[#F4F1EA] pr-7 pl-2 py-1.5 rounded-xl text-[11px] outline-none" />
                </div>
                <div className="relative">
                  <Percent size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#123B36]/40" />
                  <input type="number" step="0.050" min="0" value={manualDiscount} onChange={(e) => setManualDiscount(e.target.value)} placeholder={lang === 'en' ? `Discount` : `خصم (${currency})`} className="w-full bg-[#F4F1EA] pr-7 pl-2 py-1.5 rounded-xl text-[11px] outline-none font-bold" />
                </div>
              </div>
              {features.coupons && (
                <div className="flex gap-1.5">
                  <input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder={lang === 'en' ? 'Promo code...' : 'كود خصم ترويجي...'} className="flex-1 bg-[#F4F1EA] px-2.5 py-1 rounded-xl text-[11px] outline-none uppercase font-bold" />
                  <button type="button" onClick={applyCouponCode} className="bg-[#123B36] text-white px-2.5 py-1 rounded-xl text-[11px] font-bold">{lang === 'en' ? 'Apply' : 'تطبيق'}</button>
                  {appliedCoupon && <button type="button" onClick={() => setAppliedCoupon(null)} className="text-red-600 text-[11px] font-bold px-1">✕</button>}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t pt-2.5 space-y-2">
          <div className="flex flex-wrap gap-1">
            {[
              { name: 'محلي', rate: 0 },
              { name: 'سفري', rate: 0 },
              { name: 'طلبات', rate: 25 },
              { name: 'تم', rate: 20 },
              { name: 'توصيل خاص', rate: 0 },
            ].map((ch) => (
              <button
                key={ch.name}
                type="button"
                onClick={() => { setChannel(ch.name); setCommRate(ch.rate) }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border transition ${channel === ch.name ? 'bg-amber-400 text-slate-950 border-amber-400' : 'bg-[#F4F1EA] border-[#123B36]/10 opacity-75'}`}
              >
                {ch.name}{ch.rate > 0 ? ` (${ch.rate}%)` : ''}
              </button>
            ))}
          </div>

          <div className="flex gap-1">
            {['نقدي', 'بطاقة', 'تحويل', ...(features.splitPay ? ['مزدوج'] : [])].map((m) => (
              <button key={m} onClick={() => setPayMethod(m)} className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold border ${payMethod === m ? 'bg-amber-400 text-slate-950 border-amber-400' : 'bg-[#F4F1EA] border-[#123B36]/10 opacity-75'}`}>
                {lang === 'en' ? (m === 'نقدي' ? 'Cash' : m === 'بطاقة' ? 'Card' : m === 'تحويل' ? 'Transfer' : 'Split') : m}
              </button>
            ))}
          </div>

          {payMethod === 'مزدوج' && features.splitPay && (
            <div className="bg-amber-50 border border-amber-200 p-2 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold">المدفوع نقداً:</span>
                <input type="number" step="0.001" value={splitCash} onChange={(e) => setSplitCash(e.target.value)} placeholder="0.000" className="w-24 bg-white px-2 py-1 rounded-lg border font-extrabold text-center" />
              </div>
              <div className="flex justify-between font-extrabold text-emerald-800">
                <span>المتبقي بالبطاقة:</span>
                <span>{fmt(Math.max(0, total - Number(splitCash || 0)))} {currency}</span>
              </div>
            </div>
          )}
{payMethod === 'نقدي' && features.quickCash && total > 0 && (
            <div className="bg-[#F4F1EA] p-2 rounded-xl text-[11px] space-y-1">
              <div className="flex items-center gap-1">
                {Array.of(1, 5, 10, 20).map((v) => (
                  <button key={v} type="button" onClick={() => setCashTendered(String(v))} className="flex-1 bg-white py-1 rounded-lg font-extrabold border border-[#123B36]/15">
                    {v}
                  </button>
                ))}
              </div>
              {Number(cashTendered) >= total && (
                <div className="flex justify-between font-extrabold text-emerald-700 pt-0.5">
                  <span>المتبقي للزبون (الباقي):</span>
                  <span>{fmt(Number(cashTendered) - total)} {currency}</span>
                </div>
              )}
            </div>
          )}

          {totalDiscount > 0 && (
            <div className="flex justify-between text-xs font-bold text-red-600">
              <span>{lang === 'en' ? 'Discount:' : 'إجمالي الخصم:'}</span>
              <span>-{fmt(totalDiscount)} {currency}</span>
            </div>
          )}

          <div className="flex justify-between font-extrabold text-lg">
            <span>{lang === 'en' ? 'Total:' : 'الإجمالي:'}</span>
            <span>{fmt(total)} {currency}</span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => printBaristaTicket()}
              disabled={!cart.length && !lastSentCart.length}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#123B36] font-extrabold text-xs shadow-sm disabled:opacity-40"
            >
              {lang === 'en' ? 'Barista KOT' : 'تذكرة باريستا'}
            </button>
            <button onClick={checkout} disabled={!cart.length || busy} className="flex-[1.4] py-2.5 rounded-xl bg-[#123B36] hover:bg-[#123B36]/90 text-white font-extrabold text-sm disabled:opacity-40">
              {busy ? '...' : (lang === 'en' ? 'Complete Sale' : 'إتمام البيع')}
            </button>
          </div>
        </div>

        {kotTicket && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-2 print:block">
            <div className="font-extrabold text-center border-b pb-1">{shopName || 'NEOM'} - BARISTA KOT</div>
            <div className="text-[11px] flex justify-between"><span>{kotTicket.date} | {kotTicket.time}</span><span>{kotTicket.channel}</span></div>
            <div className="text-[11px]">Cashier: {kotTicket.cashier}</div>
            {kotTicket.sections.map((sec, sIdx) => (
              <div key={sIdx} className="border-t pt-1">
                <div className="font-extrabold text-amber-800">{sec.labelAr} / {sec.labelEn}</div>
                {sec.lines.map((l, idx) => (
                  <div key={idx} className="flex justify-between font-bold">
                    <span>{l.name_en || l.name} {l.name_en ? `(${l.name})` : ''}</span>
                    <span>x{l.qty}</span>
                  </div>
                ))}
              </div>
            ))}
            {kotTicket.note && <div className="font-bold text-red-700 border-t pt-1">Note: {kotTicket.note}</div>}
          </div>
        )}

        {lastReceipt && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between font-extrabold text-emerald-800">
              <span>✓ تم إصدار الفاتورة {lastReceipt.number}</span>
              <button onClick={() => setLastReceipt(null)} className="text-[#123B36]/50">✕</button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="flex-1 bg-white border py-1.5 rounded-lg font-bold">طباعة الإيصال</button>
              <button onClick={() => sendWhatsApp(lastReceipt)} className="flex-1 bg-emerald-600 text-white py-1.5 rounded-lg font-bold">واتساب</button>
            </div>
          </div>
        )}
      </div>

      {modItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-3 shadow-xl text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-sm text-[#123B36]">{modItem.name}</h3>
              <button onClick={() => setModItem(null)} className="text-gray-400 font-bold text-base">✕</button>
            </div>
            <div>
              <label className="font-bold block mb-1">الحجم:</label>
              <div className="flex gap-1.5">
                {['وسط', 'كبير'].map((sz) => (
                  <button key={sz} type="button" onClick={() => setModSize(sz)} className={`flex-1 py-2 rounded-xl font-extrabold border ${modSize === sz ? 'bg-[#123B36] text-white' : 'bg-[#F4F1EA]'}`}>
                    {sz}{sz === 'كبير' ? ' (+0.300)' : ''}
                  </button>
                ))}
             <div>
              <label className="font-bold block mb-1">نوع الحليب:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['حليب عادي', 'حليب شوفان', 'حليب لوز'].map((mk) => (
                  <button key={mk} type="button" onClick={() => setModMilk(mk)} className={`py-2 rounded-xl font-extrabold border text-[11px] ${modMilk === mk ? 'bg-[#123B36] text-white' : 'bg-[#F4F1EA]'}`}>
                    {mk}{mk !== 'حليب عادي' ? ' (+0.3)' : ''}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-bold block mb-1">مستوى السكر:</label>
              <div className="grid grid-cols-4 gap-1">
                {['بدون سكر', 'سكر خفيف', 'سكر عادي', 'سكر زيادة'].map((sg) => (
                  <button key={sg} type="button" onClick={() => setModSugar(sg)} className={`py-1.5 rounded-xl font-bold border text-[10px] ${modSugar === sg ? 'bg-amber-500 text-white' : 'bg-[#F4F1EA]'}`}>
                    {sg.replace('سكر ', '')}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 bg-[#F4F1EA] p-2.5 rounded-xl font-extrabold cursor-pointer">
              <input type="checkbox" checked={modExtraShot} onChange={(e) => setModExtraShot(e.target.checked)} />
              <span>إضافة إكسترا شوت اسبريسو (+0.300 {currency})</span>
            </label>
            <button onClick={confirmModifierAdd} className="w-full py-3 rounded-xl bg-emerald-700 text-white font-extrabold text-sm">
              إضافة للطلب
            </button>
          </div>
        </div>
      )}
    </div>
 )
}

function BaristaScreen({ invoices = [], currentBranch, showBranch, lang = 'ar' }) {
  const [doneIds, setDoneIds] = useState([])
  const todayOrders = invoices.filter((i) => i.date === todayStr() && !doneIds.includes(i.id) && (!showBranch || !i.branch || i.branch === currentBranch))
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm">
        <h2 className="font-extrabold text-base flex items-center gap-2">
          <Coffee size={18} className="text-amber-600" /> {lang === 'en' ? `Barista Queue (${todayOrders.length})` : `شاشة تحضير الباريستا (${todayOrders.length})`}
        </h2>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">{lang === 'en' ? 'Live Sync' : 'تحديث فوري'}</span>
      </div>
      {todayOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center text-sm font-bold text-[#123B36]/50">
          {lang === 'en' ? 'No pending orders right now ☕' : 'لا توجد طلبات قيد التحضير حالياً ☕'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {todayOrders.map((inv) => (
            <div key={inv.id} className="bg-white p-4 rounded-2xl shadow-sm border-2 border-[#123B36]/15 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between border-b pb-2 mb-2">
                  <span className="font-extrabold text-base text-[#123B36]">{lang === 'en' ? `Order ${inv.number}` : `طلب ${inv.number}`}</span>
                  <span className="text-[11px] bg-[#F4F1EA] px-2.5 py-0.5 rounded-full font-bold">{inv.cashierName || (lang === 'en' ? 'Cashier' : 'كاشير')}</span>
                </div>
                <div className="space-y-1.5">
                  {(inv.lines || []).map((l, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm font-bold bg-[#F4F1EA] px-3 py-1.5 rounded-xl">
                      <span>{lang === 'en' && l.name_en ? l.name_en : l.name}</span>
                      <span className="bg-[#123B36] text-white text-xs px-2 py-0.5 rounded-lg">× {l.qty}</span>
                    </div>
                  ))}
                </div>
                {inv.note && <div className="mt-2 text-xs font-bold text-amber-800 bg-amber-50 p-2 rounded-xl">📝 {inv.note}</div>}
              </div>
              <button onClick={() => setDoneIds((p) => [...p, inv.id])} className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5">
                <CheckCircle2 size={15} /> {lang === 'en' ? 'Mark Ready & Served' : 'تم التحضير والتسليم'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
          function MaterialsScreen({ ingredients, shipments = [], currency, isManager, features = {}, currentBranch = 'الفرع الرئيسي - صلالة', lang = 'ar' }) {
  const [material, setMaterial] = useState('')
  const [qty, setQty] = useState('')
  const [unit, setUnit] = useState('كيلو')
  const [price, setPrice] = useState('')
  const [supplier, setSupplier] = useState('')
  const [payStatus, setPayStatus] = useState('مدفوع')
  const [expiryDate, setExpiryDate] = useState('')
  const [done, setDone] = useState(false)
  const [priceAlert, setPriceAlert] = useState(null)

  async function handleSave(e) {
    e.preventDefault()
    if (!material || !qty) return
    const numQty = Number(qty)
    const baseQty = numQty * ((unit === 'كيلو' || unit === 'لتر') ? 1000 : 1)
    const baseUnit = unit === 'كيلو' ? 'جم' : unit === 'لتر' ? 'مل' : unit
    const totalCost = Number(price || 0)
    const unitCost = baseQty > 0 ? totalCost / baseQty : 0

    const existing = ingredients.find((i) => i.name.trim() === material.trim())
    const prevCost = existing ? Number(existing.cost || 0) : 0
    let changePct = 0

    if (existing && unitCost > 0 && prevCost > 0 && Math.abs(unitCost - prevCost) > 0.00001) {
      changePct = Math.round(((unitCost - prevCost) / prevCost) * 100)
      setPriceAlert({ name: material.trim(), oldCost: prevCost, newCost: unitCost, pct: changePct, unit: existing.unit || baseUnit })
    } else {
      setPriceAlert(null)
    }

    await db.insertShared('shipments', {
      date: todayStr(),
      material: material.trim(),
      supplier: supplier.trim(),
      qty: numQty,
      unit,
      price: totalCost,
      total: totalCost,
      unit_cost: unitCost,
      prev_cost: prevCost,
      price_change_pct: changePct,
      pay_status: payStatus,
      expiry_date: expiryDate || null,
      branch: currentBranch
    })

    if (existing) {
      await db.incrementShared('ingredients', existing.id, 'stock', baseQty)
      if (unitCost > 0) {
        await db.updateShared('ingredients', existing.id, {
          cost: unitCost,
          ...(prevCost > 0 && Math.abs(unitCost - prevCost) > 0.00001 ? { prev_cost: prevCost } : {})
        })
      }
    } else {
      await db.insertShared('ingredients', { name: material.trim(), unit: baseUnit, stock: baseQty, cost: unitCost, prev_cost: 0, minStock: 500 })
    }
    setMaterial(''); setQty(''); setPrice(''); setSupplier(''); setExpiryDate(''); setDone(true)
    setTimeout(() => setDone(false), 4000)
  }

  const totalPurchases = shipments.reduce((s, x) => s + Number(x.total || x.price || 0), 0)
  const unpaidTotal = shipments.filter((x) => x.pay_status === 'آجل').reduce((s, x) => s + Number(x.total || x.price || 0), 0)

  return (
    <div className="space-y-4">
      <form onSubmit={handleSave} className="bg-white p-5 rounded-2xl shadow-sm space-y-3">
        <h2 className="font-extrabold text-base">{lang === 'en' ? 'Receive Raw Materials & Supplier Invoices' : 'تسجيل استلام خامات وفواتير الموردين'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold block mb-1">{lang === 'en' ? 'Material Name *' : 'اسم المادة *'}</label>
            <input list="ing-list" value={material} onChange={(e) => setMaterial(e.target.value)} required className="w-full p-3 rounded-xl bg-[#F4F1EA] text-sm outline-none" />
            <datalist id="ing-list">{ingredients.map((i) => <option key={i.id} value={i.name} />)}</datalist>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">{lang === 'en' ? 'Supplier Name' : 'اسم المورد'}</label>
            <input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder={lang === 'en' ? 'Optional...' : 'اختياري...'} className="w-full p-3 rounded-xl bg-[#F4F1EA] text-sm outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold block mb-1">{lang === 'en' ? 'Quantity *' : 'الكمية *'}</label>
            <input type="number" step="any" value={qty} onChange={(e) => setQty(e.target.value)} required className="w-full p-3 rounded-xl bg-[#F4F1EA] text-sm outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">{lang === 'en' ? 'Unit' : 'الوحدة'}</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full p-3 rounded-xl bg-[#F4F1EA] text-sm font-bold">
              <option value="كيلو">{lang === 'en' ? 'Kg (Grams)' : 'كيلو (جرام)'}</option>
              <option value="جم">{lang === 'en' ? 'Gram' : 'جرام'}</option>
              <option value="لتر">{lang === 'en' ? 'Liter (ml)' : 'لتر (مل)'}</option>
              <option value="مل">{lang === 'en' ? 'ml' : 'مل'}</option>
              <option value="حبة">{lang === 'en' ? 'Piece' : 'حبة'}</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold block mb-1">{lang === 'en' ? `Total Price (${currency})` : `السعر الإجمالي (${currency})`}</label>
            <input type="number" step="any" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-3 rounded-xl bg-[#F4F1EA] text-sm outline-none" />
          </div>
        </div>
        {features.expiryCredit && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold block mb-1">{lang === 'en' ? 'Supplier Payment Status' : 'حالة الدفع للمورد'}</label>
              <select value={payStatus} onChange={(e) => setPayStatus(e.target.value)} className="w-full p-3 rounded-xl bg-[#F4F1EA] text-sm font-bold outline-none">
                <option value="مدفوع">{lang === 'en' ? 'Paid (Cash/Transfer)' : 'مدفوع (كاش/تحويل)'}</option>
                <option value="آجل">{lang === 'en' ? 'Credit (Unpaid)' : 'آجل (ذمم للمورد)'}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">{lang === 'en' ? 'Expiry Date' : 'تاريخ انتهاء الصلاحية'}</label>
              <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full p-3 rounded-xl bg-[#F4F1EA] text-sm outline-none" />
            </div>
          </div>
        )}
        {priceAlert && (
          <div className={`text-xs font-extrabold p-3 rounded-xl ${priceAlert.pct > 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            {priceAlert.pct > 0
              ? `⚠️ تنبيه ارتفاع سعر (${priceAlert.name}): ارتفع بنسبة +${priceAlert.pct}% (من ${priceAlert.oldCost.toFixed(4)} إلى ${priceAlert.newCost.toFixed(4)} ${currency}/${priceAlert.unit}) وتم تحديث هامش الربح تلقائياً!`
              : `📉 انخفاض سعر (${priceAlert.name}): انخفض بنسبة ${priceAlert.pct}% (من ${priceAlert.oldCost.toFixed(4)} إلى ${priceAlert.newCost.toFixed(4)} ${currency}/${priceAlert.unit}) وارتفع هامش الربح!`}
          </div>
        )}
        {done && <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl">{lang === 'en' ? '✓ Saved and inventory updated!' : '✓ تم الحفظ وتحديث المخزون والأسعار!'}</div>}
        <button type="submit" className="w-full py-3 rounded-xl bg-[#123B36] text-white font-extrabold text-sm">{lang === 'en' ? 'Save & Update Stock' : 'حفظ وتحديث المخزون'}</button>
      </form>

      {shipments.length > 0 && (
        <div className="bg-white p-5 rounded-2xl shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-extrabold text-sm">{lang === 'en' ? `Purchases & Supplier Credit (${shipments.length})` : `سجل المشتريات وذمم الموردين (${shipments.length})`}</h3>
            {isManager && (
              <div className="flex gap-3 text-xs font-extrabold">
                <span>{lang === 'en' ? 'Purchases:' : 'المشتريات:'} {fmt(totalPurchases)} {currency}</span>
                {features.expiryCredit && unpaidTotal > 0 && <span className="text-red-600">{lang === 'en' ? 'Unpaid Credit:' : 'ديون الموردين:'} {fmt(unpaidTotal)} {currency}</span>}
              </div>
            )}
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {shipments.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 bg-[#F4F1EA] p-3 rounded-xl text-xs">
                <div>
                  <div className="font-extrabold flex flex-wrap items-center gap-2">
                    <span>{s.material} ({s.qty} {s.unit || ''})</span>
                    {features.expiryCredit && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${s.pay_status === 'آجل' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {s.pay_status === 'آجل' ? (lang === 'en' ? 'Credit' : 'آجل') : (lang === 'en' ? 'Paid' : 'مدفوع')}
                      </span>
                    )}
                    {Number(s.price_change_pct) !== 0 && !isNaN(Number(s.price_change_pct)) && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${Number(s.price_change_pct) > 0 ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                        {Number(s.price_change_pct) > 0 ? `↑ ارتفع +${s.price_change_pct}%` : `↓ انخفض ${s.price_change_pct}%`}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#123B36]/60">{s.date} {s.supplier ? `• ${s.supplier}` : ''} {s.expiry_date ? `• ${lang === 'en' ? 'Exp:' : 'ينتهي:'} ${s.expiry_date}` : ''}</div>
                </div>
                <div className="flex items-center gap-2">
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-5 max-w-md w-full space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-extrabold text-base">{openShift ? 'إغلاق الوردية ومطابقة الصندوق' : 'فتح وردية جديدة'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5"><X size={18} /></button>
        </div>

        {openShift ? (
          <div className="space-y-3 text-xs">
            <div className="bg-[#F4F1EA] p-3 rounded-xl space-y-1.5 font-bold">
              <div className="flex justify-between"><span>الرصيد الافتتاحي:</span><span>{fmt(openShift.opening_cash)} {currency}</span></div>
              <div className="flex justify-between"><span>مبيعات الكاش اليوم:</span><span>{fmt(cashSales)} {currency}</span></div>
              <div className="flex justify-between"><span>مبيعات البطاقة/التحويل:</span><span>{fmt(cardSales)} {currency}</span></div>
              <div className="flex justify-between"><span>إجمالي مبيعات اليوم ({todayInvoices.length} فاتورة):</span><span>{fmt(cashSales + cardSales)} {currency}</span></div>
              <div className="flex justify-between text-sm font-extrabold text-[#123B36] border-t pt-1.5"><span>الكاش المتوقع بالدرج:</span><span>{fmt(Number(openShift.opening_cash || 0) + cashSales)} {currency}</span></div>
            </div>

            <div>
              <label className="font-bold block mb-1">الكاش الفعلي المعدود في الدرج ({currency})</label>
              <input type="number" step="0.001" value={cashInput} onChange={(e) => setCashInput(e.target.value)} placeholder="0.000" className="w-full bg-[#F4F1EA] px-3 py-2 rounded-xl font-extrabold outline-none" />
              {cashInput !== '' && (() => {
                const diff = Number(cashInput) - (Number(openShift.opening_cash || 0) + cashSales)
                return (
                  <div className={`mt-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-lg ${diff === 0 ? 'bg-emerald-500/15 text-emerald-700' : diff > 0 ? 'bg-amber-500/15 text-amber-800' : 'bg-red-500/15 text-red-700'}`}>
                    {diff === 0 ? '✓ الصندوق مطابق تماماً (0.000)' : diff > 0 ? `زيادة في الصندوق: +${fmt(diff)} ${currency}` : `عجز في الصندوق: ${fmt(diff)} ${currency}`}
                  </div>
                )
              })()}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const exp = Number(openShift.opening_cash || 0) + cashSales
                  const act = Number(cashInput || 0)
                  const diff = act - exp
                  const msg = `📊 *تقرير إغلاق الوردية (Z-Report)*\n• التاريخ: ${todayStr()}\n• الكاشير: ${openShift.cashier_name || user?.displayName || '-'}\n• عدد الفواتير: ${todayInvoices.length}\n• الرصيد الافتتاحي: ${fmt(openShift.opening_cash)} ${currency}\n• مبيعات الكاش: ${fmt(cashSales)} ${currency}\n• مبيعات الشبكة: ${fmt(cardSales)} ${currency}\n• الكاش المتوقع: ${fmt(exp)} ${currency}\n• الكاش الفعلي: ${fmt(act)} ${currency}\n• الفرق: ${diff >= 0 ? '+' : ''}${fmt(diff)} ${currency}`
                  window.open(`https://wa.me{encodeURIComponent(msg)}`, '_blank')
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-extrabold"
              >
                إرسال التقرير واتساب 📲
              </button>
              <button onClick={handleClose} className="flex-1 py-3 rounded-xl bg-[#123B36] text-white font-extrabold">إغلاق الوردية وحفظ</button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold block mb-1">رصيد العهدة الافتتاحي في الدرج ({currency})</label>
              <input type="number" step="any" value={cashInput} onChange={(e) => setCashInput(e.target.value)} placeholder="0.000" className="w-full p-3 rounded-xl bg-[#F4F1EA] outline-none font-bold" />
            </div>
            <button onClick={handleOpen} className="w-full py-3 rounded-xl bg-[#123B36] text-white font-extrabold">بدء الوردية الآن</button>
          </div>
        )}

        {shifts?.length > 0 && (
          <div className="border-t pt-3 space-y-1.5 text-[11px]">
            <div className="font-extrabold">آخر الورديات:</div>
            {shifts.slice(0, 5).map((s) => (
              <div key={s.id} className="flex justify-between bg-[#F4F1EA] px-2.5 py-1.5 rounded-lg">
                <span>{s.cashier_name} ({s.status === 'open' ? 'مفتوحة' : 'مغلقة'})</span>
                <span className="font-bold">كاش: {fmt(s.closing_cash || s.opening_cash)}</span>
              </div>
            ))}
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
  const qrImg = 'https://quickchart.io' + encodeURIComponent(menuUrl)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 text-center shadow-xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-extrabold text-base">منيو الباركود والطلب المباشر</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5"><X size={18} /></button>
        </div>

        <div className="space-y-1.5 text-right">
          <label className="text-xs font-bold block">رقم الطاولة (اختياري لتخصيص الباركود):</label>
          <input value={tableNum} onChange={(e) => setTableNum(e.target.value)} placeholder="مثلاً: 1 أو 2 أو جلسة 3" className="w-full bg-[#F4F1EA] px-3 py-2 rounded-xl text-xs font-bold outline-none" />
        </div>

        <div className="flex justify-center p-3 bg-[#F4F1EA] rounded-2xl">
          <img src={qrImg} alt="QR Menu" className="w-52 h-52 rounded-xl" />
        </div>

        <p className="text-xs text-[#123B36]/75">يمسح الزبون الباركود في مقهى <b>{shopName}</b> ويطلب مباشرة فتصل الفاتورة للكاشير.</p>

        <div className="flex gap-2">
          <button onClick={() => { navigator.clipboard.writeText(menuUrl); alert('تم نسخ الرابط!') }} className="flex-1 py-2.5 rounded-xl bg-[#F4F1EA] font-bold text-xs">نسخ الرابط</button>
          <a href={menuUrl} target="_blank" rel="noreferrer" className="flex-1 py-2.5 rounded-xl bg-[#123B36] text-white font-bold text-xs flex items-center justify-center">معاينة المنيو</a>
        </div>
      </div>
    </div>
  )
}
               function PublicQrMenu({ items, shopName, currency, showFeedback = true }) {
  const [cart, setCart] = useState([])
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [rating, setRating] = useState(5)
  const [fbComment, setFbComment] = useState('')
  const [fbSent, setFbSent] = useState(false)
  const [activeCat, setActiveCat] = useState('الكل')
  const [tableNum, setTableNum] = useState(() => new URLSearchParams(window.location.search).get('table') || '1')
  const [qrLang, setQrLang] = useState('ar')

  const cats = ['الكل', ...new Set(items.map((i) => i.category).filter(Boolean))]
  const total = cart.reduce((s, l) => s + l.price * l.qty, 0)
  const totalCount = cart.reduce((s, l) => s + l.qty, 0)

  function add(it) {
    setCart((p) => {
      const idx = p.findIndex((x) => x.id === it.id)
      if (idx > -1) {
        const c = [...p]
        c[idx].qty += 1
        return c
      }
      return [...p, { id: it.id, name: it.name, name_en: it.name_en || '', price: Number(it.price), qty: 1 }]
    })
  }

  function dec(id) {
    setCart((p) => p.map((x) => x.id === id ? { ...x, qty: x.qty - 1 } : x).filter((x) => x.qty > 0))
  }

  async function sendOrder() {
    if (!cart.length || busy) return
    setBusy(true)
    try {
      await db.insertShared('table_orders', { table_num: tableNum, lines: cart, total, customer_note: note, status: 'pending' })
      setSent(true)
      setCart([])
      setNote('')
    } finally {
      setBusy(false)
    }
  }

  async function sendFeedback(e) {
    e.preventDefault()
    await db.insertShared('feedbacks', { rating, comment: fbComment.trim(), table_num: tableNum })
    setFbSent(true)
  }

  const shownCats = activeCat === 'الكل' ? cats.filter((c) => c !== 'الكل') : [activeCat]

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#123B36] pb-32" dir={qrLang === 'en' ? 'ltr' : 'rtl'}>
      <header className="bg-[#123B36] text-white p-4 sticky top-0 z-20 shadow-md flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-lg">{shopName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs opacity-80">{qrLang === 'en' ? 'Table:' : 'اختر الطاولة:'}</span>
            <select
              value={tableNum}
              onChange={(e) => setTableNum(e.target.value)}
              className="bg-amber-400 text-slate-950 font-extrabold text-xs px-2.5 py-0.5 rounded-full outline-none"
            >
              {Array.from({ length: 15 }, (_, i) => String(i + 1)).map((n) => (
                <option key={n} value={n}>{qrLang === 'en' ? `Table ${n}` : `طاولة ${n}`}</option>
              ))}
              <option value="Takeaway">{qrLang === 'en' ? 'Takeaway' : 'سفري (Takeaway)'}</option>
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setQrLang((l) => (l === 'ar' ? 'en' : 'ar'))}
          className="bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-white/25"
        >
          {qrLang === 'ar' ? 'EN' : 'عربي'}
        </button>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {!sent && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition ${activeCat === c ? 'bg-[#123B36] text-white shadow-xs' : 'bg-white text-[#123B36]/80 border border-[#123B36]/10'}`}
              >
                {c === 'الكل' && qrLang === 'en' ? 'All' : c}
              </button>
            ))}
          </div>
        )}

        {sent ? (
          <div className="bg-white p-6 rounded-2xl text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 size={28} /></div>
            <h2 className="font-extrabold text-lg">{qrLang === 'en' ? 'Order Sent to Barista!' : 'تم إرسال طلبك للكاشير بنجاح!'}</h2>
            <p className="text-xs text-[#123B36]/70">{qrLang === 'en' ? 'Your drinks are being prepared shortly.' : 'سيتم تحضير مشروباتك وتقديمها لطاولتك حالاً.'}</p>

            {showFeedback && !fbSent && (
              <form onSubmit={sendFeedback} className="bg-[#F4F1EA] p-4 rounded-2xl space-y-3 text-center">
                <div className="font-extrabold text-xs">{qrLang === 'en' ? 'Rate your experience ☕' : 'قيّم تجربتك معنا ☕'}</div>
                <div className="flex justify-center gap-2 text-xl">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} onClick={() => setRating(n)} className={`transition ${n <= rating ? 'opacity-100 scale-110' : 'opacity-30'}`}>⭐</button>
                  ))}
                </div>
                <input value={fbComment} onChange={(e) => setFbComment(e.target.value)} placeholder={qrLang === 'en' ? 'Write a note (optional)...' : 'اكتب ملاحظتك أو اقتراحك (اختياري)...'} className="w-full bg-white p-2.5 rounded-xl text-xs outline-none" />
                <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs">{qrLang === 'en' ? 'Send Rating' : 'إرسال التقييم'}</button>
              </form>
            )}

            {fbSent && <div className="text-xs font-extrabold text-emerald-700">{qrLang === 'en' ? 'Thank you for your feedback! ❤️' : 'شكراً لتقييمك الجميل! ❤️'}</div>}
            <button onClick={() => { setSent(false); setFbSent(false) }} className="bg-[#123B36] text-white px-6 py-2.5 rounded-xl text-xs font-bold">{qrLang === 'en' ? 'Order More' : 'طلب أصناف إضافية'}</button>
          </div>
        ) : (
          <div className="space-y-5">
            {shownCats.map((c) => (
              <div key={c} className="space-y-2.5">
                <h3 className="font-extrabold text-sm text-[#123B36] px-1">{c}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {items.filter((i) => i.category === c).map((it) => {
                    const inCart = cart.find((x) => x.id === it.id)
                    return (
                      <div key={it.id} className={`bg-white p-3.5 rounded-2xl shadow-sm border transition flex flex-col justify-between items-center text-center gap-3 ${inCart ? 'border-amber-400/70' : 'border-white/10'}`}>
                        <div>
                          <div className="font-extrabold text-sm">{qrLang === 'en' && it.name_en ? it.name_en : it.name}</div>
                          {it.name_en && <div className="text-[11px] text-[#123B36]/55">{qrLang === 'en' ? it.name : it.name_en}</div>}
                          <div className="text-xs font-extrabold text-amber-700 mt-1">{fmt(it.price)} {currency}</div>
                        </div>
                        {inCart ? (
                          <div className="flex items-center gap-2 bg-[#F4F1EA] p-1 rounded-xl">
                            <button type="button" onClick={() => dec(it.id)} className="w-8 h-8 bg-white rounded-lg font-extrabold text-red-600 shadow-xs text-base">-</button>
                            <span className="font-extrabold text-xs w-5">{inCart.qty}</span>
                            <button type="button" onClick={() => add(it)} className="w-8 h-8 bg-[#123B36] text-white rounded-lg font-extrabold shadow-xs text-base">+</button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => add(it)} className="bg-[#123B36] hover:bg-[#1a524b] text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-xs">
                            {qrLang === 'en' ? '+ Add' : '+ أضف'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {cart.length > 0 && !sent && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t p-3 shadow-lg z-30">
          <div className="max-w-2xl mx-auto space-y-2">
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={qrLang === 'en' ? 'Barista notes (less sugar, extra ice...)' : 'ملاحظات للباريستا (بدون سكر، ثلج زيادة...)'} className="w-full bg-[#F4F1EA] px-3.5 py-2.5 rounded-xl text-xs outline-none font-bold" />
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] text-[#123B36]/70 font-bold">{totalCount} {qrLang === 'en' ? 'items selected' : 'أصناف مختارة'}</div>
                <div className="font-extrabold text-base">{fmt(total)} {currency}</div>
              </div>
              <button onClick={sendOrder} disabled={busy} className="bg-[#123B36] text-white px-6 py-3 rounded-xl font-extrabold text-xs">
                {busy ? (qrLang === 'en' ? 'Sending...' : 'جاري الإرسال...') : (qrLang === 'en' ? 'Send Order Now' : 'إرسال الطلب الآن')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}   
