-- Atividades do projeto: Kanban e detalhe operacional de cada card.
-- Execute depois da 004_pmo_workspace.sql.

alter table tasks
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists position integer not null default 0,
  add column if not exists labels text[] not null default '{}';

create index if not exists idx_tasks_project_status_position
  on tasks(project_id, status, position);

create table if not exists task_checklist_items (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  content text not null,
  done boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  document_id uuid references documents(id) on delete set null,
  file_name text not null,
  storage_path text,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table if not exists task_activity_log (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  action_type text not null,
  action_detail text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_task_checklist_items_task on task_checklist_items(task_id, position);
create index if not exists idx_task_comments_task on task_comments(task_id, created_at desc);
create index if not exists idx_task_attachments_task on task_attachments(task_id, created_at desc);
create index if not exists idx_task_activity_log_task on task_activity_log(task_id, created_at desc);
