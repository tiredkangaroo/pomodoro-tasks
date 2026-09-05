import { useMemo } from 'react'
import LinkifiedText from './LinkifiedText.jsx'
import { DRAG_MIME, isDraggable } from '../lib/board.js'
import { formatDueDate } from '../lib/dueDate.js'
import { taskUid } from '../hooks/useBoard.js'

/**
 * A single task card: white rounded rectangle, bold left-aligned title in
 * Canva Sans Bold, smaller right-aligned description in Canva Sans Regular,
 * with the deadline (when the task has one) on the opposite side of the
 * description row.
 */
export default function TaskCard({ task, column, isDragging, onDragStart, onDragEnd }) {
  const uid = taskUid(task)
  const draggable = isDraggable(column)

  const due = useMemo(() => formatDueDate(task.due), [task.due])
  const notes = task.notes?.trim() ? task.notes.trim() : null

  function handleDragStart(event) {
    if (!draggable) return
    event.dataTransfer.setData(DRAG_MIME, uid)
    event.dataTransfer.setData('text/plain', task.title ?? '')
    event.dataTransfer.effectAllowed = 'move'
    onDragStart?.(uid, column)
  }

  return (
    <li
      data-task-card="true"
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={() => onDragEnd?.()}
      aria-roledescription={draggable ? 'draggable task card' : 'completed task card'}
      className={[
        'group animate-card-enter list-none rounded-card bg-white px-5 py-4 select-none',
        'shadow-[0_1px_2px_rgba(120,84,40,0.06)]',
        'transition-[transform,box-shadow,opacity] duration-200 ease-out',
        draggable
          ? 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(120,84,40,0.12)]'
          : 'cursor-default',
        isDragging ? 'card-dragging' : '',
      ].join(' ')}
    >
      <h3 className="font-body text-[1.05rem] leading-tight font-bold text-black break-words">
        {task.title?.trim() || 'untitled task'}
      </h3>

      {due || notes ? (
        <div className="mt-2 flex items-start gap-4">
          {due ? (
            <time
              dateTime={due.iso}
              className={[
                'shrink-0 font-body text-[0.72rem] leading-relaxed whitespace-nowrap',
                due.isOverdue
                  ? 'font-bold text-[#c2410c]'
                  : due.isSoon
                    ? 'font-bold text-ink/70'
                    : 'text-muted',
              ].join(' ')}
            >
              {due.label}
            </time>
          ) : null}

          {notes ? (
            <p className="ml-auto min-w-0 text-right font-body text-[0.8rem] leading-relaxed font-normal text-muted whitespace-pre-line">
              <LinkifiedText text={notes} />
            </p>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}
