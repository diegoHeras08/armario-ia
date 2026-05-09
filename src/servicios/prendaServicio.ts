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
// Sigue siendo util para pruebas locales si Supabase no se usa.
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
  categorias?: CategoriaRelacion;
};

type UsuarioMvpFila = {
  id_usuario: string;
};

type CategoriaFila = {
  id_categoria: string;
};

// Obtiene la categoria desde la relacion devuelta por Supabase.
function obtenerCategoriaDesdeRelacion(
  categoriaRelacion: CategoriaRelacion | undefined
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

// Crea una prenda real en Supabase.
// Usa el Usuario MVP temporal y la categoria seleccionada.
// Mas adelante se sustituira por autenticacion real y auth.uid().
export async function crearPrendaEnSupabase(
  entrada: NuevaPrendaEntrada
): Promise<{
  prenda: Prenda | null;
  error: string | null;
}> {
  if (!supabase) {
    return {
      prenda: null,
      error: 'El cliente de Supabase no está configurado.',
    };
  }

  const mensajeError = validarNuevaPrenda(entrada);

  if (mensajeError) {
    return {
      prenda: null,
      error: mensajeError,
    };
  }

  const { data: usuario, error: errorUsuario } = await supabase
    .from('usuarios')
    .select('id_usuario')
    .eq('nombre_perfil', 'Usuario MVP')
    .limit(1)
    .maybeSingle();

  if (errorUsuario) {
    return {
      prenda: null,
      error: `Error al consultar el Usuario MVP: ${errorUsuario.message}`,
    };
  }

  if (!usuario) {
    return {
      prenda: null,
      error:
        'No se ha encontrado el Usuario MVP en Supabase. Crea primero el usuario temporal.',
    };
  }

  const { data: categoria, error: errorCategoria } = await supabase
    .from('categorias')
    .select('id_categoria')
    .eq('nombre', entrada.categoria)
    .limit(1)
    .maybeSingle();

  if (errorCategoria) {
    return {
      prenda: null,
      error: `Error al consultar la categoría: ${errorCategoria.message}`,
    };
  }

  if (!categoria) {
    return {
      prenda: null,
      error: `No se ha encontrado la categoría "${entrada.categoria}" en Supabase.`,
    };
  }

  const usuarioMvp = usuario as UsuarioMvpFila;
  const categoriaSeleccionada = categoria as CategoriaFila;

  const { data: prendaInsertada, error: errorInsert } = await supabase
    .from('prendas')
    .insert({
      id_usuario: usuarioMvp.id_usuario,
      id_categoria: categoriaSeleccionada.id_categoria,
      nombre: entrada.nombre.trim(),
      descripcion: entrada.notas.trim(),
      color_principal: entrada.color.trim(),
      temporada: null,
    })
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
    .single();

  if (errorInsert) {
    return {
      prenda: null,
      error: `No se ha podido insertar la prenda en Supabase: ${errorInsert.message}`,
    };
  }

  if (!prendaInsertada) {
    return {
      prenda: null,
      error: 'Supabase no ha devuelto la prenda insertada.',
    };
  }

  return {
    prenda: mapearPrendaDesdeSupabase(
      prendaInsertada as unknown as PrendaFilaSupabase
    ),
    error: null,
  };
}