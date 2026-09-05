import { useCallback, useState } from 'react'
import ModeToggle from './ModeToggle.jsx'
import TimerDisplay from './TimerDisplay.jsx'
import TaskList from './TaskList.jsx'
import { COLUMNS } from '../lib/board.js'

const NO_DRAG = { uid: null, from: null }

function Heading({ children, className = '' }) {
  return (
    <h2
      className={`font-display text-[2rem] leading-none font-bold tracking-tight text-black ${className}`}
    >
      {children}
    </h2>
  )
}

/**
 * The three-column workspace: to-do on the left, timer + in-progress in the
 * centre, done on the right.
 */
export default function Board({ board, timer, onSignOut }) {
  const [drag, setDrag] = useState(NO_DRAG)

  const handleDragStart = useCallback((uid, from) => setDrag({ uid, from }), [])
  const handleDragEnd = useCallback(() => setDrag(NO_DRAG), [])

  const handleMove = useCallback(
    (uid, to, index) => {
      board.moveTask(uid, to, index)
      setDrag(NO_DRAG)
    },
    [board],
  )

  const handleReorder = useCallback(
    (uid, column, index) => {
      board.reorderTask(uid, column, index)
      setDrag(NO_DRAG)
    },
    [board],
  )

  const listProps = {
    drag,
    onMove: handleMove,
    onReorder: handleReorder,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
  }

  return (
    <main
      onDragEnd={handleDragEnd}
      className="flex h-screen flex-col overflow-hidden bg-cream px-6 pt-10 pb-4 md:px-10 lg:px-14"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 md:grid-cols-3 lg:gap-10">
        {/* ------------------------------------------------------- to-do */}
        <section className="flex min-h-0 flex-col">
          <Heading className="mb-5 pl-1 text-left">to-do</Heading>
          <TaskList
            column={COLUMNS.todo}
            tasks={board.columns[COLUMNS.todo]}
            emptyMessage={
              board.loading
                ? 'loading your tasks…'
                : 'nothing left here — everything is in progress or done.'
            }
            {...listProps}
          />
        </section>

        {/* --------------------------------------- timer + in-progress */}
        <section className="flex min-h-0 flex-col">
          <div className="flex flex-col items-center">
            <ModeToggle mode={timer.mode} onChange={timer.changeMode} />
            <div className="mt-5">
              <TimerDisplay timer={timer} />
            </div>
          </div>

          {timer.isBreak ? (
            <div className="animate-section-enter mt-10 flex flex-1 flex-col items-center justify-start">
              <p className="max-w-[18rem] text-center font-body text-[0.85rem] leading-relaxed text-ink/40">
                on a break — your in-progress tasks are waiting for you.
              </p>
            </div>
          ) : (
            <div className="animate-section-enter mt-8 flex min-h-0 flex-1 flex-col px-2 lg:px-6">
              <Heading className="mb-5 pl-1 text-left">in-progress</Heading>
              <TaskList
                column={COLUMNS.inProgress}
                tasks={board.columns[COLUMNS.inProgress]}
                emptyMessage="drag a task here to start working on it."
                {...listProps}
              />
            </div>
          )}
        </section>

        {/* --------------------------------------------------------- done */}
        <section className="flex min-h-0 flex-col">
          <Heading className="mb-5 pr-1 text-right">done</Heading>
          <TaskList
            column={COLUMNS.done}
            tasks={board.columns[COLUMNS.done]}
            emptyMessage="tasks you finish this session land here."
            emptyAlign="right"
            {...listProps}
          />
        </section>
      </div>

      {/* ------------------------------------------------ session controls */}
      <footer className="flex shrink-0 items-center justify-end gap-5 pt-2 pr-1">
        {board.error ? (
          <p
            role="alert"
            className="mr-auto max-w-[38ch] font-body text-[0.75rem] leading-snug text-[#9a3412]"
          >
            {board.error}{' '}
            <button
              type="button"
              onClick={board.dismissError}
              className="cursor-pointer underline underline-offset-2"
            >
              dismiss
            </button>
          </p>
        ) : null}

        <button
          type="button"
          onClick={board.refresh}
          disabled={board.syncing}
          className="cursor-pointer font-body text-[0.75rem] text-ink/35 transition-colors hover:text-ink/70 disabled:cursor-default disabled:opacity-50"
        >
          {board.syncing ? 'syncing…' : 'sync google tasks'}
        </button>
        <button
          type="button"
          onClick={onSignOut}
          className="cursor-pointer font-body text-[0.75rem] text-ink/35 transition-colors hover:text-ink/70"
        >
          sign out
        </button>
      </footer>
    </main>
  )
}
