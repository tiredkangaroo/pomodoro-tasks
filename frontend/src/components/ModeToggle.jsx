import { TIMER_MODES } from '../hooks/useTimer.js'

const ORDER = [TIMER_MODES.working, TIMER_MODES.break]

/**
 * Segmented pill with two tabs. A single absolutely-positioned white pill
 * slides between the halves, which keeps the animation smooth and avoids any
 * layout thrash.
 */
export default function ModeToggle({ mode, onChange }) {
  const activeIndex = ORDER.findIndex((item) => item.id === mode)

  return (
    <div
      role="tablist"
      aria-label="timer mode"
      className="relative flex w-full max-w-[27rem] items-stretch rounded-full bg-pill-track p-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]"
    >
      {/* Sliding indicator */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 bottom-0 left-0 w-1/2 p-0 transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: `translateX(${Math.max(activeIndex, 0) * 100}%)` }}
      >
        <span className="block h-full w-full rounded-full bg-white shadow-[0_2px_6px_rgba(120,84,40,0.10)]" />
      </span>

      {ORDER.map((item) => {
        const isActive = item.id === mode
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={[
              'relative z-10 flex-1 cursor-pointer rounded-full bg-transparent px-6 py-3',
              'font-display text-[1.6rem] leading-none font-bold tracking-tight',
              'transition-colors duration-300',
              isActive ? 'text-black' : 'text-black/80 hover:text-black',
            ].join(' ')}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
