import { useEffect, useState } from 'react'
import type { Task, TaskStatus } from './lib/tasks'
import { supabase } from './lib/supabase'
import { useTasks } from './hooks/useTasks'
import { BoardView } from './components/BoardView'
import { CloseIcon } from './components/icons'
import { Toolbar, Topbar } from './components/Header'
import type { PriorityFilter, SortKey, View } from './components/Header'
import { ListView } from './components/ListView'
import { Sidebar } from './components/Sidebar'
import { StatsBar } from './components/StatsBar'
import { TaskModal } from './components/TaskModal'
import './App.css'

const priorityRank = { high: 0, normal: 1, low: 2 }

// Tasks without a due date sort last when ordering by due date.
function compareTasks(sort: SortKey) {
  return (a: Task, b: Task) => {
    if (sort === 'due') return (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999')
    if (sort === 'priority') return priorityRank[a.priority] - priorityRank[b.priority]
    return b.created_at.localeCompare(a.created_at)
  }
}

type Theme = 'light' | 'dark'

// The dialog is either closed, creating a task in a given column, or editing an existing task.
type ModalState = { mode: 'create'; status: TaskStatus } | { mode: 'edit'; task: Task } | null

function App() {
  const {
    tasks,
    isLoading,
    isSaving,
    error,
    operationError,
    setOperationError,
    retry,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useTasks()

  const [theme, setTheme] = useState<Theme>(() =>
    localStorage.getItem('daymark.theme') === 'light' ? 'light' : 'dark',
  )
  const [view, setView] = useState<View>('board')
  const [query, setQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [sort, setSort] = useState<SortKey>('newest')
  const [modal, setModal] = useState<ModalState>(null)
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('daymark.theme', theme)
  }, [theme])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      if (/input|textarea|select/i.test(target.tagName) || event.metaKey || event.ctrlKey) return
      if (event.key === 'c') {
        event.preventDefault()
        setModal({ mode: 'create', status: 'todo' })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function openModal(next: Exclude<ModalState, null>) {
    setOperationError(null)
    setModal(next)
  }

  const openCreate = (status: TaskStatus = 'todo') => openModal({ mode: 'create', status })
  const openEdit = (task: Task) => openModal({ mode: 'edit', task })

  const normalizedQuery = query.trim().toLowerCase()
  const visibleTasks = tasks
    .filter(
      (task) =>
        (priorityFilter === 'all' || task.priority === priorityFilter) &&
        (statusFilter === 'all' || task.status === statusFilter) &&
        (!normalizedQuery ||
          `${task.title} ${task.description ?? ''}`.toLowerCase().includes(normalizedQuery)),
    )
    .sort(compareTasks(sort))
  const doneTasks = tasks.filter((task) => task.status === 'done').length
  const isFiltering = normalizedQuery !== '' || priorityFilter !== 'all' || statusFilter !== 'all'

  return (
    <div className="app-shell">
      <Sidebar
        tasks={tasks}
        theme={theme}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />

      <main className="main-content" id="board">
        <Topbar total={tasks.length} done={doneTasks} onCreate={() => openCreate()} />
        <div className="board-content">
          <StatsBar tasks={tasks} />
          <Toolbar
            view={view}
            query={query}
            priorityFilter={priorityFilter}
            sort={sort}
            onViewChange={setView}
            onQueryChange={setQuery}
            onPriorityChange={setPriorityFilter}
            onSortChange={setSort}
          />

          {!supabase && (
            <div className="setup-notice">
              <span className="notice-icon" aria-hidden="true">i</span>
              <p>
                <strong>Preview mode.</strong> Tasks are saved in this browser.
                Add your Supabase credentials to enable guest accounts and cloud sync.
              </p>
              <a href="/README.md" target="_blank" rel="noreferrer">Setup guide <span aria-hidden="true">↗</span></a>
            </div>
          )}

          {isLoading && (
            <div className="status-banner loading-banner" role="status">
              <span className="spinner" aria-hidden="true" />
              <span>Loading your board…</span>
            </div>
          )}

          {error && (
            <div className="error-banner" role="alert">
              <span className="error-icon" aria-hidden="true">!</span>
              <div className="error-text">
                <strong>Couldn’t load your board</strong>
                <span>{error}</span>
              </div>
              <button className="retry-button" onClick={retry}>Try again</button>
            </div>
          )}

          {operationError && modal === null && (
            <div className="error-banner operation-error" role="alert">
              <span className="error-icon" aria-hidden="true">!</span>
              <div className="error-text">
                <strong>Something went wrong</strong>
                <span>{operationError}</span>
              </div>
              <button onClick={() => setOperationError(null)} aria-label="Dismiss error"><CloseIcon /></button>
            </div>
          )}

          {isFiltering && visibleTasks.length === 0 && !isLoading && (
            <p className="no-results">No tasks match your filters.</p>
          )}

          {view === 'list' ? (
            <ListView
              tasks={visibleTasks}
              statusFilter={statusFilter}
              onMove={moveTask}
              onOpen={openEdit}
            />
          ) : (
            <BoardView
              tasks={visibleTasks}
              statusFilter={statusFilter}
              isLoading={isLoading}
              onMove={moveTask}
              onCreate={openCreate}
              onOpen={openEdit}
            />
          )}
        </div>
      </main>

      {modal?.mode === 'create' && (
        <TaskModal
          initialStatus={modal.status}
          isSaving={isSaving}
          error={operationError}
          onSubmit={createTask}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.mode === 'edit' && (
        <TaskModal
          key={modal.task.id}
          task={modal.task}
          initialStatus={modal.task.status}
          isSaving={isSaving}
          error={operationError}
          onSubmit={(input) => updateTask(modal.task.id, input)}
          onDelete={() => deleteTask(modal.task.id)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

export default App
