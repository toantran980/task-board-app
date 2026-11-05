-- Optional demo data. Run in the Supabase SQL Editor after creating at least one
-- task in the app: the rows are attached to the guest who owns the newest task.
insert into public.tasks (title, description, status, priority, due_date, user_id)
select t.title, t.description, t.status, t.priority, t.due_date, owner.user_id
from (select user_id from public.tasks order by created_at desc limit 1) as owner,
(values
  ('Design onboarding flow', 'Sketch the first-run experience and empty states.', 'todo', 'high', current_date + 3),
  ('Write launch announcement', 'Draft the blog post and social copy for v1.', 'todo', 'normal', current_date + 6),
  ('Set up analytics events', null, 'todo', 'low', null),
  ('Audit color contrast', 'Check text and chips against WCAG AA in both themes.', 'todo', 'normal', null),
  ('Fix login redirect bug', 'Users land on a blank page after the guest session starts.', 'in_progress', 'high', current_date - 1),
  ('Build search and filters', 'Title search plus a priority filter on the board.', 'in_progress', 'normal', current_date + 2),
  ('Add drag-and-drop animations', null, 'in_progress', 'low', null),
  ('Review pricing page copy', 'Check tone and typos before it goes out.', 'in_review', 'normal', current_date + 1),
  ('Review RLS policies', 'Confirm users can only touch their own rows.', 'in_review', 'high', null),
  ('Create Supabase schema', 'Tasks table, constraints, and RLS policies.', 'done', 'high', current_date - 5),
  ('Set up project and tooling', 'Vite, React, TypeScript, and linting.', 'done', 'normal', null),
  ('Pick a color palette', null, 'done', 'low', null)
) as t(title, description, status, priority, due_date);
