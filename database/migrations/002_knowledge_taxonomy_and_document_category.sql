create table if not exists knowledge_taxonomies (
    id uuid primary key default uuid_generate_v4(),
    scope varchar(50) not null,
    code varchar(100) not null,
    label varchar(255) not null,
    sort_order integer default 0,
    active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (scope, code)
);

create index if not exists idx_knowledge_taxonomies_scope on knowledge_taxonomies(scope);

alter table documents
add column if not exists categoria varchar(100);

create index if not exists idx_documents_categoria on documents(categoria);

