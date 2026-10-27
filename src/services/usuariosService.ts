import { supabase } from '../lib/supabase';

export const obtenerUsuario = (id: string) => {
  return supabase.from('usuarios').select('*').eq('id_usuario', id).maybeSingle();
};

export const crearUsuario = (id: string, nombre: string, correo: string) => {
  return supabase.from('usuarios').insert({ id_usuario: id, nombre, correo });
};

export const editarUsuario = (id: string, nombre: string) => {
  return supabase.from('usuarios').update({ nombre }).eq('id_usuario', id);
};

export const eliminarUsuario = (id: string) => {
  return supabase.from('usuarios').delete().eq('id_usuario', id);
};
