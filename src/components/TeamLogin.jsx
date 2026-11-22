import { useState } from 'react'
import { auth } from '../lib/auth'

const DEFAULT_STAFF = [
  { id: 'owner', displayName: 'المالك', role: 'manager', pin: '1234' },
  { id: 'cashier1', displayName: 'كاشير 1', role: 'cashier', pin: '1111' }
]

export function getStaffList() {
  try {
    const saved = JSON.parse(localStorage.getItem('neom_staff') || 'null')
    if (Array.isArray(saved) && saved.length) return saved
  } catch {}
  return DEFAULT_STAFF
}

export function saveStaffList(list) {
  localStorage.setItem('neom_staff', JSON.stringify(list))
}

export default function TeamLogin({ appName, onSignedIn }) {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const clean = username.trim()
    const cleanPin = String(pin).trim()
    const found = getStaffList().find(
      (s) => (s.displayName === clean || s.name === clean || s.id === clean) && String(s.pin) === cleanPin
    )
    if (!found) {
      setErr('اسم المستخدم أو الرمز السري غير صحيح')
      return
    }
    auth.signIn(found)
    if (onSignedIn) onSignedIn(found)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-sm p-6 rounded-3xl shadow-xl space-y-5 border border-white/10">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 bg-[#123B36] rounded-2xl mx-auto flex items-center justify-center text-xl shadow-md">
            ☕
          </div>
          <h1 className="font-extrabold text-2xl">{appName}</h1>
          <p className="text-xs opacity-70">أدخل اسم المستخدم والرمز السري للدخول</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-extrabold mb-1">اسم المستخدم (اليوزر)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setErr('') }}
              placeholder="اكتب اسم المستخدم..."
              required
              className="w-full px-4 py-3 rounded-xl text-sm font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold mb-1">الرمز السري (PIN)</label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setErr('') }}
              placeholder="••••"
              required
              className="w-full px-4 py-3 rounded-xl text-sm font-extrabold text-center tracking-widest outline-none"
            />
          </div>
        </div>

        {err && <div className="text-xs font-bold text-red-400 text-center bg-red-500/10 py-2 rounded-xl">{err}</div>}

        <button type="submit" className="w-full py-3.5 rounded-xl bg-[#123B36] font-extrabold text-sm shadow-md">
          دخول النظام
        </button>
      </form>
    </div>
  )
}
