export default function Chart({ spec }) {
  const labels = spec?.labels || []
  const series = spec?.series?.[0]?.data || []
  const max = Math.max(...series, 1)
  return (
    <div className="space-y-2 pt-2">
      {labels.map((lbl, idx) => (
        <div key={lbl} className="flex items-center gap-2 text-xs">
          <span className="w-16 text-[#123B36]/70 truncate">{lbl}</span>
          <div className="flex-1 h-3 bg-[#123B36]/8 rounded-full overflow-hidden">
            <div className="h-full bg-[#123B36] rounded-full" style={{ width: `${(series[idx] / max) * 100}%` }} />
          </div>
          <span className="w-14 text-left font-semibold text-[#123B36]">{series[idx]}</span>
        </div>
      ))}
    </div>
  )
}
