import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';

type ImagenUsuarioEntrada = {
  base64: string;
  mimeType: string;
};

type UsuarioMvpFila = {
  id_usuario: string;
};

type ImagenUsuarioFila = {
  ruta_storage: string;
  es_principal: boolean;
  fecha_subida: string;
};

function obtenerExtensionDesdeMimeType(mimeType: string): string {
  if (mimeType.includes('png')) {
    return 'png';
  }

  if (mimeType.includes('webp')) {
    return 'webp';
  }

  return 'jpg';
}

async function obtenerUsuarioMvp(): Promise<{
  idUsuario: string | null;
  error: string | null;
}> {
  if (!supabase) {
    return {
      idUsuario: null,
      error: 'El cliente de Supabase no está configurado.',
    };
  }

  const { data, error } = await supabase
    .from('usuarios')
    .select('id_usuario')
    .eq('nombre_perfil', 'Usuario MVP')
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      idUsuario: null,
      error: `Error al consultar Usuario MVP: ${error.message}`,
    };
  }

  if (!data) {
    return {
      idUsuario: null,
      error: 'No existe Usuario MVP en Supabase.',
    };
  }

  const usuario = data as UsuarioMvpFila;

  return {
    idUsuario: usuario.id_usuario,
    error: null,
  };
}

function obtenerUrlPublicaImagen(rutaStorage: string): string | null {
  if (!supabase) {
    return null;
  }

  const { data } = supabase.storage
    .from('imagenes-usuario')
    .getPublicUrl(rutaStorage);

  return data.publicUrl;
}

export async function obtenerImagenUsuarioPrincipal(): Promise<{
  imagenUrl: string | null;
  error: string | null;
}> {
  if (!supabase) {
    return {
      imagenUrl: null,
      error: 'El cliente de Supabase no está configurado.',
    };
  }

  const usuario = await obtenerUsuarioMvp();

  if (usuario.error || !usuario.idUsuario) {
    return {
      imagenUrl: null,
      error: usuario.error,
    };
  }

  const { data, error } = await supabase
    .from('imagenes_usuario')
    .select('ruta_storage, es_principal, fecha_subida')
    .eq('id_usuario', usuario.idUsuario)
    .eq('es_principal', true)
    .order('fecha_subida', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      imagenUrl: null,
      error: `Error al consultar imagen principal: ${error.message}`,
    };
  }

  if (!data) {
    return {
      imagenUrl: null,
      error: null,
    };
  }

  const imagen = data as ImagenUsuarioFila;

  return {
    imagenUrl: obtenerUrlPublicaImagen(imagen.ruta_storage),
    error: null,
  };
}

export async function guardarImagenUsuarioPrincipal(
  imagen: ImagenUsuarioEntrada
): Promise<{
  imagenUrl: string | null;
  error: string | null;
}> {
  if (!supabase) {
    return {
      imagenUrl: null,
      error: 'El cliente de Supabase no está configurado.',
    };
  }

  const usuario = await obtenerUsuarioMvp();

  if (usuario.error || !usuario.idUsuario) {
    return {
      imagenUrl: null,
      error: usuario.error,
    };
  }

  const extension = obtenerExtensionDesdeMimeType(imagen.mimeType);
  const rutaStorage = `usuarios/${usuario.idUsuario}/principal-${Date.now()}.${extension}`;

  const { error: errorSubida } = await supabase.storage
    .from('imagenes-usuario')
    .upload(rutaStorage, decode(imagen.base64), {
      contentType: imagen.mimeType,
      upsert: false,
    });

  if (errorSubida) {
    return {
      imagenUrl: null,
      error: `Error al subir imagen base: ${errorSubida.message}`,
    };
  }

  const { error: errorActualizar } = await supabase
    .from('imagenes_usuario')
    .update({ es_principal: false })
    .eq('id_usuario', usuario.idUsuario);

  if (errorActualizar) {
    return {
      imagenUrl: null,
      error: `Imagen subida, pero no se pudo actualizar la imagen principal anterior: ${errorActualizar.message}`,
    };
  }

  const { error: errorInsertar } = await supabase
    .from('imagenes_usuario')
    .insert({
      id_usuario: usuario.idUsuario,
      ruta_storage: rutaStorage,
      es_principal: true,
    });

  if (errorInsertar) {
    return {
      imagenUrl: null,
      error: `Imagen subida, pero no se pudo registrar en base de datos: ${errorInsertar.message}`,
    };
  }

  return {
    imagenUrl: obtenerUrlPublicaImagen(rutaStorage),
    error: null,
  };
}