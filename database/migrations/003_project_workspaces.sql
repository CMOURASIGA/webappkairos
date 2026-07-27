-- Cada projeto passa a ser um espaço de conhecimento isolado do KAIROS.
alter table projects add column if not exists objetivo text;
alter table projects add column if not exists contexto text;
alter table projects add column if not exists prompt_base text;

alter table conversations add column if not exists project_id uuid references projects(id) on delete set null;
alter table documents add column if not exists project_id uuid references projects(id) on delete cascade;
alter table instructions add column if not exists project_id uuid references projects(id) on delete cascade;
alter table memories add column if not exists project_id uuid references projects(id) on delete cascade;
alter table agent_executions add column if not exists project_id uuid references projects(id) on delete set null;

create index if not exists idx_conversations_project on conversations(project_id);
create index if not exists idx_documents_project on documents(project_id);
create index if not exists idx_instructions_project on instructions(project_id);
create index if not exists idx_memories_project on memories(project_id);
create index if not exists idx_agent_executions_project on agent_executions(project_id);
