import { Prenda } from '../tipos/prenda';

// Conjunto inicial de prendas para que la app sea visible
// antes de conectar con Supabase.
export const PRENDAS_MOCK: Prenda[] = [
  {
    id: 'p-001',
    nombre: 'Camiseta blanca básica',
    categoria: 'superior',
    color: 'Blanco',
    notas: 'Algodón, uso diario',
    fechaCreacion: '2025-01-15T10:00:00.000Z',
  },
  {
    id: 'p-002',
    nombre: 'Vaqueros azul oscuro',
    categoria: 'inferior',
    color: 'Azul oscuro',
    notas: 'Corte recto',
    fechaCreacion: '2025-01-16T11:30:00.000Z',
  },    
  {
    id: 'p-003',
    nombre: 'Zapatillas blancas',
    categoria: 'calzado',
    color: 'Blanco',
    notas: 'Suela limpia',
    fechaCreacion: '2025-01-18T09:15:00.000Z',
  },
  {
    id: 'p-004',
    nombre: 'Chaqueta vaquera',
    categoria: 'abrigo',
    color: 'Azul medio',
    notas: 'Entretiempo',
    fechaCreacion: '2025-01-20T18:45:00.000Z',
  },
  {
    id: 'p-005',
    nombre: 'Cinturón marrón',
    categoria: 'accesorio',
    color: 'Marrón',
    notas: 'Hebilla metálica',
    fechaCreacion: '2025-01-22T20:00:00.000Z',
  },
];