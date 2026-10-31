
-- 1. Borrar los gastos y las categorías viejas (las categorías viejas no tienen dueño)
delete from gastos;
delete from categorias;

-- 2. Cada categoría ahora pertenece a un usuario
alter table categorias
  add column id_usuario uuid not null references usuarios(id_usuario) on delete cascade;

-- 3. El nombre ya no es único para todos, sino único por usuario
alter table categorias drop constraint if exists categorias_nombre_categoria_key;
alter table categorias add constraint categorias_usuario_nombre_unico unique (id_usuario, nombre_categoria);

-- 4. Cada usuario solo ve y modifica sus propias categorías
drop policy if exists "categorias_autenticados" on categorias;
create policy "categorias_propias" on categorias
  for all to authenticated
  using (id_usuario = auth.uid()) with check (id_usuario = auth.uid());
