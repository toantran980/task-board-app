export function formatDueDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(
    new Date(year, month - 1, day),
  )
}

