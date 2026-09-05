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
