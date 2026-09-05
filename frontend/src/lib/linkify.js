/**
 * Splits plain text into text/link/email segments so descriptions coming from
 * Google Tasks can be rendered with real anchors.
 *
 * Google Tasks notes are plain text, so a regex pass is both safe (no HTML is
 * ever injected) and sufficient.
 */

const PATTERN = /((?:https?:\/\/|www\.)[^\s<>()[\]{}"']+)|([\w.+-]+@[\w-]+\.[\w.-]+)/gi

// URLs frequently end a sentence; don't swallow the punctuation into the href.
const TRAILING_PUNCTUATION = /[.,;:!?'")\]}]+$/

/**
 * @param {string} input
 * @returns {Array<{ type: 'text' | 'link' | 'email', value: string, href?: string }>}
 */
export function tokenizeLinks(input) {
  const text = typeof input === 'string' ? input : ''
  if (!text) return []

  const tokens = []
  let cursor = 0

  for (const match of text.matchAll(PATTERN)) {
    const [raw] = match
    const start = match.index ?? 0

    if (start > cursor) {
      tokens.push({ type: 'text', value: text.slice(cursor, start) })
    }

    const trailing = raw.match(TRAILING_PUNCTUATION)?.[0] ?? ''
    const value = trailing ? raw.slice(0, -trailing.length) : raw

    if (!value) {
      tokens.push({ type: 'text', value: raw })
    } else if (match[2]) {
      tokens.push({ type: 'email', value, href: `mailto:${value}` })
    } else {
      const href = value.toLowerCase().startsWith('www.') ? `https://${value}` : value
      tokens.push({ type: 'link', value, href })
    }

    if (trailing) {
      tokens.push({ type: 'text', value: trailing })
    }
    cursor = start + raw.length
  }

  if (cursor < text.length) {
    tokens.push({ type: 'text', value: text.slice(cursor) })
  }

  return tokens
}
