// Tipos relacionados con la entidad Prenda y su clasificacion.

// Categorias funcionales soportadas por la primera version del MVP.
export type CategoriaPrenda =
  | 'superior'
  | 'inferior'
  | 'calzado'
  | 'accesorio'
  | 'abrigo'
  | 'otro';

// Lista ordenada de categorias para usar en interfaces (selectores, filtros).
export const CATEGORIAS_PRENDA: CategoriaPrenda[] = [
  'superior',
  'inferior',
  'calzado',
  'accesorio',
  'abrigo',
  'otro',
];

// Etiqueta legible asociada a cada categoria para mostrar al usuario.
export const ETIQUETAS_CATEGORIA: Record<CategoriaPrenda, string> = {
  superior: 'Superior',
  inferior: 'Inferior',
  calzado: 'Calzado',
  accesorio: 'Accesorio',
  abrigo: 'Abrigo',
  otro: 'Otro',
};

// Estructura completa de una prenda almacenada en el armario.
export interface Prenda {
  id: string;
  nombre: string;
  categoria: CategoriaPrenda;
  color: string;
  notas: string;
  imagenUrl?: string;
  fechaCreacion: string;
}

// Datos minimos que el usuario introduce al crear una nueva prenda.
export interface NuevaPrendaEntrada {
  nombre: string;
  categoria: CategoriaPrenda;
  color: string;
  notas: string;
}