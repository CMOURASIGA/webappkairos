-- Workspace completo de cada card Kanban.
-- Compatível com as migrations 004, 005 e 006 já aplicadas.

create table if not exists task_labels (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  color text not null default '#0ea5e9',
  created_at timestamptz not null default now()
);

create table if not exists task_members (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  member_name text not null,
  role text not null default 'responsavel',
  created_at timestamptz not null default now(),
  unique(task_id, member_name)
);

create table if not exists task_checklists (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  title text not null default 'Checklist',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table task_checklist_items
  add column if not exists checklist_id uuid references task_checklists(id) on delete cascade;

alter table task_comments
  add column if not exists updated_at timestamptz,
  add column if not exists author_name text;

alter table task_attachments
  add column if not exists document_id uuid references documents(id) on delete set null;

create index if not exists idx_task_labels_task on task_labels(task_id);
create index if not exists idx_task_members_task on task_members(task_id);
create index if not exists idx_task_checklists_task on task_checklists(task_id, position);
create index if not exists idx_task_checklist_items_checklist on task_checklist_items(checklist_id, position);
create unique index if not exists uq_task_attachments_task_document
  on task_attachments(task_id, document_id) where document_id is not null;
