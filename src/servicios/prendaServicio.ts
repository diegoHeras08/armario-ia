import { NuevaPrendaEntrada, Prenda } from '../tipos/prenda';

// Genera un identificador simple unico para prendas mock.
// Combina marca temporal y un numero aleatorio corto.
function generarIdPrenda(): string {
  const marca = Date.now().toString(36);
  const aleatorio = Math.random().toString(36).slice(2, 7);
  return `p-${marca}-${aleatorio}`;
}

// Construye una prenda completa a partir de la entrada del formulario.
// En esta fase no se persiste en Supabase para evitar errores de RLS o tabla.
export function construirPrenda(entrada: NuevaPrendaEntrada): Prenda {
  return {
    id: generarIdPrenda(),
    nombre: entrada.nombre.trim(),
    categoria: entrada.categoria,
    color: entrada.color.trim(),
    notas: entrada.notas.trim(),
    fechaCreacion: new Date().toISOString(),
  };
}

// Validacion basica del formulario de alta de prenda.
// Devuelve un mensaje de error o null si todo es correcto.
export function validarNuevaPrenda(entrada: NuevaPrendaEntrada): string | null {
  if (entrada.nombre.trim().length < 2) {
    return 'El nombre debe tener al menos 2 caracteres.';
  }
  if (entrada.color.trim().length < 2) {
    return 'Indica un color válido.';
  }
  return null;
}