// Tipos relacionados con la entidad Prenda y su clasificacion.

// Categorias funcionales soportadas por el MVP.
// Se orientan a una organizacion visual del armario y al futuro flujo try-on.
export type CategoriaPrenda =
  | 'camiseta'
  | 'camisa'
  | 'jersey_sudadera'
  | 'chaqueta'
  | 'abrigo'
  | 'pantalon'
  | 'falda_short'
  | 'vestido_mono'
  | 'calzado'
  | 'accesorio'
  | 'otro';

// Lista ordenada de categorias para usar en interfaces, selectores y filtros.
export const CATEGORIAS_PRENDA: CategoriaPrenda[] = [
  'camiseta',
  'camisa',
  'jersey_sudadera',
  'chaqueta',
  'abrigo',
  'pantalon',
  'falda_short',
  'vestido_mono',
  'calzado',
  'accesorio',
  'otro',
];

// Etiqueta legible asociada a cada categoria para mostrar al usuario.
export const ETIQUETAS_CATEGORIA: Record<CategoriaPrenda, string> = {
  camiseta: 'Camiseta',
  camisa: 'Camisa',
  jersey_sudadera: 'Jersey / Sudadera',
  chaqueta: 'Chaqueta',
  abrigo: 'Abrigo',
  pantalon: 'Pantalón',
  falda_short: 'Falda / Short',
  vestido_mono: 'Vestido / Mono',
  calzado: 'Calzado',
  accesorio: 'Accesorio',
  otro: 'Otro',
};

// Estructura completa de una prenda almacenada en el armario.
export interface Prenda {
  id: string;
  nombre: string;
  categoria: CategoriaPrenda;
  notas: string;

  // URL publica usada por la interfaz para mostrar la imagen.
  imagenUrl?: string;

  // Ruta interna en Supabase Storage.
  // Se usara mas adelante para proveedores IA, backend y gestion de resultados.
  rutaStorageImagen?: string;

  fechaCreacion: string;
}

// Datos minimos que el usuario introduce al crear una nueva prenda.
export interface NuevaPrendaEntrada {
  nombre: string;
  categoria: CategoriaPrenda;
  notas: string;
}