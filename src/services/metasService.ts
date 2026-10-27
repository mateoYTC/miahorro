import { supabase } from '../lib/supabase';

type DatosMeta = {
  nombre_meta: string;
  monto_objetivo: number;
  monto_actual: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
};

export const obtenerMetas = (idUsuario: string) => {
  return supabase.from('metas_ahorro').select('*').eq('id_usuario', idUsuario).order('id_meta_ahorro', { ascending: false });
};

export const crearMeta = (idUsuario: string, datos: DatosMeta) => {
  return supabase.from('metas_ahorro').insert({ ...datos, id_usuario: idUsuario });
};

export const editarMeta = (id: number, datos: DatosMeta) => {
  return supabase.from('metas_ahorro').update(datos).eq('id_meta_ahorro', id);
};

// Suma dinero a lo que ya lleva ahorrado la meta
export const abonarMeta = (id: number, nuevoMonto: number) => {
  return supabase.from('metas_ahorro').update({ monto_actual: nuevoMonto }).eq('id_meta_ahorro', id);
};

export const eliminarMeta = (id: number) => {
  return supabase.from('metas_ahorro').delete().eq('id_meta_ahorro', id);
};
