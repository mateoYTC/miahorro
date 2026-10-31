import { supabase } from '../lib/supabase';

// Cada usuario tiene sus propias categorías, por eso todas las funciones usan su id

export const obtenerCategorias = (idUsuario: string) => {
  return supabase.from('categorias').select('*').eq('id_usuario', idUsuario).order('nombre_categoria');
};

export const crearCategoria = (idUsuario: string, nombre: string) => {
  return supabase.from('categorias').insert({ nombre_categoria: nombre, id_usuario: idUsuario });
};

export const editarCategoria = (id: number, nombre: string) => {
  return supabase.from('categorias').update({ nombre_categoria: nombre }).eq('id_categoria', id);
};

export const eliminarCategoria = (id: number) => {
  return supabase.from('categorias').delete().eq('id_categoria', id);
};

// Se llama al registrarse para que el usuario nuevo no empiece sin categorías
export const crearCategoriasIniciales = (idUsuario: string) => {
  const nombres = ['Alimentación', 'Transporte', 'Entretenimiento', 'Servicios', 'Otros'];
  return supabase.from('categorias').insert(nombres.map((nombre) => ({ nombre_categoria: nombre, id_usuario: idUsuario })));
};

// Busca la categoría "Ahorro" del usuario (la usan los abonos a metas) y si no existe la crea
export const obtenerCategoriaAhorro = async (idUsuario: string) => {
  const buscada = await supabase
    .from('categorias')
    .select('*')
    .eq('id_usuario', idUsuario)
    .eq('nombre_categoria', 'Ahorro')
    .maybeSingle();
  if (buscada.error) return { id: null, error: buscada.error };
  if (buscada.data) return { id: buscada.data.id_categoria as number, error: null };

  const creada = await supabase
    .from('categorias')
    .insert({ nombre_categoria: 'Ahorro', id_usuario: idUsuario })
    .select()
    .single();
  return { id: (creada.data?.id_categoria ?? null) as number | null, error: creada.error };
};
