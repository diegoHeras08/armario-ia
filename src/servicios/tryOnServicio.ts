import { supabase } from '../lib/supabase';
import { EstadoTryOn, ResultadoTryOn, SesionTryOn } from '../tipos/tryOn';

// Servicio del flujo try-on.
// En esta fase se implementa persistencia mock en Supabase.
// La generación real con IA se implementará en una fase posterior.

// Lista ordenada de pasos previstos para la simulación try-on.
export const PASOS_TRYON: string[] = [
  'Seleccionar una prenda del armario.',
  'Seleccionar una imagen base del usuario.',
  'Solicitar la simulación al servicio externo de IA.',
  'Guardar el resultado en el historial.',
];

type UsuarioMvpFila = {
  id_usuario: string;
};

type ImagenUsuarioPrincipalFila = {
  id_imagen_usuario: string;
  ruta_storage: string;
};

type PrendaRelacion =
  | { nombre: string }
  | { nombre: string }[]
  | null;

type ImagenUsuarioRelacion =
  | { ruta_storage: string | null }
  | { ruta_storage: string | null }[]
  | null;

type SesionRelacion =
  | {
      id_sesion: string;
      estado: EstadoTryOn;
      fecha_sesion: string;
      prendas?: PrendaRelacion;
      imagenes_usuario?: ImagenUsuarioRelacion;
    }
  | {
      id_sesion: string;
      estado: EstadoTryOn;
      fecha_sesion: string;
      prendas?: PrendaRelacion;
      imagenes_usuario?: ImagenUsuarioRelacion;
    }[]
  | null;

type SesionTryOnFilaSupabase = {
  id_sesion: string;
  id_prenda: string | null;
  fecha_sesion: string;
  estado: EstadoTryOn;
  prendas?: PrendaRelacion;
  imagenes_usuario?: ImagenUsuarioRelacion;
};

type ResultadoTryOnFilaSupabase = {
  id_resultado: string;
  id_sesion: string | null;
  ruta_storage: string;
  fecha_generacion: string;
  sesiones_tryon?: SesionRelacion;
};

// Construye una sesión try-on local en estado pendiente.
// Sigue siendo útil para pruebas locales sin Supabase.
export function crearSesionPendiente(prendaId: string): SesionTryOn {
  const estadoInicial: EstadoTryOn = 'pendiente';

  return {
    id: `s-${Date.now().toString(36)}`,
    prendaId,
    estado: estadoInicial,
    fechaCreacion: new Date().toISOString(),
  };
}

function obtenerNombrePrenda(
  relacion: PrendaRelacion | undefined,
  fallback: string
): string {
  if (Array.isArray(relacion)) {
    return relacion[0]?.nombre ?? fallback;
  }

  return relacion?.nombre ?? fallback;
}

function obtenerRutaImagenUsuario(
  relacion: ImagenUsuarioRelacion | undefined
): string | null {
  if (Array.isArray(relacion)) {
    return relacion[0]?.ruta_storage ?? null;
  }

  return relacion?.ruta_storage ?? null;
}

function obtenerSesionDesdeRelacion(
  relacion: SesionRelacion | undefined
):
  | {
      id_sesion: string;
      estado: EstadoTryOn;
      fecha_sesion: string;
      prendas?: PrendaRelacion;
      imagenes_usuario?: ImagenUsuarioRelacion;
    }
  | null {
  if (Array.isArray(relacion)) {
    return relacion[0] ?? null;
  }

  return relacion ?? null;
}

function obtenerUrlPublicaImagenUsuario(
  rutaStorage: string | null
): string | undefined {
  if (!rutaStorage || !supabase) {
    return undefined;
  }

  const { data } = supabase.storage
    .from('imagenes-usuario')
    .getPublicUrl(rutaStorage);

  return data.publicUrl;
}

function mapearSesionAResultadoTryOn(
  fila: SesionTryOnFilaSupabase,
  nombrePrendaFallback = 'Prenda seleccionada'
): ResultadoTryOn {
  const rutaImagenUsuario = obtenerRutaImagenUsuario(fila.imagenes_usuario);

  return {
    id: fila.id_sesion,
    sesionId: fila.id_sesion,
    prendaNombre: obtenerNombrePrenda(fila.prendas, nombrePrendaFallback),
    resultadoImagenUrl: obtenerUrlPublicaImagenUsuario(rutaImagenUsuario),
    fechaCreacion: fila.fecha_sesion,
  };
}

function mapearResultadoTryOnDesdeSupabase(
  fila: ResultadoTryOnFilaSupabase,
  nombrePrendaFallback = 'Prenda seleccionada'
): ResultadoTryOn {
  const sesion = obtenerSesionDesdeRelacion(fila.sesiones_tryon);

  return {
    id: fila.id_resultado,
    sesionId: sesion?.id_sesion ?? fila.id_sesion ?? 'sesion-desconocida',
    prendaNombre: obtenerNombrePrenda(
      sesion?.prendas,
      nombrePrendaFallback
    ),
    resultadoImagenUrl: obtenerUrlPublicaImagenUsuario(fila.ruta_storage),
    fechaCreacion: fila.fecha_generacion,
  };
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
      error: 'No se ha encontrado el Usuario MVP en Supabase.',
    };
  }

  const usuario = data as UsuarioMvpFila;

  return {
    idUsuario: usuario.id_usuario,
    error: null,
  };
}

async function obtenerImagenPrincipalUsuario(
  idUsuario: string
): Promise<{
  idImagenUsuario: string | null;
  rutaStorage: string | null;
  error: string | null;
}> {
  if (!supabase) {
    return {
      idImagenUsuario: null,
      rutaStorage: null,
      error: 'El cliente de Supabase no está configurado.',
    };
  }

  const { data, error } = await supabase
    .from('imagenes_usuario')
    .select('id_imagen_usuario, ruta_storage')
    .eq('id_usuario', idUsuario)
    .eq('es_principal', true)
    .order('fecha_subida', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      idImagenUsuario: null,
      rutaStorage: null,
      error: `Error al consultar la imagen base del usuario: ${error.message}`,
    };
  }

  if (!data) {
    return {
      idImagenUsuario: null,
      rutaStorage: null,
      error:
        'No hay imagen base principal guardada. Guarda primero una imagen base desde Try-on.',
    };
  }

  const imagen = data as ImagenUsuarioPrincipalFila;

  return {
    idImagenUsuario: imagen.id_imagen_usuario,
    rutaStorage: imagen.ruta_storage,
    error: null,
  };
}

// Crea una sesión try-on mock en Supabase y registra un resultado asociado.
// En esta fase no se genera una imagen nueva: se reutiliza temporalmente la
// imagen base del usuario como resultado mock.
export async function crearSesionTryOnMockEnSupabase(
  prendaId: string,
  prendaNombreFallback: string
): Promise<{
  resultado: ResultadoTryOn | null;
  error: string | null;
}> {
  if (!supabase) {
    return {
      resultado: null,
      error: 'El cliente de Supabase no está configurado.',
    };
  }

  const usuario = await obtenerUsuarioMvp();

  if (usuario.error || !usuario.idUsuario) {
    return {
      resultado: null,
      error: usuario.error,
    };
  }

  const imagenPrincipal = await obtenerImagenPrincipalUsuario(usuario.idUsuario);

  if (
    imagenPrincipal.error ||
    !imagenPrincipal.idImagenUsuario ||
    !imagenPrincipal.rutaStorage
  ) {
    return {
      resultado: null,
      error: imagenPrincipal.error,
    };
  }

  const { data: sesionCreada, error: errorSesion } = await supabase
    .from('sesiones_tryon')
    .insert({
      id_usuario: usuario.idUsuario,
      id_prenda: prendaId,
      id_imagen_usuario: imagenPrincipal.idImagenUsuario,
      estado: 'completado',
    })
    .select(
      `
      id_sesion,
      id_prenda,
      fecha_sesion,
      estado,
      prendas (
        nombre
      ),
      imagenes_usuario (
        ruta_storage
      )
    `
    )
    .single();

  if (errorSesion) {
    return {
      resultado: null,
      error: `No se ha podido crear la sesión try-on: ${errorSesion.message}`,
    };
  }

  if (!sesionCreada) {
    return {
      resultado: null,
      error: 'Supabase no ha devuelto la sesión try-on creada.',
    };
  }

  const sesion = sesionCreada as unknown as SesionTryOnFilaSupabase;

  const { data: resultadoCreado, error: errorResultado } = await supabase
    .from('resultados_tryon')
    .insert({
      id_sesion: sesion.id_sesion,
      ruta_storage: imagenPrincipal.rutaStorage,
    })
    .select(
      `
      id_resultado,
      id_sesion,
      ruta_storage,
      fecha_generacion,
      sesiones_tryon (
        id_sesion,
        estado,
        fecha_sesion,
        prendas (
          nombre
        ),
        imagenes_usuario (
          ruta_storage
        )
      )
    `
    )
    .single();

  if (errorResultado) {
    return {
      resultado: null,
      error: `La sesión se creó, pero no se pudo registrar el resultado: ${errorResultado.message}`,
    };
  }

  if (!resultadoCreado) {
    return {
      resultado: null,
      error: 'Supabase no ha devuelto el resultado try-on creado.',
    };
  }

  const resultado =
    resultadoCreado as unknown as ResultadoTryOnFilaSupabase;

  return {
    resultado: mapearResultadoTryOnDesdeSupabase(
      resultado,
      prendaNombreFallback
    ),
    error: null,
  };
}

// Lee el historial de resultados try-on desde Supabase.
// A partir de esta fase el historial se basa en resultados_tryon.
export async function obtenerHistorialTryOnDesdeSupabase(): Promise<{
  resultados: ResultadoTryOn[];
  error: string | null;
}> {
  if (!supabase) {
    return {
      resultados: [],
      error: 'El cliente de Supabase no está configurado.',
    };
  }

  const { data, error } = await supabase
    .from('resultados_tryon')
    .select(
      `
      id_resultado,
      id_sesion,
      ruta_storage,
      fecha_generacion,
      sesiones_tryon (
        id_sesion,
        estado,
        fecha_sesion,
        prendas (
          nombre
        ),
        imagenes_usuario (
          ruta_storage
        )
      )
    `
    )
    .order('fecha_generacion', { ascending: false });

  if (error) {
    return {
      resultados: [],
      error: `No se ha podido cargar el historial try-on: ${error.message}`,
    };
  }

  const filas = (data ?? []) as unknown as ResultadoTryOnFilaSupabase[];

  return {
    resultados: filas.map((fila) =>
      mapearResultadoTryOnDesdeSupabase(fila, 'Prenda seleccionada')
    ),
    error: null,
  };
}