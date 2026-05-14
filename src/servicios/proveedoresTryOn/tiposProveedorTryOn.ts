// Tipos comunes para cualquier proveedor de generación try-on.
// Esta capa permite cambiar entre proveedor mock e IA real sin modificar
// directamente la pantalla Try-on.

export type EstadoProveedorTryOn =
  | 'pendiente'
  | 'procesando'
  | 'completado'
  | 'fallido';

export interface EntradaGeneracionTryOn {
  idPrenda: string;
  nombrePrenda: string;

  // Imagen base del usuario/modelo.
  // La URL publica sirve para que un proveedor externo pueda leer la imagen.
  imagenBaseUrl: string;

  // Ruta interna en Supabase Storage.
  // Se usa para registrar resultados o reutilizar la imagen en modo mock.
  rutaStorageImagenBase: string;

  // Imagen principal de la prenda.
  // En modo mock no es imprescindible, pero en IA real será necesaria.
  imagenPrendaUrl?: string;

  // Ruta interna de la imagen principal de la prenda en Supabase Storage.
  // Queda preparada para backend, proxy o futuras operaciones con Storage.
  rutaStorageImagenPrenda?: string;
}

export interface ResultadoGeneracionTryOn {
  estado: EstadoProveedorTryOn;

  // Ruta interna del resultado generado en Supabase Storage.
  // En modo mock reutiliza la imagen base.
  // En modo real se rellenara despues de subir la imagen generada.
  rutaStorageResultado?: string;

  // Imagen generada devuelta por el proveedor IA.
  // En modo mock no se usa.
  // En modo real puede venir desde Gemini/Nano Banana como base64.
  imagenBase64Resultado?: string;

  // Tipo MIME de la imagen generada.
  // Ejemplo: image/png, image/jpeg, image/webp.
  mimeTypeResultado?: string;

  mensaje: string;
}

export interface ProveedorTryOn {
  nombre: string;
  generarResultado(
    entrada: EntradaGeneracionTryOn
  ): Promise<ResultadoGeneracionTryOn>;
}