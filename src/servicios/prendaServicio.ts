import { supabase } from '../lib/supabase';
import {
  CategoriaPrenda,
  NuevaPrendaEntrada,
  Prenda,
} from '../tipos/prenda';

// Genera un identificador simple unico para prendas mock.
// Combina marca temporal y un numero aleatorio corto.
function generarIdPrenda(): string {
  const marca = Date.now().toString(36);
  const aleatorio = Math.random().toString(36).slice(2, 7);
  return `p-${marca}-${aleatorio}`;
}

// Construye una prenda completa a partir de la entrada del formulario.
// En esta fase sigue siendo util para el modo local/mock.
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

// Tipo auxiliar para representar como puede devolver Supabase
// la relacion con la tabla categorias.
type CategoriaRelacion =
  | { nombre: CategoriaPrenda }
  | { nombre: CategoriaPrenda }[]
  | null;

// Forma esperada de una fila recibida desde Supabase.
type PrendaFilaSupabase = {
  id_prenda: string;
  nombre: string;
  descripcion: string | null;
  color_principal: string | null;
  fecha_alta: string;
  categorias: CategoriaRelacion;
};

// Obtiene la categoria desde la relacion devuelta por Supabase.
// Se contempla tanto objeto como array para evitar errores de tipado.
function obtenerCategoriaDesdeRelacion(
  categoriaRelacion: CategoriaRelacion
): CategoriaPrenda {
  if (Array.isArray(categoriaRelacion)) {
    return categoriaRelacion[0]?.nombre ?? 'otro';
  }

  return categoriaRelacion?.nombre ?? 'otro';
}

// Convierte una fila de Supabase al modelo Prenda que usa la app.
function mapearPrendaDesdeSupabase(fila: PrendaFilaSupabase): Prenda {
  return {
    id: fila.id_prenda,
    nombre: fila.nombre,
    categoria: obtenerCategoriaDesdeRelacion(fila.categorias),
    color: fila.color_principal ?? '',
    notas: fila.descripcion ?? '',
    fechaCreacion: fila.fecha_alta,
  };
}

// Lee prendas reales desde Supabase.
// Si falla, devuelve error controlado y la app puede seguir usando mocks.
export async function obtenerPrendasDesdeSupabase(): Promise<{
  prendas: Prenda[];
  error: string | null;
}> {
  if (!supabase) {
    return {
      prendas: [],
      error: 'El cliente de Supabase no está configurado.',
    };
  }

  const { data, error } = await supabase
    .from('prendas')
    .select(
      `
      id_prenda,
      nombre,
      descripcion,
      color_principal,
      fecha_alta,
      categorias (
        nombre
      )
    `
    )
    .order('fecha_alta', { ascending: false });

  if (error) {
    return {
      prendas: [],
      error: error.message,
    };
  }

  const filas = (data ?? []) as unknown as PrendaFilaSupabase[];

  return {
    prendas: filas.map(mapearPrendaDesdeSupabase),
    error: null,
  };
}