-- Correção de compatibilidade do Kanban e diagnóstico do pipeline documental.
-- Pode ser executada após a 004/005, inclusive se o ajuste manual 005a já foi aplicado.

alter table public.tasks add column if not exists status text;
alter table public.tasks drop constraint if exists tasks_status_check;
update public.tasks
set status = case lower(coalesce(status, 'todo'))
  when 'todo' then 'TODO'
  when 'in_progress' then 'IN_PROGRESS'
  when 'done' then 'DONE'
  else 'TODO'
end;
alter table public.tasks alter column status set default 'TODO';
alter table public.tasks alter column status set not null;
alter table public.tasks add constraint tasks_status_check check (status in ('TODO', 'IN_PROGRESS', 'DONE'));

alter table public.documents add column if not exists processing_error text;
