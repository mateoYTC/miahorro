-- Mi Ahorro: crear las 5 tablas, activar RLS y crear las políticas
-- Copiar todo y ejecutar en Supabase > SQL Editor > New query > Run

-- ============ 1. TABLAS ============

-- Usuario: la contraseña no se guarda aquí, la guarda Supabase Auth (cifrada)
create table usuarios (
  id_usuario uuid primary key references auth.users(id) on delete cascade,
  nombre varchar(100) not null,
  correo varchar(150) not null unique
);

-- Cada usuario tiene sus propias categorías
create table categorias (
  id_categoria serial primary key,
  nombre_categoria varchar(50) not null,
  id_usuario uuid not null references usuarios(id_usuario) on delete cascade,
  unique (id_usuario, nombre_categoria)
);

create table gastos (
  id_gasto serial primary key,
  monto decimal(12,2) not null check (monto > 0),
  fecha date not null default current_date,
  descripcion varchar(200),
  id_categoria int not null references categorias(id_categoria),
  id_usuario uuid not null references usuarios(id_usuario) on delete cascade
);

create table ingresos (
  id_ingreso serial primary key,
  monto decimal(12,2) not null check (monto > 0),
  periodo varchar(50) not null,
  id_usuario uuid not null references usuarios(id_usuario) on delete cascade
);

create table metas_ahorro (
  id_meta_ahorro serial primary key,
  nombre_meta varchar(100) not null,
  monto_objetivo decimal(12,2) not null check (monto_objetivo > 0),
  monto_actual decimal(12,2) not null default 0,
  fecha_inicio date default current_date,
  fecha_fin date,
  id_usuario uuid not null references usuarios(id_usuario) on delete cascade
);

-- Las categorías iniciales las crea la app cuando el usuario se registra

-- ============ 3. SEGURIDAD (RLS) ============
alter table usuarios enable row level security;
alter table categorias enable row level security;
alter table gastos enable row level security;
alter table ingresos enable row level security;
alter table metas_ahorro enable row level security;

-- Cada usuario solo ve y modifica sus propios datos
create policy "usuarios_propios" on usuarios
  for all to authenticated
  using (id_usuario = auth.uid()) with check (id_usuario = auth.uid());

create policy "gastos_propios" on gastos
  for all to authenticated
  using (id_usuario = auth.uid()) with check (id_usuario = auth.uid());

create policy "ingresos_propios" on ingresos
  for all to authenticated
  using (id_usuario = auth.uid()) with check (id_usuario = auth.uid());

create policy "metas_propias" on metas_ahorro
  for all to authenticated
  using (id_usuario = auth.uid()) with check (id_usuario = auth.uid());

create policy "categorias_propias" on categorias
  for all to authenticated
  using (id_usuario = auth.uid()) with check (id_usuario = auth.uid());
