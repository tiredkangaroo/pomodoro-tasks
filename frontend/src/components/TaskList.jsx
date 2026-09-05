import { useCallback, useRef, useState } from 'react'
import TaskCard from './TaskCard.jsx'
import { COLUMNS, DRAG_MIME, canMove } from '../lib/board.js'
import { taskUid } from '../hooks/useBoard.js'

/**
 * A scrollable, drop-enabled stack of task cards.
 *
 * Drop feedback is a tint on the column rather than an inserted placeholder:
 * mutating the list mid-drag shifts the element under the cursor, which makes
 * the browser fire `dragleave` and can cancel the drop entirely. The insertion
 * index is therefore derived from the pointer position at drop time, using the
 * vertical midpoint of each card.
 */
export default function TaskList({
  column,
  tasks,
  drag,
  onMove,
  onReorder,
  onDragStart,
  onDragEnd,
  emptyMessage,
  emptyAlign = 'left',
}) {
  const listRef = useRef(null)
  const [isOver, setIsOver] = useState(false)

  const isReorder = drag.uid != null && drag.from === column
  const accepts =
    drag.uid != null && (isReorder ? column !== COLUMNS.done : canMove(drag.from, column))

  const computeInsertIndex = useCallback((clientY) => {
    const cards = listRef.current?.querySelectorAll('[data-task-card="true"]') ?? []
    for (let index = 0; index < cards.length; index += 1) {
      const rect = cards[index].getBoundingClientRect()
      if (clientY < rect.top + rect.height / 2) return index
    }
    return cards.length
  }, [])

  function allowDrop(event) {
    if (!accepts) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    // React bails out when the value is unchanged, so this stays cheap even
    // though `dragover` fires continuously.
    setIsOver(true)
  }

  function handleDragLeave(event) {
    if (event.currentTarget.contains(event.relatedTarget)) return
    setIsOver(false)
  }

  function handleDrop(event) {
    if (!accepts) return
    event.preventDefault()
    setIsOver(false)

    const uid = event.dataTransfer.getData(DRAG_MIME) || drag.uid
    if (!uid) return

    const index = computeInsertIndex(event.clientY)
    if (isReorder) onReorder?.(uid, column, index)
    else onMove?.(uid, column, index)
  }

  return (
    <ul
      ref={listRef}
      onDragEnter={allowDrop}
      onDragOver={allowDrop}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label={column}
      data-drop-active={isOver ? 'true' : undefined}
      className={[
        'scroll-subtle flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden',
        'rounded-[1.5rem] p-1 pb-12',
        'transition-[background-color,box-shadow] duration-200 ease-out',
        isOver
          ? 'bg-ink/[0.04] shadow-[inset_0_0_0_1.5px_rgba(0,0,0,0.10)]'
          : 'bg-transparent shadow-none',
      ].join(' ')}
    >
      {tasks.map((task) => (
        <TaskCard
          key={taskUid(task)}
          task={task}
          column={column}
          isDragging={drag.uid === taskUid(task)}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      ))}

      {tasks.length === 0 && emptyMessage ? (
        <li
          className={[
            'list-none px-2 pt-1 font-body text-[0.8rem] leading-relaxed text-ink/35',
            emptyAlign === 'right' ? 'text-right' : 'text-left',
          ].join(' ')}
        >
          {emptyMessage}
        </li>
      ) : null}
    </ul>
  )
}
