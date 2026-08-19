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

create policy "budgets: mechanic delete own"
  on budgets for delete
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

-- 7. Acceso público controlado (pantalla del cliente, sin login)
--
-- budgets/budget_items solo son legibles por su mecánico dueño (RLS arriba).
-- Para que el cliente vea SU presupuesto sin login, usamos funciones
-- `security definer`: se ejecutan con permisos elevados (las crea el dueño
-- del proyecto, que sí puede saltarse RLS), pero cada función solo devuelve
-- o modifica la fila cuyo public_token coincide exactamente con el que
-- llega por parámetro. El cliente nunca puede listar ni tocar otra fila.

create or replace function public.get_public_budget(p_token uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'cliente_nombre', b.cliente_nombre,
    'vehiculo_marca', b.vehiculo_marca,
    'vehiculo_modelo', b.vehiculo_modelo,
    'vehiculo_matricula', b.vehiculo_matricula,
    'foto_url', b.foto_url,
    'notas', b.notas,
    'status', b.status,
    'created_at', b.created_at,
    'decided_at', b.decided_at,
    'nombre_taller', p.nombre_taller,
    'items', coalesce(
      (select jsonb_agg(
          jsonb_build_object(
            'id', i.id,
            'descripcion', i.descripcion,
            'cantidad', i.cantidad,
            'precio_unitario', i.precio_unitario
          ) order by i.orden
        )
       from budget_items i
       where i.budget_id = b.id),
      '[]'::jsonb
    )
  )
  from budgets b
  join profiles p on p.id = b.mechanic_id
  where b.public_token = p_token;
$$;

grant execute on function public.get_public_budget(uuid) to anon, authenticated;

create or replace function public.respond_public_budget(p_token uuid, p_decision text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status budget_status;
begin
  if p_decision not in ('aprobado', 'rechazado') then
    raise exception 'Decisión inválida';
  end if;

  -- El "where status = 'pendiente'" es lo que evita que alguien reenvíe la
  -- petición y cambie de aprobado a rechazado (o al revés) después de decidir.
  update budgets
    set status = p_decision::budget_status,
        decided_at = now()
    where public_token = p_token
      and status = 'pendiente'
    returning status into v_status;

  if v_status is null then
    return jsonb_build_object('ok', false);
  end if;

  return jsonb_build_object('ok', true, 'status', v_status);
end;
$$;

grant execute on function public.respond_public_budget(uuid, text) to anon, authenticated;

-- 8. Storage para la foto del vehículo
--
-- Bucket público: cualquiera con la URL puede VER una foto (el cliente la
-- necesita ver sin login), pero solo un mecánico autenticado puede SUBIR
-- una foto, y solo dentro de su propia carpeta (la primera parte de la
-- ruta del archivo debe ser su propio user id) — así un mecánico no puede
-- sobrescribir ni borrar fotos de otro mecánico.

insert into storage.buckets (id, name, public)
values ('vehiculo-fotos', 'vehiculo-fotos', true)
on conflict (id) do nothing;

create policy "vehiculo-fotos: mechanic insert own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'vehiculo-fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "vehiculo-fotos: mechanic update own folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'vehiculo-fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "vehiculo-fotos: mechanic delete own folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'vehiculo-fotos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 9. Trabajo terminado
--
-- `status` (pendiente/aprobado/rechazado) es la DECISIÓN DEL CLIENTE, y la
-- pone la pantalla pública — no la toca el mecánico directamente. Esta
-- columna nueva es distinta: es el propio mecánico marcando que ya hizo
-- el trabajo de un presupuesto aprobado. Solo tiene sentido cuando
-- status = 'aprobado'; se usa para separar "aprobado, en curso" de
-- "aprobado y ya entregado" en el panel del mecánico.
alter table budgets
  add column trabajo_terminado boolean not null default false;
