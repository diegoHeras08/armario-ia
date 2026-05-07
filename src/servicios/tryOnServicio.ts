import { EstadoTryOn, SesionTryOn } from '../tipos/tryOn';

// Servicio provisional del flujo try-on.
// La generacion real con IA se implementara en una fase posterior.

// Lista ordenada de pasos previstos para la simulacion try-on.
// Sirve como guion visible en la pantalla provisional.
export const PASOS_TRYON: string[] = [
  'Seleccionar una prenda del armario.',
  'Seleccionar una imagen base del usuario.',
  'Solicitar la simulación al servicio externo de IA.',
  'Guardar el resultado en el historial.',
];

// Construye una sesion try-on en estado pendiente.
// No se envia a ningun servicio externo en esta fase.
export function crearSesionPendiente(prendaId: string): SesionTryOn {
  const estadoInicial: EstadoTryOn = 'pendiente';
  return {
    id: `s-${Date.now().toString(36)}`,
    prendaId,
    estado: estadoInicial,
    fechaCreacion: new Date().toISOString(),
  };
}