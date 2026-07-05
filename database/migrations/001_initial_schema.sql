create extension if not exists "uuid-ossp";
create extension if not exists "vector";

create table if not exists profiles (
    id uuid primary key default uuid_generate_v4(),
    auth_user_id uuid unique not null,
    nome varchar(255) not null,
    email varchar(255) unique not null,
    avatar_url text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists conversations (
    id uuid primary key default uuid_generate_v4(),
    profile_id uuid not null references profiles(id) on delete cascade,
    titulo varchar(255),
    status varchar(30) default 'ACTIVE',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists messages (
    id uuid primary key default uuid_generate_v4(),
    conversation_id uuid not null references conversations(id) on delete cascade,
    role varchar(20) not null,
    content text not null,
    channel varchar(20) default 'text',
    metadata jsonb,
    tokens integer,
    model varchar(100),
    created_at timestamptz default now()
);

create index if not exists idx_messages_conversation on messages(conversation_id);

create table if not exists instructions (
    id uuid primary key default uuid_generate_v4(),
    profile_id uuid not null references profiles(id) on delete cascade,
    titulo varchar(255) not null,
    categoria varchar(100),
    conteudo text not null,
    prioridade integer default 5,
    ativo boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_instructions_profile on instructions(profile_id);

create table if not exists memories (
    id uuid primary key default uuid_generate_v4(),
    profile_id uuid not null references profiles(id) on delete cascade,
    tipo varchar(100),
    titulo varchar(255),
    conteudo text not null,
    importancia integer default 5,
    origem varchar(100),
    ativo boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_memories_profile on memories(profile_id);
create index if not exists idx_memories_tipo on memories(tipo);

create table if not exists documents (
    id uuid primary key default uuid_generate_v4(),
    profile_id uuid not null references profiles(id) on delete cascade,
    nome_arquivo varchar(255),
    mime_type varchar(100),
    tamanho bigint,
    storage_path text,
    status varchar(50) default 'PROCESSING',
    extraido_texto text,
    created_at timestamptz default now()
);

create index if not exists idx_documents_profile on documents(profile_id);

create table if not exists document_chunks (
    id uuid primary key default uuid_generate_v4(),
    document_id uuid not null references documents(id) on delete cascade,
    chunk_index integer,
    content text not null,
    metadata jsonb,
    embedding vector(3072),
    created_at timestamptz default now()
);

create index if not exists idx_document_chunks_document on document_chunks(document_id);

create table if not exists agent_executions (
    id uuid primary key default uuid_generate_v4(),
    profile_id uuid not null references profiles(id) on delete cascade,
    conversation_id uuid references conversations(id),
    pergunta text,
    contexto jsonb,
    resposta text,
    modelo varchar(100),
    tempo_execucao_ms integer,
    created_at timestamptz default now()
);

create table if not exists learned_knowledge (
    id uuid primary key default uuid_generate_v4(),
    profile_id uuid not null references profiles(id) on delete cascade,
    origem varchar(100),
    titulo varchar(255),
    conteudo text,
    confianca numeric(5,2),
    aprovado boolean default false,
    created_at timestamptz default now()
);

create table if not exists agent_settings (
    id uuid primary key default uuid_generate_v4(),
    profile_id uuid not null references profiles(id) on delete cascade,
    nome_agente varchar(100),
    personalidade text,
    modelo_chat varchar(100),
    modelo_embedding varchar(100),
    temperatura numeric(3,2) default 0.3,
    max_tokens integer default 4000,
    ativo boolean default true,
    memoria_ativa boolean default true,
    retencao_dias integer default 90,
    especialistas_ativos text[] default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists projects (
    id uuid primary key default uuid_generate_v4(),
    profile_id uuid not null references profiles(id) on delete cascade,
    nome varchar(255) not null,
    cliente varchar(255),
    descricao text,
    status varchar(50) default 'ACTIVE',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_projects_profile on projects(profile_id);

create table if not exists agents (
    id uuid primary key default uuid_generate_v4(),
    profile_id uuid not null references profiles(id) on delete cascade,
    nome varchar(255) not null,
    descricao text,
    prompt_base text,
    modelo varchar(100),
    ativo boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_agents_profile on agents(profile_id);

create or replace function match_document_chunks(
    query_embedding vector(3072),
    match_count int,
    p_profile_id uuid
)
returns table (
    id uuid,
    document_id uuid,
    chunk_index integer,
    content text,
    metadata jsonb,
    similarity float,
    document_name varchar(255)
)
language sql
as $$
    select
        dc.id,
        dc.document_id,
        dc.chunk_index,
        dc.content,
        dc.metadata,
        1 - (dc.embedding <=> query_embedding) as similarity,
        d.nome_arquivo as document_name
    from document_chunks dc
    inner join documents d on d.id = dc.document_id
    where d.profile_id = p_profile_id
      and dc.embedding is not null
    order by dc.embedding <=> query_embedding
    limit match_count;
$$;
