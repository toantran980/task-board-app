import { useEffect, useState } from 'react'
import type { Task, TaskPriority, TaskStatus } from '../lib/tasks'
import { getGuestUser, supabase } from '../lib/supabase'
import { readLocalTasks, saveLocalTasks, taskFields } from '../lib/tasks'

export type TaskInput = {
  title: string
  status: TaskStatus
  description: string
  priority: TaskPriority
  due_date: string
}

function toFields(input: TaskInput) {
  return {
    title: input.title,
    status: input.status,
    description: input.description.trim() || null,
    priority: input.priority,
    due_date: input.due_date || null,
  }
}

// Review helper: open the app with ?demo=loading, ?demo=error or ?demo=save-error
// to see those states without breaking the real connection.
const demoState = new URLSearchParams(window.location.search).get('demo')

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [operationError, setOperationError] = useState<string | null>(null)
  const [retryToken, setRetryToken] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function loadTasks() {
      setIsLoading(true)
      setError(null)

      try {
        if (demoState === 'loading') return
        if (demoState === 'error') {
          throw new Error('Could not reach the server. Check your connection and try again.')
        }

        if (!supabase) {
          const localTasks = readLocalTasks()
          if (isMounted) setTasks(localTasks)
          return
        }

        const user = await getGuestUser()
        const { data, error: loadError } = await supabase
          .from('tasks')
          .select(taskFields)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (loadError) throw loadError
        if (isMounted) {
          setUserId(user.id)
          setTasks(data ?? [])
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Something went wrong while loading your board.',
          )
        }
      } finally {
        if (isMounted && demoState !== 'loading') setIsLoading(false)
      }
    }

    void loadTasks()
    return () => {
      isMounted = false
    }
  }, [retryToken])

  // Runs a save action with shared busy/error handling. 
  // Resolves true on success so the caller (a dialog) knows whether it can close.
  async function runSave(action: () => Promise<void>, failureMessage: string) {
    setIsSaving(true)
    setOperationError(null)
    try {
      if (demoState === 'save-error') throw new Error('Could not save your changes. Please try again.')
      await action()
      return true
    } catch (saveError) {
      setOperationError(saveError instanceof Error ? saveError.message : failureMessage)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  function requireUserId() {
    if (!userId) throw new Error('Your guest session is not ready. Try reloading the board.')
    return userId
  }

  function createTask(input: TaskInput) {
    return runSave(async () => {
      const fields = toFields(input)
      if (supabase) {
        const { data, error: insertError } = await supabase
          .from('tasks')
          .insert({ ...fields, user_id: requireUserId() })
          .select(taskFields)
          .single()

        if (insertError) throw insertError
        setTasks((current) => [...current, data])
      } else {
        const task: Task = {
          ...fields,
          id: crypto.randomUUID(),
          user_id: 'local-preview',
          created_at: new Date().toISOString(),
        }
        const updated = [...tasks, task]
        saveLocalTasks(updated)
        setTasks(updated)
      }
    }, 'Your task could not be created. Please try again.')
  }

  function updateTask(taskId: string, input: TaskInput) {
    return runSave(async () => {
      const fields = toFields(input)
      if (supabase) {
        const { data, error: updateError } = await supabase
          .from('tasks')
          .update(fields)
          .eq('id', taskId)
          .eq('user_id', requireUserId())
          .select(taskFields)
          .single()

        if (updateError) throw updateError
        setTasks((current) => current.map((task) => (task.id === taskId ? data : task)))
      } else {
        const updated = tasks.map((task) => (task.id === taskId ? { ...task, ...fields } : task))
        saveLocalTasks(updated)
        setTasks(updated)
      }
    }, 'Your changes could not be saved. Please try again.')
  }

  function deleteTask(taskId: string) {
    return runSave(async () => {
      if (supabase) {
        const { error: deleteError } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId)
          .eq('user_id', requireUserId())

        if (deleteError) throw deleteError
        setTasks((current) => current.filter((task) => task.id !== taskId))
      } else {
        const updated = tasks.filter((task) => task.id !== taskId)
        saveLocalTasks(updated)
        setTasks(updated)
      }
    }, 'The task could not be deleted. Please try again.')
  }

  async function moveTask(taskId: string, status: TaskStatus) {
    const task = tasks.find((currentTask) => currentTask.id === taskId)
    if (!task || task.status === status) return
    setOperationError(null)

    const previousStatus = task.status
    const applyStatus = (next: TaskStatus) =>
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === taskId ? { ...currentTask, status: next } : currentTask,
        ),
      )

    // Optimistic update so the card lands instantly, rolled back if saving fails.
    applyStatus(status)

    try {
      if (supabase) {
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ status })
          .eq('id', taskId)
          .eq('user_id', userId ?? '')

        if (updateError) throw updateError
      } else {
        saveLocalTasks(
          tasks.map((currentTask) =>
            currentTask.id === taskId ? { ...currentTask, status } : currentTask,
          ),
        )
      }
    } catch (moveError) {
      applyStatus(previousStatus)
      setOperationError(
        moveError instanceof Error
          ? moveError.message
          : 'The task could not be moved. Please try again.',
      )
    }
  }

  return {tasks,
    isLoading,
    isSaving,
    error,
    operationError,
    setOperationError,
    retry: () => setRetryToken((token) => token + 1),
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  }
}
