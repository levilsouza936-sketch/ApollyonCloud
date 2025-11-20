-- =============================================================================
-- SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS - APOLLYON CLOUD
-- Rode este script no SQL Editor do Supabase
-- =============================================================================

-- 1. TABELA DE PERFIS (PROFILES)
-- Vincula dados extras ao usuário do Supabase Auth
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  discord_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Segurança para Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Trigger para criar profile automaticamente ao se cadastrar
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, discord_id)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'provider_id');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. TABELA DE PRODUTOS (PRODUCTS)
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric not null, -- Preço em Reais
  features text[], -- Lista de funcionalidades
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Produtos são públicos para leitura, mas apenas admins editam (via dashboard do supabase)
alter table public.products enable row level security;

create policy "Products are viewable by everyone."
  on products for select
  using ( true );

-- 3. TABELA DE PEDIDOS (ORDERS)
-- Registra a intenção de compra ou o pagamento
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  product_id uuid references public.products(id) not null,
  status text default 'pending', -- pending, approved, rejected
  payment_id text, -- ID do pagamento no Mercado Pago
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Usuário vê apenas seus pedidos
alter table public.orders enable row level security;

create policy "Users can view own orders."
  on orders for select
  using ( auth.uid() = user_id );

-- 4. TABELA DE ASSINATURAS (SUBSCRIPTIONS)
-- Controla o acesso ativo
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  product_id uuid references public.products(id) not null,
  status text default 'active', -- active, expired, cancelled
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Usuário vê apenas suas assinaturas
alter table public.subscriptions enable row level security;

create policy "Users can view own subscriptions."
  on subscriptions for select
  using ( auth.uid() = user_id );

-- 5. DADOS INICIAIS (SEED DATA)
insert into public.products (name, description, price, features)
values
  ('Standard', 'Máquina Virtual Básica para Jogos Leves', 49.90, ARRAY['4 vCPU', '8GB RAM', 'GTX 1060', 'Acesso 24/7']),
  ('Elite', 'Máquina Virtual Premium para Jogos Pesados', 89.90, ARRAY['8 vCPU', '16GB RAM', 'RTX 3060', 'Acesso 24/7', 'Prioridade na Fila']);

-- FIM DO SCRIPT
