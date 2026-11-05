import type { Task, TaskStatus } from '../lib/tasks'
import { columns, getDueState, priorities } from '../lib/tasks'
import { formatDueDate } from '../lib/format'
import { CalendarIcon } from './icons'

type Props = {
  task: Task
  isDragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onMove: (status: TaskStatus) => void
  onOpen: () => void
}

export function TaskCard({ task, isDragging, onDragStart, onDragEnd, onMove, onOpen }: Props) {
  const dueState = task.due_date ? getDueState(task.due_date) : null
  const dueClass = task.status === 'done' ? 'later' : dueState
  const priorityLabel = priorities.find((p) => p.id === task.priority)?.label

  return (
    <article
      className={`task-card${isDragging ? ' dragging' : ''}${task.status === 'done' ? ' is-done' : ''}`}
      draggable
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target === event.currentTarget) onOpen()
      }}
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', task.id)
        event.dataTransfer.effectAllowed = 'move'
        onDragStart()
      }}
      onDragEnd={onDragEnd}
    >
      <label className="move-select-label" onClick={(event) => event.stopPropagation()}>
        <span className="visually-hidden">Move {task.title} to</span>
        <select
          aria-label={`Move ${task.title} to`}
          value={task.status}
          onChange={(event) => onMove(event.target.value as TaskStatus)}
        >
          {columns.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </label>
      <p className="task-title">{task.title}</p>
      {task.description && <p className="task-description">{task.description}</p>}
      <div className="task-footer">
        <div className="task-tags">
          <span className={`tag tag-${task.priority}`}>
            <span className="tag-dot" aria-hidden="true" />
            {priorityLabel}
          </span>
          {task.due_date && (
            <span className={`chip due-${dueClass}`}>
              <CalendarIcon />
              {formatDueDate(task.due_date)}
              {task.status !== 'done' && dueState === 'overdue' && ' · Overdue'}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
