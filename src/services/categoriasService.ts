import { supabase } from '../lib/supabase';

export const obtenerCategorias = () => {
  return supabase.from('categorias').select('*').order('nombre_categoria');
};

export const crearCategoria = (nombre: string) => {
  return supabase.from('categorias').insert({ nombre_categoria: nombre });
};

export const editarCategoria = (id: number, nombre: string) => {
  return supabase.from('categorias').update({ nombre_categoria: nombre }).eq('id_categoria', id);
};

export const eliminarCategoria = (id: number) => {
  return supabase.from('categorias').delete().eq('id_categoria', id);
};

// Busca la categoría "Ahorro" (la usan los abonos a metas) y si no existe la crea
export const obtenerCategoriaAhorro = async () => {
  const buscada = await supabase.from('categorias').select('*').eq('nombre_categoria', 'Ahorro').maybeSingle();
  if (buscada.error) return { id: null, error: buscada.error };
  if (buscada.data) return { id: buscada.data.id_categoria as number, error: null };

  const creada = await supabase.from('categorias').insert({ nombre_categoria: 'Ahorro' }).select().single();
  return { id: (creada.data?.id_categoria ?? null) as number | null, error: creada.error };
};
