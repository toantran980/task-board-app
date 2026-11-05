import type { Task, TaskStatus } from '../lib/tasks'
import { supabase } from '../lib/supabase'
import { columns } from '../lib/tasks'
import { BoardIcon, MoonIcon, StatusIcon, SunIcon } from './icons'

type Props = {
  tasks: Task[]
  statusFilter: TaskStatus | 'all'
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onStatusFilter: (status: TaskStatus | 'all') => void
}

export function Sidebar({ tasks, statusFilter, theme, onToggleTheme, onStatusFilter }: Props) {
  return (
    <aside className="sidebar">
      <div className="workspace-switcher">
        <button
          className="icon-button theme-toggle"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title="Toggle theme"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>


      <div className="sidebar-section-label">Workspace</div>
      <nav className="main-nav" aria-label="Main navigation">
        <button
          className={`nav-item${statusFilter === 'all' ? ' active' : ''}`}
          onClick={() => onStatusFilter('all')}
        >
          <BoardIcon />
          <span>My board</span>
          <span className="nav-count">{tasks.length}</span>
        </button>
      </nav>

      <div className="sidebar-section-label">Status</div>
      <div className="main-nav">
        {columns.map((column) => (
          <button
            className={`nav-item status-${column.id}${statusFilter === column.id ? ' active' : ''}`}
            key={column.id}
            onClick={() => onStatusFilter(statusFilter === column.id ? 'all' : column.id)}
          >
            <span className="nav-status"><StatusIcon status={column.id} /></span>
            <span>{column.label}</span>
            <span className="nav-count">{tasks.filter((task) => task.status === column.id).length}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-bottom">
        <span className="user-avatar" title="Guest account">G</span>
        <span className="sidebar-user">
          <strong>Guest</strong>
          <small>{supabase ? 'Synced to cloud' : 'Local preview'}</small>
        </span>
      </div>
    </aside>
  )
}
