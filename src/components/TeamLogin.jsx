import { useState } from 'react'
import { Scale, Lock, UserCheck } from 'lucide-react'
import { auth } from '../lib/auth'

const DEFAULT_STAFF = [
  { id: 'owner-1', displayName: 'المالك (الإدارة)', role: 'manager', pin: '1234' },
  { id: 'cashier-1', displayName: 'كاشير 1', role: 'cashier', pin: '1111' },
  { id: 'cashier-2', displayName: 'كاشير 2', role: 'cashier', pin: '2222' },
]
export function getStaffList() {
  try { return JSON.parse(localStorage.getItem('neom.staff.list') || 'null') || DEFAULT_STAFF } catch { return DEFAULT_STAFF }
}
export function saveStaffList(list) { localStorage.setItem('neom.staff.list', JSON.stringify(list)) }

export default function TeamLogin({ appName = 'نيوم', onSignedIn }) {
  const staff = getStaffList()
  const [selected, setSelected] = useState(staff[0])
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')

  function handleLogin(e) {
    e.preventDefault()
    if (pin !== selected.pin) { setErr('الرمز السري غير صحيح'); return }
    auth.signIn(selected)
    onSignedIn?.()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F1EA] p-4" dir="rtl">
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-[#FBF9F4] rounded-3xl p-6 shadow-xl border border-[#123B36]/10 space-y-5">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#123B36] text-[#F6F3EC] grid place-items-center mb-3"><Scale size={26} /></div>
          <h1 className="font-display text-2xl font-extrabold text-[#123B36]">{appName}</h1>
          <p className="text-xs text-[#123B36]/55 mt-1">اختر الحساب وأدخل الرمز السري للدخول</p>
        </div>
        <div className="space-y-2">
          {staff.map((m) => (
            <button type="button" key={m.id} onClick={() => { setSelected(m); setErr(''); setPin('') }}
              className={`w-full p-3.5 rounded-xl border text-right flex items-center justify-between transition ${selected.id === m.id ? 'bg-[#123B36] text-white border-[#123B36]' : 'bg-white text-[#123B36] border-[#123B36]/15'}`}>
              <span className="font-semibold text-sm">{m.displayName}</span>
              <UserCheck size={16} className={selected.id === m.id ? 'opacity-100' : 'opacity-30'} />
            </button>
          ))}
        </div>
        <div>
          <label className="block text-xs font-medium text-[#123B36]/70 mb-1.5">الرمز السري (PIN)</label>
          <div className="relative">
            <Lock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#123B36]/40" />
            <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••"
              className="w-full h-12 pr-10 pl-4 rounded-xl bg-white border border-[#123B36]/15 text-center text-xl tracking-widest outline-none focus:border-[#123B36]" />
          </div>
        </div>
        {err && <p className="text-xs text-[#A54B3C] bg-[#A54B3C]/10 p-2.5 rounded-lg text-center">{err}</p>}
        <button type="submit" className="w-full h-12 rounded-xl bg-[#123B36] text-[#F6F3EC] font-bold text-base shadow-lg">دخول النظام</button>
      </form>
    </div>
  )
}
