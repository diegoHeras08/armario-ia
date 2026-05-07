// Tipos relacionados con el flujo de simulacion try-on.

// Estados posibles de una sesion try-on.
export type EstadoTryOn =
  | 'pendiente'
  | 'procesando'
  | 'completado'
  | 'fallido';

// Sesion try-on registrada en el sistema.
export interface SesionTryOn {
  id: string;
  prendaId: string;
  imagenUsuarioUrl?: string;
  resultadoImagenUrl?: string;
  estado: EstadoTryOn;
  fechaCreacion: string;
}

// Resultado generado a partir de una sesion try-on.
export interface ResultadoTryOn {
  id: string;
  sesionId: string;
  prendaNombre: string;
  resultadoImagenUrl?: string;
  fechaCreacion: string;
}