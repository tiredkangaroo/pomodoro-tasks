/**
 * Google Tasks deadlines are date-only: the API returns RFC 3339 timestamps
 * whose time component is always midnight UTC. Parsing them with `new Date()`
 * and reading local getters would shift the day backwards for anyone west of
 * UTC, so the date portion is parsed by hand and compared in local time.
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/

const dayFormatter = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' })
const dayYearFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long' })

const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * Sorts lexicographically after any real date, which parks undated tasks at
 * the end of the list. Mirrors `noDueSentinel` in the backend.
 */
const NO_DUE_SENTINEL = '9999-99-99'

/**
 * Reduces a due timestamp to its comparable date portion.
 *
 * @param {string | undefined} due RFC 3339 timestamp from the Tasks API.
 * @returns {string} `YYYY-MM-DD`, or the sentinel when there is no deadline.
 */
export function dueKey(due) {
  const match = ISO_DATE.exec(String(due ?? ''))
  return match ? `${match[1]}-${match[2]}-${match[3]}` : NO_DUE_SENTINEL
}

/**
 * Orders tasks by deadline first (soonest first, undated last), falling back
 * to tasklist name and the user's manual ordering within a list. Deliberately
 * identical to `sortByDue` in the backend so a locally placed card ends up
 * exactly where the next sync would put it.
 */
export function compareByDue(a, b) {
  const keyA = dueKey(a?.due)
  const keyB = dueKey(b?.due)
  if (keyA !== keyB) return keyA < keyB ? -1 : 1

  const listA = a?.tasklistTitle ?? ''
  const listB = b?.tasklistTitle ?? ''
  if (listA !== listB) return listA < listB ? -1 : 1

  const posA = a?.position ?? ''
  const posB = b?.position ?? ''
  if (posA === posB) return 0
  return posA < posB ? -1 : 1
}

/**
 * @param {string | undefined} due RFC 3339 timestamp from the Tasks API.
 * @param {Date} [now] Injectable for testing.
 * @returns {{ label: string, iso: string, isOverdue: boolean, isSoon: boolean } | null}
 */
export function formatDueDate(due, now = new Date()) {
  const match = ISO_DATE.exec(String(due ?? ''))
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) return null

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.round((date - today) / MS_PER_DAY)

  const sameYear = date.getFullYear() === today.getFullYear()
  const absolute = (sameYear ? dayFormatter : dayYearFormatter).format(date).toLowerCase()

  let label
  if (diffDays < 0) label = `overdue · ${absolute}`
  else if (diffDays === 0) label = 'due today'
  else if (diffDays === 1) label = 'due tomorrow'
  else if (diffDays < 7) label = `due ${weekdayFormatter.format(date).toLowerCase()}`
  else label = `due ${absolute}`

  return {
    label,
    iso: `${match[1]}-${match[2]}-${match[3]}`,
    isOverdue: diffDays < 0,
    isSoon: diffDays >= 0 && diffDays <= 1,
  }
}
