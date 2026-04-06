-- Micropigmentação App — Schema Supabase
-- Executar no SQL Editor do Supabase

-- Clientes
create table clientes (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  telefone text,
  email text,
  idade text,
  notas text,
  criado_em timestamp with time zone default now()
);

-- Checklists (associadas a clientes)
create table checklists (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references clientes(id) on delete cascade not null,
  tipo_procedimento text not null, -- pixelbrows | nanoblading | labios
  dados jsonb not null default '{}',
  criado_em timestamp with time zone default now()
);

-- Procedimentos
create table procedimentos (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references clientes(id) on delete cascade not null,
  tipo text not null,
  data timestamp with time zone default now(),
  notas text,
  estado text default 'pendente'
);

-- Fotos
create table fotos (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references clientes(id) on delete cascade not null,
  procedimento_id uuid references procedimentos(id) on delete set null,
  url text not null,
  tipo text not null, -- avaliacao | pos_imediato | cicatrizado | editada | estudo
  criado_em timestamp with time zone default now()
);

-- Anamneses
create table anamneses (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references clientes(id) on delete cascade not null,
  respostas jsonb not null default '{}',
  tipo_procedimento text not null,
  consentimento_assinado boolean default false,
  criado_em timestamp with time zone default now()
);

-- Cuidados enviados
create table cuidados_enviados (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references clientes(id) on delete cascade not null,
  tipo_procedimento text not null,
  enviado_por text, -- email | whatsapp
  criado_em timestamp with time zone default now()
);

-- Portfolio (clientes-referência para mostrar resultados)
create table portfolio (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  tipo_procedimento text not null,
  criado_em timestamp with time zone default now()
);

create table portfolio_fotos (
  id uuid default gen_random_uuid() primary key,
  portfolio_id uuid references portfolio(id) on delete cascade not null,
  url text not null,
  tipo text not null, -- antes | depois | pos_imediato | cicatrizado
  criado_em timestamp with time zone default now()
);

-- Storage bucket para fotos
-- Criar manualmente no Supabase Dashboard: Storage → New Bucket → "fotos" (público)

-- RLS (Row Level Security) — desactivado por agora (utilizadora única)
alter table clientes enable row level security;
create policy "Acesso total clientes" on clientes for all using (true) with check (true);

alter table checklists enable row level security;
create policy "Acesso total checklists" on checklists for all using (true) with check (true);

alter table procedimentos enable row level security;
create policy "Acesso total procedimentos" on procedimentos for all using (true) with check (true);

alter table fotos enable row level security;
create policy "Acesso total fotos" on fotos for all using (true) with check (true);

alter table anamneses enable row level security;
create policy "Acesso total anamneses" on anamneses for all using (true) with check (true);

alter table cuidados_enviados enable row level security;
create policy "Acesso total cuidados_enviados" on cuidados_enviados for all using (true) with check (true);

alter table portfolio enable row level security;
create policy "Acesso total portfolio" on portfolio for all using (true) with check (true);

alter table portfolio_fotos enable row level security;
create policy "Acesso total portfolio_fotos" on portfolio_fotos for all using (true) with check (true);
