import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

let guestUserPromise: Promise<User> | null = null

export function getGuestUser(): Promise<User> {
  if (!supabase) {
    return Promise.reject(new Error('Supabase is not configured.'))
  }
  if (guestUserPromise) return guestUserPromise

  const currentClient = supabase
  const promise = createOrRestoreGuestUser(currentClient)
  guestUserPromise = promise
  void promise.catch(() => {
    if (guestUserPromise === promise) guestUserPromise = null
  })
  return promise
}

async function createOrRestoreGuestUser(client: NonNullable<typeof supabase>) {
  const { data: sessionData, error: sessionError } = await client.auth.getSession()
  if (sessionError) throw sessionError
  if (sessionData.session?.user) return sessionData.session.user

  const { data, error } = await client.auth.signInAnonymously()
  if (error) throw error
  if (!data.user) throw new Error('Guest sign-in did not return a user.')
  return data.user
}
