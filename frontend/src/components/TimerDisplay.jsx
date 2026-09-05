function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem] translate-x-[1px]" aria-hidden="true">
      <path
        d="M8 5.5v13l11-6.5-11-6.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" aria-hidden="true">
      <path
        d="M9 5.5v13M15 5.5v13"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M4.5 12a7.5 7.5 0 1 0 2.6-5.7M4.5 5v4h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Large countdown display with a circular play/pause control underneath.
 * A subtle reset button appears only once the countdown has been touched.
 */
export default function TimerDisplay({ timer }) {
  return (
    <div className="flex flex-col items-center">
      <div
        role="timer"
        aria-live="off"
        aria-label={`${timer.display} remaining in ${timer.mode} mode`}
        className={[
          'font-display text-[6.5rem] leading-none font-bold tracking-[-0.02em] text-black',
          'tabular-nums transition-opacity duration-300',
          timer.finished ? 'opacity-50' : 'opacity-100',
        ].join(' ')}
      >
        {timer.display}
      </div>

      {/* The play control stays optically centred; reset floats beside it. */}
      <div className="relative mt-1 flex items-center justify-center">
        <button
          type="button"
          onClick={timer.toggle}
          aria-label={timer.running ? 'pause timer' : 'start timer'}
          className={[
            'flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-black',
            'shadow-[0_2px_8px_rgba(120,84,40,0.14)]',
            'transition-transform duration-200 ease-out hover:scale-105 active:scale-95',
          ].join(' ')}
        >
          {timer.running ? <PauseIcon /> : <PlayIcon />}
        </button>

        <button
          type="button"
          onClick={timer.reset}
          aria-label="reset timer"
          tabIndex={timer.isPristine ? -1 : 0}
          className={[
            'absolute left-full ml-2 flex h-8 w-8 items-center justify-center rounded-full text-black/45',
            'transition-all duration-300 ease-out hover:bg-white/70 hover:text-black',
            timer.isPristine
              ? 'pointer-events-none -translate-x-2 opacity-0'
              : 'cursor-pointer translate-x-0 opacity-100',
          ].join(' ')}
        >
          <ResetIcon />
        </button>
      </div>
    </div>
  )
}
