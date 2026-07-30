-- Reparo autocontido do detalhe do card Kanban.
-- Pode ser aplicado com segurança mesmo que a migration 005 ou 007 tenha sido executada parcialmente.

create table if not exists public.task_labels (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  color text not null default '#0ea5e9',
  created_at timestamptz not null default now()
);

create table if not exists public.task_members (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  member_name text not null,
  role text not null default 'responsavel',
  created_at timestamptz not null default now(),
  unique(task_id, member_name)
);

create table if not exists public.task_checklists (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null default 'Checklist',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.task_checklist_items (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  checklist_id uuid references public.task_checklists(id) on delete cascade,
  content text not null,
  done boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  author_name text,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.task_activity_log (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  action_type text not null,
  action_detail text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_task_labels_task on public.task_labels(task_id);
create index if not exists idx_task_members_task on public.task_members(task_id);
create index if not exists idx_task_checklists_task on public.task_checklists(task_id, position);
create index if not exists idx_task_checklist_items_task on public.task_checklist_items(task_id, position);
create index if not exists idx_task_comments_task on public.task_comments(task_id, created_at desc);
create index if not exists idx_task_activity_log_task on public.task_activity_log(task_id, created_at desc);
