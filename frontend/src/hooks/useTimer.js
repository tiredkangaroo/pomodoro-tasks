import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export const TIMER_MODES = {
  working: { id: 'working', label: 'working', duration: 25 * 60 },
  break: { id: 'break', label: 'break', duration: 5 * 60 },
}

const TICK_MS = 200

/** Formats a number of seconds as `MM:SS`. */
export function formatDuration(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/** Short, soft two-tone chime played when a cycle finishes. */
function playChime() {
  const AudioCtx = window.AudioContext ?? window.webkitAudioContext
  if (!AudioCtx) return

  try {
    const ctx = new AudioCtx()
    const now = ctx.currentTime
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1)
    gain.connect(ctx.destination)

    for (const [frequency, offset] of [
      [880, 0],
      [1174.7, 0.18],
    ]) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = frequency
      osc.connect(gain)
      osc.start(now + offset)
      osc.stop(now + offset + 0.9)
    }

    setTimeout(() => ctx.close().catch(() => {}), 1600)
  } catch {
    // Audio is a nicety; never let it break the timer.
  }
}

/**
 * Pomodoro timer state.
 *
 * Each mode keeps its own remaining time, so flipping between `working` and
 * `break` never destroys progress. Switching modes pauses the countdown.
 * The timer is deliberately decoupled from the task board: finishing a cycle
 * never moves cards.
 */
export function useTimer() {
  const [mode, setMode] = useState(TIMER_MODES.working.id)
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(() => ({
    working: TIMER_MODES.working.duration,
    break: TIMER_MODES.break.duration,
  }))

  // Absolute end timestamp for the active countdown; avoids interval drift.
  const deadlineRef = useRef(null)

  useEffect(() => {
    if (!running) {
      deadlineRef.current = null
      return undefined
    }

    deadlineRef.current = Date.now() + remaining[mode] * 1000

    const interval = setInterval(() => {
      const secondsLeft = Math.max(0, (deadlineRef.current - Date.now()) / 1000)
      const rounded = Math.ceil(secondsLeft - 0.0001)

      setRemaining((current) => ({ ...current, [mode]: Math.max(0, rounded) }))

      if (secondsLeft <= 0) {
        setRunning(false)
        playChime()
      }
    }, TICK_MS)

    return () => clearInterval(interval)
    // `remaining` is intentionally omitted: it is read once to seed the
    // deadline, and re-reading it on every tick would restart the interval.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode])

  const secondsLeft = remaining[mode]
  const duration = TIMER_MODES[mode].duration
  const finished = secondsLeft === 0

  const toggle = useCallback(() => {
    setRunning((current) => {
      if (current) return false
      // Pressing play on a finished cycle restarts it from the top.
      if (remaining[mode] === 0) {
        setRemaining((prev) => ({ ...prev, [mode]: TIMER_MODES[mode].duration }))
      }
      return true
    })
  }, [mode, remaining])

  const reset = useCallback(() => {
    setRunning(false)
    setRemaining((current) => ({ ...current, [mode]: TIMER_MODES[mode].duration }))
  }, [mode])

  const changeMode = useCallback((nextMode) => {
    if (!TIMER_MODES[nextMode]) return
    setRunning(false)
    setMode(nextMode)
  }, [])

  // Keep the tab title in sync so the countdown is visible while multitasking.
  useEffect(() => {
    const base = 'pomodoro · tasks'
    document.title = running ? `${formatDuration(secondsLeft)} · ${mode}` : base
    return () => {
      document.title = base
    }
  }, [running, secondsLeft, mode])

  return useMemo(
    () => ({
      mode,
      isBreak: mode === TIMER_MODES.break.id,
      running,
      finished,
      secondsLeft,
      duration,
      display: formatDuration(secondsLeft),
      progress: duration === 0 ? 0 : 1 - secondsLeft / duration,
      isPristine: secondsLeft === duration && !running,
      toggle,
      reset,
      changeMode,
    }),
    [mode, running, finished, secondsLeft, duration, toggle, reset, changeMode],
  )
}
