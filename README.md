# Tasktide

A responsive Kanban board for managing tasks across To do, In progress, In review, and Done. It includes guest sign-in, user-scoped Supabase storage with row-level security, task management, and drag-and-drop status changes.

## Run locally

1. Install Node.js 20.19+ or 22.12+.
2. Run `npm install`.
3. Run `npm run dev` and open the local URL printed by Vite.

Without Supabase credentials the app runs in **Local preview** mode and stores tasks in this browser only. To turn on cloud sync:

1. Create a Supabase project and enable **Anonymous Sign-Ins** in the project's Auth settings.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql).
3. Copy `env.example` to `.env` and fill in the project's URL and public anon key:

   ```Shell
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

   Both values are in Supabase under Project Settings → API. When deploying, add the same two variables in the host's environment settings.
4. Restart the dev server.

Only the public anon key belongs in the frontend. Never put a Supabase service-role key in `.env.local` or commit credentials.

## Features

**Core**

- Four columns: To do, In progress, In review, Done
- Create, edit, and delete tasks (title, description, priority, due date)
- Drag tasks between columns (drag and drop), or use the card's "move to" selector
- Optimistic moves with rollback if the save fails
- Anonymous guest sign-in, each guest only sees their own tasks via RLS
- Loading, empty, local-preview, and error states (preview them with `/?demo=loading`, `/?demo=error`, `/?demo=save-error`)

**Advanced features**

- **Due-date indicators:** optional due date per task. A card shows an amber chip when due within 2 days and a red "Overdue" chip when past due. Done tasks stay neutral.
- **Search and filtering:** the search bar matches title and description as you type. The priority filter and the sidebar status filters combine with it, in both Board and List views.
- **Sorting:** order tasks by newest first (default), due date, or priority. Tasks without a due date sort last.
- **Board stats:** total, completed, and overdue counts above the board, plus a progress bar in the header.
- Edit and delete from the task dialog
- Board and List views, light and dark theme.

## Database

[`supabase/schema.sql`](./supabase/schema.sql) creates the `tasks` table with RLS enabled and select, insert, update, and delete policies that check `auth.uid() = user_id`. [`supabase/seed.sql`](./supabase/seed.sql) optionally adds 12 demo tasks for screenshots.

## Tradeoffs

- **Guest sessions are per browser.** Anonymous sign-in needs no signup, but clearing site data or switching browsers starts a fresh, empty board.
- **Optimistic moves.** Dragging updates the UI instantly and rolls back with an error banner if the save fails, trading strict consistency for a snappier feel.
- **Native drag and drop** instead of a library keeps the bundle small and the code simple, but it has no touch support and no drop-position ordering within a column. The card's "move to" selector covers touch.
- **No realtime sync.** Changes from another tab or device appear after a refresh.
- **Search and filters run client-side** over the already-loaded tasks, which is fine current state.
- **No Go backend.** The React app talks to Supabase directly, with RLS enforcing access.

## What I'd improve with more time

- Assignees, labels, comments, and an activity log.
- Reordering cards within a column, with a stored position.
- Touch-friendly drag and drop.
- Realtime updates through Supabase Realtime.
- Real accounts (email or OAuth) so a board survives across devices.
- Automated tests for the task hook and RLS policies.
- A Go API layer, if the app needed server-side business logic.
