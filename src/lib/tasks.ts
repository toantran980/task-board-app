export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'

export type TaskPriority = 'low' | 'normal' | 'high'

export type Task = {
  id: string
  title: string
  status: TaskStatus
  user_id: string
  created_at: string
  description: string | null
  priority: TaskPriority
  due_date: string | null
}

export const taskFields =
  'id, title, status, user_id, created_at, description, priority, due_date'

export const priorities: { id: TaskPriority; label: string }[] = [
  { id: 'low', label: 'Low' },
  { id: 'normal', label: 'Normal' },
  { id: 'high', label: 'High' },
]

export type DueState = 'overdue' | 'soon' | 'later'

export function getDueState(dueDate: string): DueState {
  const [year, month, day] = dueDate.split('-').map(Number)
  const due = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.round((due.getTime() - today.getTime()) / 86_400_000)
  if (days < 0) return 'overdue'
  return days <= 2 ? 'soon' : 'later'
}

export const columns: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To do' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'in_review', label: 'In review' },
  { id: 'done', label: 'Done' },
]

const storageKey = 'daymark.tasks.v1'

function sampleTasks(): Task[] {
  const day = (offset: number) => {
    const date = new Date()
    date.setDate(date.getDate() + offset)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  const make = (
    n: number,
    title: string,
    status: TaskStatus,
    priority: TaskPriority,
    description: string | null,
    due_date: string | null,
  ): Task => ({
    id: `${n}b7${n}e2c1-0000-4000-8000-000000000000`,
    title,
    status,
    priority,
    description,
    due_date,
    user_id: 'local-preview',
    created_at: new Date(2026, 0, n).toISOString(),
  })
  return [
    make(1, 'Set up analytics events', 'todo', 'normal', null, day(6)),
    make(2, 'Write launch announcement', 'todo', 'low', 'Draft the blog post and social copy for the v1 release.', day(1)),
    make(3, 'Design onboarding flow', 'in_progress', 'high', 'Sketch the first-run experience and empty states for new teammates.', day(-1)),
    make(4, 'Fix drag preview on Safari', 'in_progress', 'normal', null, null),
    make(5, 'Review pricing page copy', 'in_review', 'normal', 'Check tone and typos before it goes out.', day(3)),
    make(6, 'Ship v1 landing page', 'done', 'high', 'Final QA pass complete.', day(-3)),
    make(7, 'Pick a color palette', 'done', 'low', null, null),
  ]
}

export function readLocalTasks(): Task[] {
  const storedTasks = localStorage.getItem(storageKey)
  if (!storedTasks) return sampleTasks()

  const parsedTasks: unknown = JSON.parse(storedTasks)
  if (
    !Array.isArray(parsedTasks) ||
    !parsedTasks.every(
      (task): task is Task =>
        typeof task === 'object' &&
        task !== null &&
        'id' in task &&
        typeof task.id === 'string' &&
        'title' in task &&
        typeof task.title === 'string' &&
        'status' in task &&
        columns.some((column) => column.id === task.status) &&
        'user_id' in task &&
        typeof task.user_id === 'string' &&
        'created_at' in task &&
        typeof task.created_at === 'string',
    )
  ) {
    throw new Error('Saved board data is invalid. Clear this site’s local storage and try again.')
  }
  return parsedTasks.map((task) => ({
    ...task,
    description: task.description ?? null,
    priority: task.priority ?? 'normal',
    due_date: task.due_date ?? null,
  }))
}

export function saveLocalTasks(tasks: Task[]) {
  localStorage.setItem(storageKey, JSON.stringify(tasks))
}
