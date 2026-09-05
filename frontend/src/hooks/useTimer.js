import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  MAX_DURATION_SECONDS,
  MIN_DURATION_SECONDS,
  formatDuration,
} from '../lib/duration.js'

export const TIMER_MODES = {
  working: { id: 'working', label: 'working', duration: 25 * 60 },
  break: { id: 'break', label: 'break', duration: 5 * 60 },
}

const DEFAULT_DURATIONS = {
  working: TIMER_MODES.working.duration,
  break: TIMER_MODES.break.duration,
}

const STORAGE_KEY = 'pomodoro.durations'
const TICK_MS = 200

/**
 * Custom lengths are a preference rather than session state, so they survive a
 * reload (unlike the task columns, which reset by design).
 */
function loadDurations() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!stored) return DEFAULT_DURATIONS

    const sanitize = (value, fallback) =>
      typeof value === 'number' && Number.isFinite(value)
        ? Math.min(Math.max(Math.round(value), MIN_DURATION_SECONDS), MAX_DURATION_SECONDS)
        : fallback

    return {
      working: sanitize(stored.working, DEFAULT_DURATIONS.working),
      break: sanitize(stored.break, DEFAULT_DURATIONS.break),
    }
  } catch {
    return DEFAULT_DURATIONS
  }
}

function saveDurations(durations) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(durations))
  } catch {
    // Private browsing or a full quota; the timer still works in-memory.
  }
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
 * Each mode keeps its own duration and remaining time, so flipping between
 * `working` and `break` never destroys progress. Switching modes pauses the
 * countdown. The timer is deliberately decoupled from the task board:
 * finishing a cycle never moves cards.
 */
export function useTimer() {
  const [mode, setMode] = useState(TIMER_MODES.working.id)
  const [running, setRunning] = useState(false)
  const [durations, setDurations] = useState(loadDurations)
  const [remaining, setRemaining] = useState(durations)

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
  const duration = durations[mode]
  const finished = secondsLeft === 0

  const pause = useCallback(() => setRunning(false), [])

  const toggle = useCallback(() => {
    setRunning((current) => {
      if (current) return false
      // Pressing play on a finished cycle restarts it from the top.
      if (remaining[mode] === 0) {
        setRemaining((prev) => ({ ...prev, [mode]: durations[mode] }))
      }
      return true
    })
  }, [mode, remaining, durations])

  const reset = useCallback(() => {
    setRunning(false)
    setRemaining((current) => ({ ...current, [mode]: durations[mode] }))
  }, [mode, durations])

  const changeMode = useCallback((nextMode) => {
    if (!TIMER_MODES[nextMode]) return
    setRunning(false)
    setMode(nextMode)
  }, [])

  /**
   * Sets a new length for the current mode and restarts it from that length.
   * Pauses first, so an edit never races with a running countdown.
   */
  const setDuration = useCallback(
    (seconds) => {
      const clamped = Math.min(
        Math.max(Math.round(seconds), MIN_DURATION_SECONDS),
        MAX_DURATION_SECONDS,
      )
      setRunning(false)
      setDurations((current) => {
        const next = { ...current, [mode]: clamped }
        saveDurations(next)
        return next
      })
      setRemaining((current) => ({ ...current, [mode]: clamped }))
    },
    [mode],
  )

  /** Restores the 25:00 / 5:00 defaults for the current mode. */
  const restoreDefaultDuration = useCallback(() => {
    setDuration(DEFAULT_DURATIONS[mode])
  }, [mode, setDuration])

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
      defaultDuration: DEFAULT_DURATIONS[mode],
      isCustomDuration: duration !== DEFAULT_DURATIONS[mode],
      toggle,
      pause,
      reset,
      changeMode,
      setDuration,
      restoreDefaultDuration,
    }),
    [
      mode,
      running,
      finished,
      secondsLeft,
      duration,
      toggle,
      pause,
      reset,
      changeMode,
      setDuration,
      restoreDefaultDuration,
    ],
  )
}

export { formatDuration }
