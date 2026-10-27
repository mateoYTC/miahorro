import { supabase } from '../lib/supabase';

type DatosIngreso = {
  monto: number;
  periodo: string;
};

export const obtenerIngresos = (idUsuario: string) => {
  return supabase.from('ingresos').select('*').eq('id_usuario', idUsuario).order('id_ingreso', { ascending: false });
};

export const crearIngreso = (idUsuario: string, datos: DatosIngreso) => {
  return supabase.from('ingresos').insert({ ...datos, id_usuario: idUsuario });
};

export const editarIngreso = (id: number, datos: DatosIngreso) => {
  return supabase.from('ingresos').update(datos).eq('id_ingreso', id);
};

export const eliminarIngreso = (id: number) => {
  return supabase.from('ingresos').delete().eq('id_ingreso', id);
};
