-- Camada operacional PMO por projeto. Execute após 003_project_workspaces.sql.
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(), profile_id uuid not null references profiles(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade, titulo text not null, descricao text,
  status text not null default 'TODO' check (status in ('TODO','IN_PROGRESS','DONE')),
  prioridade text not null default 'MEDIUM' check (prioridade in ('LOW','MEDIUM','HIGH','CRITICAL')),
  responsavel text, prazo date, created_at timestamptz not null default now()
);
create table if not exists decisions (
  id uuid primary key default gen_random_uuid(), profile_id uuid not null references profiles(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade, titulo text not null, descricao text,
  status text not null default 'OPEN' check (status in ('OPEN','DECIDED','REVIEW')), created_at timestamptz not null default now()
);
create table if not exists risks (
  id uuid primary key default gen_random_uuid(), profile_id uuid not null references profiles(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade, titulo text not null, descricao text,
  impacto text not null default 'MEDIUM' check (impacto in ('LOW','MEDIUM','HIGH','CRITICAL')),
  probabilidade text not null default 'MEDIUM' check (probabilidade in ('LOW','MEDIUM','HIGH')),
  mitigacao text, status text not null default 'OPEN' check (status in ('OPEN','MITIGATED','CLOSED')), created_at timestamptz not null default now()
);
create index if not exists idx_tasks_project on tasks(project_id);
create index if not exists idx_decisions_project on decisions(project_id);
create index if not exists idx_risks_project on risks(project_id);
