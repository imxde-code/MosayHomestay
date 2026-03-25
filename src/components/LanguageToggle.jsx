import { supportedLanguages } from '../lib/language'

function LanguageToggle({ language, onChange, label }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[#d8c8b4] bg-white/80 p-1 text-[#2f221a] shadow-[0_12px_28px_rgba(111,88,63,0.08)]">
      <span className="hidden px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8b6b4a] sm:block">
        {label}
      </span>
      <div className="flex items-center gap-1">
        {supportedLanguages.map((option) => {
          const isActive = option.code === language

          return (
            <button
              key={option.code}
              type="button"
              onClick={() => onChange(option.code)}
              className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                isActive
                  ? 'bg-[#2f221a] text-[#f8f2ea]'
                  : 'text-[#6a584c] hover:bg-[#f4ecdf]'
              }`}
              aria-pressed={isActive}
              title={option.name}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LanguageToggle
