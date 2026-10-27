import { supabase } from '../lib/supabase';

type DatosGasto = {
  monto: number;
  fecha: string;
  descripcion: string;
  id_categoria: number;
};

// Trae los gastos del usuario con el nombre de su categoría
export const obtenerGastos = (idUsuario: string) => {
  return supabase
    .from('gastos')
    .select('*, categorias(nombre_categoria)')
    .eq('id_usuario', idUsuario)
    .order('fecha', { ascending: false });
};

export const crearGasto = (idUsuario: string, datos: DatosGasto) => {
  return supabase.from('gastos').insert({ ...datos, id_usuario: idUsuario });
};

export const editarGasto = (id: number, datos: DatosGasto) => {
  return supabase.from('gastos').update(datos).eq('id_gasto', id);
};

export const eliminarGasto = (id: number) => {
  return supabase.from('gastos').delete().eq('id_gasto', id);
};
