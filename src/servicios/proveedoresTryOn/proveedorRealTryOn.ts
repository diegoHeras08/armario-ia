import {
  EntradaGeneracionTryOn,
  ProveedorTryOn,
  ResultadoGeneracionTryOn,
} from './tiposProveedorTryOn';

// Proveedor real pendiente.
// Aquí se conectará más adelante Gemini, NanoBanana u otro servicio de IA.
// En esta fase no ejecuta ninguna llamada externa.
// Su objetivo actual es dejar claras las validaciones mínimas necesarias
// para una generación try-on real.
export const proveedorRealTryOn: ProveedorTryOn = {
  nombre: 'ProveedorRealTryOn',

  async generarResultado(
    entrada: EntradaGeneracionTryOn
  ): Promise<ResultadoGeneracionTryOn> {
    const errorValidacion = validarEntradaProveedorReal(entrada);

    if (errorValidacion) {
      return {
        estado: 'fallido',
        mensaje: errorValidacion,
      };
    }

    return {
      estado: 'fallido',
      mensaje:
        'El proveedor de IA real todavía no está implementado. La entrada ya contiene imagen base e imagen de prenda, pero falta conectar el servicio de generación.',
    };
  },
};

function validarEntradaProveedorReal(
  entrada: EntradaGeneracionTryOn
): string | null {
  if (!entrada.idPrenda.trim()) {
    return 'No se ha recibido el identificador de la prenda.';
  }

  if (!entrada.nombrePrenda.trim()) {
    return 'No se ha recibido el nombre de la prenda.';
  }

  if (!entrada.imagenBaseUrl.trim()) {
    return 'No se ha recibido la URL pública de la imagen base.';
  }

  if (!entrada.rutaStorageImagenBase.trim()) {
    return 'No se ha recibido la ruta Storage de la imagen base.';
  }

  if (!entrada.imagenPrendaUrl?.trim()) {
    return 'No se ha recibido la URL pública de la imagen de la prenda.';
  }

  if (!entrada.rutaStorageImagenPrenda?.trim()) {
    return 'No se ha recibido la ruta Storage de la imagen de la prenda.';
  }

  return null;
}