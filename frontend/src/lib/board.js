/** Board column identifiers. These double as drag-and-drop drop-zone IDs. */
export const COLUMNS = {
  todo: 'todo',
  inProgress: 'inProgress',
  done: 'done',
}

/** MIME type used for the HTML5 drag payload. */
export const DRAG_MIME = 'application/x-pomodoro-task'

/**
 * Movement rules:
 *  - `todo` and `inProgress` are freely interchangeable (local state only).
 *  - Either of them may move to `done`, which syncs to Google Tasks.
 *  - `done` is terminal: nothing leaves it.
 */
export function canMove(from, to) {
  if (!from || !to || from === to) return false
  if (from === COLUMNS.done) return false
  return true
}

/** `done` cards are not draggable at all. */
export function isDraggable(column) {
  return column !== COLUMNS.done
}
