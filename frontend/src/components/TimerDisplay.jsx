import { useEffect, useRef, useState } from 'react'
import { DURATION_INPUT_PATTERN, formatDuration, parseDurationInput } from '../lib/duration.js'

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

const DIGIT_CLASSES =
  'font-display text-[clamp(3rem,7.5vw,6.5rem)] leading-none font-bold tracking-[-0.02em] tabular-nums'

/**
 * Large countdown display with a circular play/pause control underneath.
 *
 * Double-clicking (or pressing Enter on) the digits turns them into an inline
 * editor for the current mode's length. A subtle reset button appears once the
 * countdown has been touched.
 */
export default function TimerDisplay({ timer }) {
  const [draft, setDraft] = useState(null)
  const inputRef = useRef(null)
  const isEditing = draft !== null

  useEffect(() => {
    if (isEditing) inputRef.current?.select()
  }, [isEditing])

  // Switching modes mid-edit would apply the value to the wrong timer.
  useEffect(() => {
    setDraft(null)
  }, [timer.mode])

  function startEditing() {
    timer.pause()
    setDraft(timer.display)
  }

  function commit() {
    const seconds = parseDurationInput(draft)
    if (seconds !== null) timer.setDuration(seconds)
    setDraft(null)
  }

  function handleChange(event) {
    const next = event.target.value.replace(/[^\d:]/g, '')
    // Accept partial input ("2", "25:") so typing feels unrestricted.
    if (DURATION_INPUT_PATTERN.test(next)) setDraft(next)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      commit()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setDraft(null)
    }
  }

  return (
    <div className="flex flex-col items-center">
      {isEditing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          autoFocus
          inputMode="numeric"
          aria-label="timer length in minutes and seconds"
          className={[
            DIGIT_CLASSES,
            'w-[6ch] rounded-2xl bg-white/60 text-center text-black caret-black',
            'outline-none ring-2 ring-ink/15 transition-shadow duration-200',
          ].join(' ')}
        />
      ) : (
        <div
          role="timer"
          aria-live="off"
          tabIndex={0}
          onDoubleClick={startEditing}
          onKeyDown={(event) => {
            if (event.key === 'Enter') startEditing()
          }}
          title="double-click to change the length"
          aria-label={`${timer.display} remaining in ${timer.mode} mode. Press Enter to change the length.`}
          className={[
            DIGIT_CLASSES,
            'cursor-text rounded-2xl px-2 text-black select-none',
            'outline-none transition-opacity duration-300 focus-visible:ring-2 focus-visible:ring-ink/20',
            timer.finished ? 'opacity-50' : 'opacity-100',
          ].join(' ')}
        >
          {timer.display}
        </div>
      )}

      {/* The play control stays optically centred; reset floats beside it. */}
      <div className="relative mt-1 flex items-center justify-center">
        <button
          type="button"
          onClick={timer.toggle}
          disabled={isEditing}
          aria-label={timer.running ? 'pause timer' : 'start timer'}
          className={[
            'flex h-12 w-12 items-center justify-center rounded-full bg-white text-black',
            'shadow-[0_2px_8px_rgba(120,84,40,0.14)]',
            'transition-transform duration-200 ease-out',
            isEditing ? 'cursor-default opacity-40' : 'cursor-pointer hover:scale-105 active:scale-95',
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

      {/* Contextual hint: editing help, or a way back to the default length. */}
      <div className="mt-2 flex h-4 items-center font-body text-[0.7rem] leading-none text-ink/40">
        {isEditing ? (
          <span>minutes : seconds · enter to save, esc to cancel</span>
        ) : timer.isCustomDuration ? (
          <button
            type="button"
            onClick={timer.restoreDefaultDuration}
            className="cursor-pointer underline decoration-ink/20 underline-offset-2 transition-colors hover:text-ink/70"
          >
            restore {formatDuration(timer.defaultDuration)}
          </button>
        ) : null}
      </div>
    </div>
  )
}
