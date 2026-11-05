import { useState } from 'react'
import type { FormEvent } from 'react'
import type { TaskInput } from '../hooks/useTasks'
import type { Task, TaskPriority, TaskStatus } from '../lib/tasks'
import { columns, priorities } from '../lib/tasks'
import { CloseIcon } from './icons'

type Props = {
  // When a task is passed the dialog edits it, otherwise it creates a new one.
  task?: Task
  initialStatus: TaskStatus
  isSaving: boolean
  error: string | null
  onSubmit: (input: TaskInput) => Promise<boolean>
  onDelete?: () => Promise<boolean>
  onClose: () => void
}

export function TaskModal({ task, initialStatus, isSaving, error, onSubmit, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? initialStatus)
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'normal')
  const [dueDate, setDueDate] = useState(task?.due_date ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    const ok = await onSubmit({ title: trimmed, status, description, priority, due_date: dueDate })
    if (ok) onClose()
  }

  async function handleDelete() {
    if (!onDelete) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    if (await onDelete()) onClose()
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section className="create-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <div className="modal-heading">
          <div>
            <h2 id="task-modal-title">{task ? 'Edit task' : 'Create a task'}</h2>
          </div>
          <button className="icon-button modal-close" onClick={onClose} aria-label="Close dialog"><CloseIcon /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="form-label" htmlFor="task-title">Task name</label>
          <input
            autoFocus
            id="task-title"
            maxLength={160}
            placeholder="What needs to get done?"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <label className="form-label" htmlFor="task-description">
            Description <span className="optional">Optional</span>
          </label>
          <textarea
            id="task-description"
            rows={3}
            maxLength={1000}
            placeholder="Add a few details…"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <div className="form-row">
            <div>
              <label className="form-label" htmlFor="task-status">{task ? 'Status' : 'Add to'}</label>
              <select
                id="task-status"
                value={status}
                onChange={(event) => setStatus(event.target.value as TaskStatus)}
              >
                {columns.map((column) => <option key={column.id} value={column.id}>{column.label}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as TaskPriority)}
              >
                {priorities.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <label className="form-label" htmlFor="task-due">
            Due date <span className="optional">Optional</span>
          </label>
          <input
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            {onDelete && (
              <button
                type="button"
                className={`danger-button${confirmDelete ? ' confirm' : ''}`}
                onClick={handleDelete}
                disabled={isSaving}
              >
                {confirmDelete ? 'Click again to delete' : 'Delete'}
              </button>
            )}
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button" disabled={isSaving || !title.trim()}>
              {isSaving ? 'Saving…' : task ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
