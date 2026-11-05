import type { Task } from '../lib/tasks'
import { getDueState } from '../lib/tasks'

export function StatsBar({ tasks }: { tasks: Task[] }) {
  const done = tasks.filter((task) => task.status === 'done').length
  const overdue = tasks.filter(
    (task) => task.status !== 'done' && task.due_date && getDueState(task.due_date) === 'overdue',
  ).length

  const stats = [
    { label: 'Total tasks', value: tasks.length, tone: '' },
    { label: 'Completed', value: done, tone: 'good' },
    { label: 'Overdue', value: overdue, tone: overdue > 0 ? 'bad' : '' },
  ]

  return (
    <div className="stats-bar" aria-label="Board summary">
      {stats.map((stat) => (
        <div className={`stat ${stat.tone}`} key={stat.label}>
          <span className="stat-value">{stat.value}</span>
          <span className="stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}
