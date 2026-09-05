import { useCallback, useEffect, useRef, useState } from 'react'
import { COLUMNS, canMove } from '../lib/board.js'
import { compareByDue } from '../lib/dueDate.js'
import { UnauthorizedError, completeTask, fetchOpenTasks } from '../lib/api.js'

/** Task IDs are only unique within a tasklist, so key on both. */
export function taskUid(task) {
  return `${task.tasklistId}:${task.id}`
}

const emptyColumns = () => ({
  [COLUMNS.todo]: [],
  [COLUMNS.inProgress]: [],
  [COLUMNS.done]: [],
})

function findColumn(columns, uid) {
  for (const key of Object.keys(columns)) {
    const index = columns[key].findIndex((task) => taskUid(task) === uid)
    if (index !== -1) return { column: key, index }
  }
  return null
}

/** Removes a task from every column and returns its previous location. */
function detach(columns, uid) {
  const location = findColumn(columns, uid)
  if (!location) return null

  const task = columns[location.column][location.index]
  const next = { ...columns }
  next[location.column] = columns[location.column].filter((item) => taskUid(item) !== uid)
  return { columns: next, task, from: location.column, fromIndex: location.index }
}

function insert(columns, column, task, index) {
  const list = [...columns[column]]
  const at = index == null || index < 0 || index > list.length ? list.length : index
  list.splice(at, 0, task)
  return { ...columns, [column]: list }
}

/**
 * Index of the first card whose deadline sorts after `task`, i.e. where `task`
 * has to go for the column to stay ordered by due date. Used for `todo`, whose
 * initial order comes from the backend already sorted this way.
 */
function dueInsertIndex(list, task) {
  const at = list.findIndex((item) => compareByDue(task, item) < 0)
  return at === -1 ? list.length : at
}

/**
 * Owns the three-column board.
 *
 * State rules implemented here:
 *  - Only non-completed Google tasks are fetched; they land in `todo`.
 *  - `todo` is kept ordered by due date: cards dropped there ignore the drop
 *    position and slot in by deadline. Explicit reordering inside `todo` is
 *    still honoured.
 *  - `todo` <-> `inProgress` is local-only and never touches the API.
 *  - Dropping into `done` immediately patches the task to `completed`; the
 *    move is optimistic and rolled back if the API call fails.
 *  - `done` only ever contains tasks completed in this session, and nothing
 *    can be dragged out of it.
 */
export function useBoard({ enabled, onSessionExpired }) {
  const [columns, setColumns] = useState(emptyColumns)
  const [loading, setLoading] = useState(enabled)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)

  // Guards against a stale fetch overwriting fresher state.
  const requestRef = useRef(0)

  const load = useCallback(async () => {
    const requestId = ++requestRef.current
    setSyncing(true)
    setError(null)

    try {
      const fetched = await fetchOpenTasks()
      if (requestRef.current !== requestId) return

      setColumns((current) => {
        // Preserve local placement of anything already on the board.
        const claimed = new Set(
          [...current[COLUMNS.inProgress], ...current[COLUMNS.done]].map(taskUid),
        )
        return {
          ...current,
          [COLUMNS.todo]: fetched.filter((task) => !claimed.has(taskUid(task))),
        }
      })
    } catch (err) {
      if (requestRef.current !== requestId) return
      if (err instanceof UnauthorizedError) {
        onSessionExpired?.()
        return
      }
      setError(err.message ?? 'Could not load your Google Tasks.')
    } finally {
      if (requestRef.current === requestId) {
        setSyncing(false)
        setLoading(false)
      }
    }
  }, [onSessionExpired])

  useEffect(() => {
    if (!enabled) {
      setColumns(emptyColumns())
      setLoading(false)
      return
    }
    setLoading(true)
    load()
  }, [enabled, load])

  /**
   * Moves a card between columns, honouring the movement rules and syncing
   * completion to Google Tasks when the destination is `done`.
   */
  const moveTask = useCallback(
    (uid, to, index) => {
      const location = findColumn(columns, uid)
      if (!location || !canMove(location.column, to)) return

      const detached = detach(columns, uid)
      if (!detached) return

      const { task, from, fromIndex } = detached
      // `todo` stays sorted by deadline, so the drop position is ignored there.
      const at = to === COLUMNS.todo ? dueInsertIndex(detached.columns[to], task) : index
      setColumns(insert(detached.columns, to, task, at))

      if (to !== COLUMNS.done) return

      // Completion is the only action that reaches Google Tasks.
      setError(null)
      completeTask({ tasklistId: task.tasklistId, taskId: task.id }).catch((err) => {
        // Roll the card back to exactly where it came from.
        setColumns((current) => {
          const rolledBack = detach(current, uid)
          if (!rolledBack) return current
          return insert(rolledBack.columns, from, task, fromIndex)
        })

        if (err instanceof UnauthorizedError) {
          onSessionExpired?.()
          return
        }
        setError(`Could not complete "${task.title || 'task'}" in Google Tasks.`)
      })
    },
    [columns, onSessionExpired],
  )

  /** Reorders a card inside the column it already lives in. */
  const reorderTask = useCallback(
    (uid, column, index) => {
      const location = findColumn(columns, uid)
      if (!location || location.column !== column || column === COLUMNS.done) return

      const detached = detach(columns, uid)
      if (!detached) return

      // Account for the gap left behind by the card we just removed.
      const target = index != null && index > location.index ? index - 1 : index
      if (target === location.index) return

      setColumns(insert(detached.columns, column, detached.task, target))
    },
    [columns],
  )

  return {
    columns,
    loading,
    syncing,
    error,
    dismissError: () => setError(null),
    refresh: load,
    moveTask,
    reorderTask,
  }
}
