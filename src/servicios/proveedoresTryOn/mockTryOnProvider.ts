import {
  EntradaGeneracionTryOn,
  ProveedorTryOn,
  ResultadoGeneracionTryOn,
} from './tiposProveedorTryOn';

// Proveedor mock.
// No genera una imagen real con IA.
// Reutiliza la ruta Storage de la imagen base como resultado provisional.
export const mockTryOnProvider: ProveedorTryOn = {
  nombre: 'MockTryOnProvider',

  async generarResultado(
    entrada: EntradaGeneracionTryOn
  ): Promise<ResultadoGeneracionTryOn> {
    return {
      estado: 'completado',
      rutaStorageResultado: entrada.rutaStorageImagenBase,
      mensaje: `Resultado mock generado para la prenda "${entrada.nombrePrenda}".`,
    };
  },
};