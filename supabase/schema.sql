-- Presupuestos de Taller — esquema inicial
-- Pega y ejecuta este script en Supabase: Panel del proyecto -> SQL Editor -> New query

-- 1. Perfiles de mecánico/taller (complementa a auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_taller text not null,
  telefono text,
  created_at timestamptz not null default now()
);

-- 2. Estado del presupuesto
create type budget_status as enum ('pendiente', 'aprobado', 'rechazado');

-- 3. Presupuestos (cabecera)
create table budgets (
  id uuid primary key default gen_random_uuid(),
  mechanic_id uuid not null references profiles(id) on delete cascade,
  public_token uuid not null default gen_random_uuid(),
  cliente_nombre text not null,
  cliente_telefono text,
  vehiculo_marca text,
  vehiculo_modelo text,
  vehiculo_matricula text,
  foto_url text,
  notas text,
  status budget_status not null default 'pendiente',
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create index budgets_mechanic_id_idx on budgets (mechanic_id);
create unique index budgets_public_token_idx on budgets (public_token);

-- 4. Conceptos de cada presupuesto
create table budget_items (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references budgets(id) on delete cascade,
  descripcion text not null,
  cantidad numeric not null default 1,
  precio_unitario numeric not null,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

create index budget_items_budget_id_idx on budget_items (budget_id);

-- 5. Row Level Security: activar en las 3 tablas
alter table profiles enable row level security;
alter table budgets enable row level security;
alter table budget_items enable row level security;

-- --- Políticas: profiles ---
-- Cada mecánico solo ve y edita su propia fila de perfil
create policy "profiles: select own"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles: insert own"
  on profiles for insert
  with check (auth.uid() = id);

create policy "profiles: update own"
  on profiles for update
  using (auth.uid() = id);

-- --- Políticas: budgets ---
-- El mecánico autenticado gestiona (lee/crea/edita) solo sus propios presupuestos
create policy "budgets: mechanic select own"
  on budgets for select
  using (auth.uid() = mechanic_id);

create policy "budgets: mechanic insert own"
  on budgets for insert
  with check (auth.uid() = mechanic_id);

create policy "budgets: mechanic update own"
  on budgets for update
  using (auth.uid() = mechanic_id);

-- Nota: NO añadimos aquí ninguna política de "lectura pública", porque una política
-- RLS no puede condicionarse al valor que el cliente escriba en su propia consulta
-- (eso sería confiar en el cliente). El acceso del cliente sin login al presupuesto
-- por su public_token lo daremos mediante una función `security definer` dedicada,
-- que crearemos cuando construyamos la pantalla pública — de momento budgets/budget_items
-- solo son accesibles por su mecánico dueño.

-- --- Políticas: budget_items ---
create policy "budget_items: mechanic select own"
  on budget_items for select
  using (
    exists (
      select 1 from budgets
      where budgets.id = budget_items.budget_id
      and budgets.mechanic_id = auth.uid()
    )
  );

create policy "budget_items: mechanic insert own"
  on budget_items for insert
  with check (
    exists (
      select 1 from budgets
      where budgets.id = budget_items.budget_id
      and budgets.mechanic_id = auth.uid()
    )
  );

create policy "budget_items: mechanic update own"
  on budget_items for update
  using (
    exists (
      select 1 from budgets
      where budgets.id = budget_items.budget_id
      and budgets.mechanic_id = auth.uid()
    )
  );

create policy "budget_items: mechanic delete own"
  on budget_items for delete
  using (
    exists (
      select 1 from budgets
      where budgets.id = budget_items.budget_id
      and budgets.mechanic_id = auth.uid()
    )
  );

-- 6. Crear automáticamente un "profile" cuando alguien se registra en auth.users
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nombre_taller)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre_taller', 'Mi taller'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
