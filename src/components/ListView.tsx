import type { Task, TaskStatus } from '../lib/tasks'
import { columns, priorities } from '../lib/tasks'
import { formatDueDate } from '../lib/format'
import { PriorityIcon, StatusIcon } from './icons'

type Props = {
  tasks: Task[]
  statusFilter: TaskStatus | 'all'
  onMove: (taskId: string, status: TaskStatus) => void
  onOpen: (task: Task) => void
}

export function ListView({ tasks, statusFilter, onMove, onOpen }: Props) {
  return (
    <section className="list-view" aria-label="Task list">
      {columns.filter((column) => statusFilter === 'all' || column.id === statusFilter).map((column) => {
        const rows = tasks.filter((task) => task.status === column.id)
        return (
          <div className="list-group" key={column.id}>
            <div className="list-group-header">
              <StatusIcon status={column.id} />
              <h2>{column.label}</h2>
              <span className="column-count">{rows.length}</span>
            </div>
            {rows.map((task) => (
              <div className="list-row" key={task.id} onClick={() => onOpen(task)}>
                <span className="list-title">{task.title}</span>
                <span className={`chip priority-${task.priority}`}>
                  <PriorityIcon priority={task.priority} />
                  {priorities.find((p) => p.id === task.priority)?.label}
                </span>
                <span className="list-due">{task.due_date ? formatDueDate(task.due_date) : '—'}</span>
                <select
                  aria-label={`Move ${task.title} to`}
                  value={task.status}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => onMove(task.id, event.target.value as TaskStatus)}
                >
                  {columns.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
              </div>
            ))}
            {rows.length === 0 && <div className="list-empty">No tasks</div>}
          </div>
        )
      })}
    </section>
  )
}
