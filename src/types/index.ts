export type Usuario = {
  id_usuario: string;
  nombre: string;
  correo: string;
};

export type Categoria = {
  id_categoria: number;
  nombre_categoria: string;
  id_usuario: string;
};

export type Gasto = {
  id_gasto: number;
  monto: number;
  fecha: string;
  descripcion: string;
  id_categoria: number;
  id_usuario: string;
  categorias?: { nombre_categoria: string };
};

export type Ingreso = {
  id_ingreso: number;
  monto: number;
  periodo: string;
  id_usuario: string;
};

export type Meta = {
  id_meta_ahorro: number;
  nombre_meta: string;
  monto_objetivo: number;
  monto_actual: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  id_usuario: string;
};
