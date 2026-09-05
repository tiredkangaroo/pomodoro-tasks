/** Duration formatting and parsing shared by the timer and its editor. */

export const MIN_DURATION_SECONDS = 1
export const MAX_DURATION_SECONDS = 180 * 60 // three hours

/** Formats a number of seconds as `MM:SS`. */
export function formatDuration(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/** Characters the editor accepts while typing (digits and one colon). */
export const DURATION_INPUT_PATTERN = /^\d{0,3}(:\d{0,2})?$/

/**
 * Parses a user-typed duration.
 *
 *   "25"    -> 25 minutes   (a bare number is read as minutes)
 *   "25:30" -> 25m 30s
 *   "0:45"  -> 45 seconds
 *   "1:90"  -> 2m 30s       (seconds overflow is normalised, not rejected)
 *
 * @returns {number | null} total seconds, clamped to the allowed range, or
 * `null` when the input cannot be understood.
 */
export function parseDurationInput(raw) {
  const text = String(raw ?? '').trim()
  if (!text || !DURATION_INPUT_PATTERN.test(text)) return null

  const [minutePart, secondPart] = text.split(':')
  const minutes = minutePart === '' ? 0 : Number(minutePart)
  const seconds = secondPart === undefined || secondPart === '' ? 0 : Number(secondPart)
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return null

  const total = minutes * 60 + seconds
  if (total < MIN_DURATION_SECONDS) return null

  return Math.min(total, MAX_DURATION_SECONDS)
}
