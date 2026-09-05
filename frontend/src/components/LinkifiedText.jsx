import { Fragment, useMemo } from 'react'
import { tokenizeLinks } from '../lib/linkify.js'

/**
 * Renders plain text with URLs and email addresses turned into real anchors
 * that open in a new tab.
 */
export default function LinkifiedText({ text, className = '' }) {
  const tokens = useMemo(() => tokenizeLinks(text), [text])

  if (tokens.length === 0) return null

  return (
    <span className={className}>
      {tokens.map((token, index) => {
        if (token.type === 'text') {
          return <Fragment key={index}>{token.value}</Fragment>
        }
        return (
          <a
            key={index}
            href={token.href}
            target="_blank"
            rel="noopener noreferrer"
            // Stops the parent card from starting a drag when a link is clicked.
            draggable={false}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            className="text-ink/70 underline decoration-ink/30 underline-offset-2 transition-colors hover:text-ink hover:decoration-ink/70 break-words"
          >
            {token.value}
          </a>
        )
      })}
    </span>
  )
}
