import type { TaskPriority } from '../lib/tasks'
import { BoardIcon, ListIcon, PlusIcon, SearchIcon } from './icons'

export type View = 'board' | 'list'
export type PriorityFilter = 'all' | TaskPriority
export type SortKey = 'newest' | 'due' | 'priority'

const sortOptions: { id: SortKey; label: string }[] = [
  { id: 'newest', label: 'Newest first' },
  { id: 'due', label: 'Due date' },
  { id: 'priority', label: 'Priority' },
]

type TopbarProps = {
  total: number
  done: number
  onCreate: () => void
}

export function Topbar({ total, done, onCreate }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="breadcrumbs">
        <BoardIcon />
        <strong>My board</strong>
        <span className="board-subtitle">Plan, track and ship your work</span>
      </div>
      <div className="topbar-right">
        <span className="progress" title={`${done} of ${total} done`}>
          <span className="progress-track">
            <span
              className="progress-fill"
              style={{ width: total ? `${(done / total) * 100}%` : '0%' }}
            />
          </span>
          {done}/{total} done
        </span>
        <button className="primary-button" onClick={onCreate}>
          <PlusIcon /> New task
        </button>
      </div>
    </header>
  )
}

type ToolbarProps = {
  view: View
  query: string
  priorityFilter: PriorityFilter
  sort: SortKey
  onViewChange: (view: View) => void
  onQueryChange: (query: string) => void
  onPriorityChange: (priority: PriorityFilter) => void
  onSortChange: (sort: SortKey) => void
}

const priorityOptions: { id: PriorityFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'high', label: 'High' },
  { id: 'normal', label: 'Normal' },
  { id: 'low', label: 'Low' },
]

export function Toolbar({
  view,
  query,
  priorityFilter,
  sort,
  onViewChange,
  onQueryChange,
  onPriorityChange,
  onSortChange,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="view-tabs" role="tablist" aria-label="View">
        <button role="tab" aria-selected={view === 'board'} className={view === 'board' ? 'active' : ''} onClick={() => onViewChange('board')}>
          <BoardIcon /> Board
        </button>
        <button role="tab" aria-selected={view === 'list'} className={view === 'list' ? 'active' : ''} onClick={() => onViewChange('list')}>
          <ListIcon /> List
        </button>
      </div>
      <label className="search-box">
        <SearchIcon />
        <input
          type="search"
          placeholder="Search tasks"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          aria-label="Search tasks"
        />
      </label>
      <div className="filter-pills" role="group" aria-label="Filter by priority">
        {priorityOptions.map((option) => (
          <button
            key={option.id}
            className={priorityFilter === option.id ? 'active' : ''}
            aria-pressed={priorityFilter === option.id}
            onClick={() => onPriorityChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <label className="sort-select">
        <span>Sort</span>
        <select value={sort} onChange={(event) => onSortChange(event.target.value as SortKey)}>
          {sortOptions.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </label>
    </div>
  )
}
