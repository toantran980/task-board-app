import type { TaskPriority, TaskStatus } from '../lib/tasks'

type IconProps = { size?: number }

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 16 16',
  fill: 'none',
  'aria-hidden': true,
})

export function StatusIcon({ status, size = 14 }: { status: TaskStatus } & IconProps) {
  const props = base(size)
  switch (status) {
    case 'todo':
      return (
        <svg {...props} stroke="currentColor" strokeWidth="1.6">
          <circle cx="8" cy="8" r="5.6" strokeDasharray="2.2 2.2" />
        </svg>
      )
    case 'in_progress':
      return (
        <svg {...props} stroke="currentColor" strokeWidth="1.6">
          <circle cx="8" cy="8" r="5.6" />
          <path d="M8 4.6a3.4 3.4 0 0 1 0 6.8z" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'in_review':
      return (
        <svg {...props} stroke="currentColor" strokeWidth="1.6">
          <circle cx="8" cy="8" r="5.6" />
          <path d="M8 4.6a3.4 3.4 0 1 1-3.4 3.4H8z" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'done':
      return (
        <svg {...props}>
          <circle cx="8" cy="8" r="6.4" fill="currentColor" />
          <path d="m5.2 8.2 2 2 3.6-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
  }
}

export function PriorityIcon({ priority }: { priority: TaskPriority }) {
  const level = priority === 'high' ? 3 : priority === 'normal' ? 2 : 1
  return (
    <svg {...base(14)} fill="currentColor">
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={2 + i * 4.2}
          y={10 - i * 3}
          width="2.6"
          height={4 + i * 3}
          rx="0.8"
          opacity={i < level ? 1 : 0.25}
        />
      ))}
    </svg>
  )
}

export function CalendarIcon() {
  return (
    <svg {...base(13)} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <rect x="2.4" y="3.2" width="11.2" height="10.4" rx="2" />
      <path d="M2.4 6.6h11.2M5.6 1.8v2.4M10.4 1.8v2.4" />
    </svg>
  )
}

export function PlusIcon({ size = 14 }: IconProps) {
  return (
    <svg {...base(size)} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M8 3.2v9.6M3.2 8h9.6" />
    </svg>
  )
}

export function BoardIcon() {
  return (
    <svg {...base(16)} stroke="currentColor" strokeWidth="1.4">
      <rect x="2" y="2.6" width="3.6" height="10.8" rx="1.2" />
      <rect x="6.4" y="2.6" width="3.6" height="7" rx="1.2" />
      <rect x="10.8" y="2.6" width="3.2" height="9" rx="1.2" />
    </svg>
  )
}

export function SearchIcon() {
  return (
    <svg {...base(14)} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="7" cy="7" r="4.2" />
      <path d="m10.2 10.2 3 3" />
    </svg>
  )
}

export function ListIcon() {
  return (
    <svg {...base(15)} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M5.5 4h8M5.5 8h8M5.5 12h8" />
      <circle cx="2.6" cy="4" r=".5" fill="currentColor" />
      <circle cx="2.6" cy="8" r=".5" fill="currentColor" />
      <circle cx="2.6" cy="12" r=".5" fill="currentColor" />
    </svg>
  )
}

export function SunIcon() {
  return (
    <svg {...base(15)} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="8" cy="8" r="2.8" />
      <path d="M8 1.6v1.4M8 13v1.4M1.6 8H3M13 8h1.4M3.5 3.5l1 1M11.5 11.5l1 1M12.5 3.5l-1 1M4.5 11.5l-1 1" />
    </svg>
  )
}

export function MoonIcon() {
  return (
    <svg {...base(15)} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
      <path d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8z" />
    </svg>
  )
}

export function CloseIcon() {
  return (
    <svg {...base(14)} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="m4 4 8 8M12 4l-8 8" />
    </svg>
  )
}
