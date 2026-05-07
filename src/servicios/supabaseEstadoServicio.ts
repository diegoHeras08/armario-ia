// Servicio de comprobacion del estado de configuracion de Supabase.
// Solo verifica la presencia de las variables EXPO_PUBLIC_*, sin hacer
// llamadas de red, para garantizar que la app no falle en esta fase
// si Supabase aun no tiene tablas creadas.

export interface EstadoSupabase {
  configurado: boolean;
  detalle: string;
}

// Lee las variables de entorno expuestas por Expo en tiempo de build.
// Las variables EXPO_PUBLIC_* estan disponibles en process.env en cliente.
export function obtenerEstadoSupabase(): EstadoSupabase {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const clave = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  const urlValida = typeof url === 'string' && url.length > 0;
  const claveValida = typeof clave === 'string' && clave.length > 0;

  if (urlValida && claveValida) {
    return {
      configurado: true,
      detalle: 'Variables de Supabase detectadas.',
    };
  }

  return {
    configurado: false,
    detalle: 'Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY.',
  };
}