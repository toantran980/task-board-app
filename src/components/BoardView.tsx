import { useState } from 'react'
import type { CSSProperties, DragEvent } from 'react'
import type { Task, TaskStatus } from '../lib/tasks'
import { columns } from '../lib/tasks'
import { PlusIcon, StatusIcon } from './icons'
import { TaskCard } from './TaskCard'

type Props = {
  tasks: Task[]
  statusFilter: TaskStatus | 'all'
  isLoading: boolean
  onMove: (taskId: string, status: TaskStatus) => void
  onCreate: (status: TaskStatus) => void
  onOpen: (task: Task) => void
}

export function BoardView({ tasks, statusFilter, isLoading, onMove, onCreate, onOpen }: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)
  const shownColumns = columns.filter((column) => statusFilter === 'all' || column.id === statusFilter)

  function handleDrop(event: DragEvent<HTMLElement>, status: TaskStatus) {
    event.preventDefault()
    const taskId = event.dataTransfer.getData('text/plain')
    setDragOverColumn(null)
    setDraggingId(null)
    if (taskId) onMove(taskId, status)
  }

  return (
    <section
      className="board-grid"
      aria-label="Task board"
      style={{ '--cols': shownColumns.length } as CSSProperties}
    >
      {shownColumns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.id)
        return (
          <section
            className={`board-column column-${column.id}${dragOverColumn === column.id ? ' drag-over' : ''}`}
            key={column.id}
            aria-labelledby={`heading-${column.id}`}
            onDragOver={(event) => {
              event.preventDefault()
              event.dataTransfer.dropEffect = 'move'
              if (dragOverColumn !== column.id) setDragOverColumn(column.id)
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setDragOverColumn(null)
              }
            }}
            onDrop={(event) => handleDrop(event, column.id)}
          >
            <header className="column-header">
              <div className="column-title-wrap">
                <span className="column-status"><StatusIcon status={column.id} /></span>
                <h2 id={`heading-${column.id}`}>{column.label}</h2>
                <span className="column-count">{columnTasks.length}</span>
              </div>
            </header>
            <div className="column-cards">
              {isLoading ? (
                <>
                  <div className="task-skeleton" />
                  <div className="task-skeleton short" />
                </>
              ) : columnTasks.length > 0 ? (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isDragging={draggingId === task.id}
                    onDragStart={() => setDraggingId(task.id)}
                    onDragEnd={() => {
                      setDraggingId(null)
                      setDragOverColumn(null)
                    }}
                    onMove={(status) => onMove(task.id, status)}
                    onOpen={() => onOpen(task)}
                  />
                ))
              ) : (
                <div className="empty-column">
                  <span className="empty-icon"><StatusIcon status={column.id} size={20} /></span>
                  <p>No tasks here yet</p>
                  <span className="empty-hint">Click + to add one, or drag a card here.</span>
                </div>
              )}
            </div>
            {!isLoading && (
              <button className="add-task-link" onClick={() => onCreate(column.id)}>
                <PlusIcon /> Add task
              </button>
            )}
          </section>
        )
      })}
    </section>
  )
}
