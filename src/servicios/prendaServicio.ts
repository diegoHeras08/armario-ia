import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';
import {
  CategoriaPrenda,
  NuevaPrendaEntrada,
  Prenda,
} from '../tipos/prenda';

export type ImagenPrendaEntrada = {
  base64: string;
  mimeType: string;
};

function generarIdPrenda(): string {
  const marca = Date.now().toString(36);
  const aleatorio = Math.random().toString(36).slice(2, 7);
  return `p-${marca}-${aleatorio}`;
}

export function construirPrenda(entrada: NuevaPrendaEntrada): Prenda {
  return {
    id: generarIdPrenda(),
    nombre: entrada.nombre.trim(),
    categoria: entrada.categoria,
    notas: entrada.notas.trim(),
    fechaCreacion: new Date().toISOString(),
  };
}

export function validarNuevaPrenda(entrada: NuevaPrendaEntrada): string | null {
  if (entrada.nombre.trim().length < 2) {
    return 'El nombre debe tener al menos 2 caracteres.';
  }

  return null;
}

type CategoriaRelacion =
  | { nombre: string }
  | { nombre: string }[]
  | null;

type ImagenPrendaRelacion =
  | {
      ruta_storage: string;
      es_principal: boolean;
    }[]
  | null;

type PrendaFilaSupabase = {
  id_prenda: string;
  nombre: string;
  descripcion: string | null;
  fecha_alta: string;
  eliminada?: boolean;
  categorias?: CategoriaRelacion;
  imagenes_prenda?: ImagenPrendaRelacion;
};

type UsuarioMvpFila = {
  id_usuario: string;
};

type CategoriaFila = {
  id_categoria: string;
};

function normalizarCategoria(nombre: string | null | undefined): CategoriaPrenda {
  switch (nombre) {
    case 'camiseta':
    case 'camisa':
    case 'jersey_sudadera':
    case 'chaqueta':
    case 'abrigo':
    case 'pantalon':
    case 'falda_short':
    case 'vestido_mono':
    case 'calzado':
    case 'accesorio':
    case 'otro':
      return nombre;

    case 'superior':
      return 'camiseta';

    case 'inferior':
      return 'pantalon';

    default:
      return 'otro';
  }
}

function obtenerCategoriaDesdeRelacion(
  categoriaRelacion: CategoriaRelacion | undefined
): CategoriaPrenda {
  if (Array.isArray(categoriaRelacion)) {
    return normalizarCategoria(categoriaRelacion[0]?.nombre);
  }

  return normalizarCategoria(categoriaRelacion?.nombre);
}

function obtenerImagenPrincipal(
  imagenes: ImagenPrendaRelacion | undefined
): string | undefined {
  if (!imagenes || imagenes.length === 0 || !supabase) {
    return undefined;
  }

  const imagenPrincipal =
    imagenes.find((imagen) => imagen.es_principal) ?? imagenes[0];

  if (!imagenPrincipal?.ruta_storage) {
    return undefined;
  }

  const { data } = supabase.storage
    .from('imagenes-prenda')
    .getPublicUrl(imagenPrincipal.ruta_storage);

  return data.publicUrl;
}

function mapearPrendaDesdeSupabase(fila: PrendaFilaSupabase): Prenda {
  return {
    id: fila.id_prenda,
    nombre: fila.nombre,
    categoria: obtenerCategoriaDesdeRelacion(fila.categorias),
    notas: fila.descripcion ?? '',
    imagenUrl: obtenerImagenPrincipal(fila.imagenes_prenda),
    fechaCreacion: fila.fecha_alta,
  };
}

function obtenerExtensionDesdeMimeType(mimeType: string): string {
  if (mimeType.includes('png')) {
    return 'png';
  }

  if (mimeType.includes('webp')) {
    return 'webp';
  }

  return 'jpg';
}

async function obtenerCategoriaPorNombre(
  categoria: CategoriaPrenda
): Promise<{
  idCategoria: string | null;
  error: string | null;
}> {
  if (!supabase) {
    return {
      idCategoria: null,
      error: 'El cliente de Supabase no está configurado.',
    };
  }

  const { data, error } = await supabase
    .from('categorias')
    .select('id_categoria')
    .eq('nombre', categoria)
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      idCategoria: null,
      error: `Error al consultar la categoría: ${error.message}`,
    };
  }

  if (!data) {
    return {
      idCategoria: null,
      error: `No se ha encontrado la categoría "${categoria}" en Supabase.`,
    };
  }

  const categoriaEncontrada = data as CategoriaFila;

  return {
    idCategoria: categoriaEncontrada.id_categoria,
    error: null,
  };
}

async function obtenerPrendaPorIdDesdeSupabase(
  idPrenda: string
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

  const { data, error } = await supabase
    .from('prendas')
    .select(
      `
      id_prenda,
      nombre,
      descripcion,
      fecha_alta,
      eliminada,
      categorias (
        nombre
      ),
      imagenes_prenda (
        ruta_storage,
        es_principal
      )
    `
    )
    .eq('id_prenda', idPrenda)
    .maybeSingle();

  if (error) {
    return {
      prenda: null,
      error: `No se ha podido obtener la prenda: ${error.message}`,
    };
  }

  if (!data) {
    return {
      prenda: null,
      error: 'Supabase no ha devuelto la prenda solicitada.',
    };
  }

  const fila = data as unknown as PrendaFilaSupabase;

  if (fila.eliminada) {
    return {
      prenda: null,
      error: 'La prenda está marcada como eliminada.',
    };
  }

  return {
    prenda: mapearPrendaDesdeSupabase(fila),
    error: null,
  };
}

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
      fecha_alta,
      eliminada,
      categorias (
        nombre
      ),
      imagenes_prenda (
        ruta_storage,
        es_principal
      )
    `
    )
    .eq('eliminada', false)
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

async function subirImagenPrenda(
  idPrenda: string,
  imagen: ImagenPrendaEntrada
): Promise<{
  rutaStorage: string | null;
  error: string | null;
}> {
  if (!supabase) {
    return {
      rutaStorage: null,
      error: 'El cliente de Supabase no está configurado.',
    };
  }

  const extension = obtenerExtensionDesdeMimeType(imagen.mimeType);
  const rutaStorage = `prendas/${idPrenda}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from('imagenes-prenda')
    .upload(rutaStorage, decode(imagen.base64), {
      contentType: imagen.mimeType,
      upsert: false,
    });

  if (error) {
    return {
      rutaStorage: null,
      error: error.message,
    };
  }

  return {
    rutaStorage,
    error: null,
  };
}

async function marcarImagenesPrendaComoNoPrincipales(
  idPrenda: string
): Promise<string | null> {
  if (!supabase) {
    return 'El cliente de Supabase no está configurado.';
  }

  const { error } = await supabase
    .from('imagenes_prenda')
    .update({ es_principal: false })
    .eq('id_prenda', idPrenda);

  return error?.message ?? null;
}

async function registrarImagenPrenda(
  idPrenda: string,
  rutaStorage: string
): Promise<string | null> {
  if (!supabase) {
    return 'El cliente de Supabase no está configurado.';
  }

  const { error } = await supabase.from('imagenes_prenda').insert({
    id_prenda: idPrenda,
    ruta_storage: rutaStorage,
    es_principal: true,
  });

  return error?.message ?? null;
}

export async function crearPrendaEnSupabase(
  entrada: NuevaPrendaEntrada,
  imagen?: ImagenPrendaEntrada
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

  const categoria = await obtenerCategoriaPorNombre(entrada.categoria);

  if (categoria.error || !categoria.idCategoria) {
    return {
      prenda: null,
      error: categoria.error,
    };
  }

  const usuarioMvp = usuario as UsuarioMvpFila;

  const { data: prendaInsertada, error: errorInsert } = await supabase
    .from('prendas')
    .insert({
      id_usuario: usuarioMvp.id_usuario,
      id_categoria: categoria.idCategoria,
      nombre: entrada.nombre.trim(),
      descripcion: entrada.notas.trim(),
      temporada: null,
      eliminada: false,
    })
    .select(
      `
      id_prenda,
      nombre,
      descripcion,
      fecha_alta,
      eliminada,
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

  const filaInsertada = prendaInsertada as unknown as PrendaFilaSupabase;
  let prendaFinal = mapearPrendaDesdeSupabase(filaInsertada);

  if (imagen) {
    const subida = await subirImagenPrenda(filaInsertada.id_prenda, imagen);

    if (subida.error || !subida.rutaStorage) {
      return {
        prenda: null,
        error: `La prenda se creó, pero falló la subida de imagen: ${subida.error}`,
      };
    }

    const errorRegistroImagen = await registrarImagenPrenda(
      filaInsertada.id_prenda,
      subida.rutaStorage
    );

    if (errorRegistroImagen) {
      return {
        prenda: null,
        error: `La imagen se subió, pero no se registró en la base de datos: ${errorRegistroImagen}`,
      };
    }

    const { data } = supabase.storage
      .from('imagenes-prenda')
      .getPublicUrl(subida.rutaStorage);

    prendaFinal = {
      ...prendaFinal,
      imagenUrl: data.publicUrl,
    };
  }

  return {
    prenda: prendaFinal,
    error: null,
  };
}

export async function actualizarPrendaEnSupabase(
  idPrenda: string,
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

  const categoria = await obtenerCategoriaPorNombre(entrada.categoria);

  if (categoria.error || !categoria.idCategoria) {
    return {
      prenda: null,
      error: categoria.error,
    };
  }

  const { data: prendaActualizada, error } = await supabase
    .from('prendas')
    .update({
      id_categoria: categoria.idCategoria,
      nombre: entrada.nombre.trim(),
      descripcion: entrada.notas.trim(),
    })
    .eq('id_prenda', idPrenda)
    .eq('eliminada', false)
    .select(
      `
      id_prenda,
      nombre,
      descripcion,
      fecha_alta,
      eliminada,
      categorias (
        nombre
      ),
      imagenes_prenda (
        ruta_storage,
        es_principal
      )
    `
    )
    .single();

  if (error) {
    return {
      prenda: null,
      error: `No se ha podido actualizar la prenda: ${error.message}`,
    };
  }

  if (!prendaActualizada) {
    return {
      prenda: null,
      error: 'Supabase no ha devuelto la prenda actualizada.',
    };
  }

  return {
    prenda: mapearPrendaDesdeSupabase(
      prendaActualizada as unknown as PrendaFilaSupabase
    ),
    error: null,
  };
}

export async function actualizarImagenPrincipalPrendaEnSupabase(
  idPrenda: string,
  imagen: ImagenPrendaEntrada
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

  const subida = await subirImagenPrenda(idPrenda, imagen);

  if (subida.error || !subida.rutaStorage) {
    return {
      prenda: null,
      error: `No se ha podido subir la nueva imagen: ${subida.error}`,
    };
  }

  const errorDesactivarImagenes =
    await marcarImagenesPrendaComoNoPrincipales(idPrenda);

  if (errorDesactivarImagenes) {
    return {
      prenda: null,
      error: `La imagen se subió, pero no se pudo actualizar la imagen principal anterior: ${errorDesactivarImagenes}`,
    };
  }

  const errorRegistroImagen = await registrarImagenPrenda(
    idPrenda,
    subida.rutaStorage
  );

  if (errorRegistroImagen) {
    return {
      prenda: null,
      error: `La imagen se subió, pero no se registró como principal: ${errorRegistroImagen}`,
    };
  }

  return obtenerPrendaPorIdDesdeSupabase(idPrenda);
}

export async function eliminarPrendaEnSupabase(
  idPrenda: string
): Promise<{
  idPrenda: string | null;
  error: string | null;
}> {
  if (!supabase) {
    return {
      idPrenda: null,
      error: 'El cliente de Supabase no está configurado.',
    };
  }

  const { error } = await supabase
    .from('prendas')
    .update({ eliminada: true })
    .eq('id_prenda', idPrenda)
    .eq('eliminada', false);

  if (error) {
    return {
      idPrenda: null,
      error: `No se ha podido eliminar la prenda: ${error.message}`,
    };
  }

  return {
    idPrenda,
    error: null,
  };
}