// Muestra un número como pesos. Ej: 15000 -> $15.000
export function formatoPesos(valor: number) {
  return '$' + Number(valor || 0).toLocaleString('es-CO');
}

// Fecha de hoy en formato AAAA-MM-DD
export function fechaHoy() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return hoy.getFullYear() + '-' + mes + '-' + dia;
}

export function esFechaValida(fecha: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(fecha) && !isNaN(new Date(fecha).getTime());
}

// Pasa los errores más comunes de Supabase a español
export function mensajeError(error: any) {
  const texto = error?.message || '';
  if (texto.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (texto.includes('User already registered')) return 'Ya existe una cuenta con ese correo.';
  if (texto.includes('Email not confirmed')) return 'El correo no está confirmado. Desactiva "Confirm email" en Supabase.';
  if (texto.includes('Failed to fetch') || texto.includes('Network request failed')) return 'No hay conexión a internet.';
  if (error?.code === '23503') return 'No se puede eliminar porque tiene registros relacionados.';
  return texto || 'Ocurrió un error inesperado.';
}
