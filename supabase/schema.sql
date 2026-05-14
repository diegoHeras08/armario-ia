-- Esquema preliminar para el proyecto Armario IA.
-- Las tablas se preparan en espanol y sin tildes para mantener
-- coherencia con el codigo TypeScript del cliente movil.
-- En esta primera fase no se aplican politicas RLS ni se vinculan
-- tablas con auth.users; ese trabajo se realizara mas adelante,
-- cuando se introduzca la autenticacion real.
create extension if not exists "pgcrypto";

-- =========================================================
-- Tabla: usuarios
-- Representa el perfil logico de uso individual.
-- En el MVP se usara un unico registro placeholder.
-- =========================================================
create table if not exists usuarios (
  id_usuario uuid primary key default gen_random_uuid(),
  nombre_perfil text not null,
  fecha_creacion timestamptz not null default now()
);

-- =========================================================
-- Tabla: categorias
-- Clasificacion estructurada de prendas.
-- =========================================================
create table if not exists categorias (
  id_categoria uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  descripcion text
);

-- Datos base de categorias soportadas por el MVP.
insert into categorias (nombre, descripcion) values
  ('camiseta', 'Camisetas, tops y prendas basicas de torso'),
  ('camisa', 'Camisas y prendas superiores formales o semiformales'),
  ('jersey_sudadera', 'Jerseys, sudaderas y prendas superiores gruesas'),
  ('chaqueta', 'Chaquetas, cazadoras y prendas exteriores ligeras'),
  ('abrigo', 'Abrigos y prendas exteriores pesadas'),
  ('pantalon', 'Pantalones, vaqueros y prendas inferiores largas'),
  ('falda_short', 'Faldas, shorts y prendas inferiores cortas'),
  ('vestido_mono', 'Vestidos, monos y prendas de cuerpo completo'),
  ('calzado', 'Zapatos, zapatillas, botas y otro calzado'),
  ('accesorio', 'Complementos y accesorios'),
  ('otro', 'Prendas no clasificadas')
on conflict (nombre) do nothing;

-- =========================================================
-- Tabla: prendas
-- Informacion principal de cada prenda registrada.
-- =========================================================
create table if not exists prendas (
  id_prenda uuid primary key default gen_random_uuid(),
  id_usuario uuid references usuarios(id_usuario) on delete cascade,
  id_categoria uuid references categorias(id_categoria),
  nombre text not null,
  descripcion text,
  color_principal text,
  temporada text,
  eliminada boolean not null default false,
  fecha_alta timestamptz not null default now()
);

-- =========================================================
-- Tabla: imagenes_usuario
-- Imagenes base del usuario para usar en simulaciones.
-- =========================================================
create table if not exists imagenes_usuario (
  id_imagen_usuario uuid primary key default gen_random_uuid(),
  id_usuario uuid references usuarios(id_usuario) on delete cascade,
  ruta_storage text not null,
  es_principal boolean not null default false,
  fecha_subida timestamptz not null default now()
);

-- =========================================================
-- Tabla: imagenes_prenda
-- Imagenes asociadas a cada prenda registrada.
-- =========================================================
create table if not exists imagenes_prenda (
  id_imagen_prenda uuid primary key default gen_random_uuid(),
  id_prenda uuid references prendas(id_prenda) on delete cascade,
  ruta_storage text not null,
  es_principal boolean not null default false,
  fecha_subida timestamptz not null default now()
);

-- =========================================================
-- Tabla: sesiones_tryon
-- Cada solicitud de simulacion try-on al servicio externo.
-- =========================================================
create table if not exists sesiones_tryon (
  id_sesion uuid primary key default gen_random_uuid(),
  id_usuario uuid references usuarios(id_usuario) on delete cascade,
  id_prenda uuid references prendas(id_prenda),
  id_imagen_usuario uuid references imagenes_usuario(id_imagen_usuario),
  fecha_sesion timestamptz not null default now(),
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'procesando', 'completado', 'fallido'))
);

-- =========================================================
-- Tabla: resultados_tryon
-- Resultado final generado a partir de una sesion try-on.
-- =========================================================
create table if not exists resultados_tryon (
  id_resultado uuid primary key default gen_random_uuid(),
  id_sesion uuid references sesiones_tryon(id_sesion) on delete cascade,
  ruta_storage text not null,
  fecha_generacion timestamptz not null default now()
);

-- =========================================================
-- NOTAS PARA FASES POSTERIORES
-- =========================================================
-- 1. Cuando se introduzca autenticacion real, sustituir id_usuario
--    por una referencia directa a auth.users(id) y activar RLS.
-- 2. Politicas RLS a definir mas adelante. Ejemplo orientativo:
--    alter table prendas enable row level security;
--    create policy "lectura propia" on prendas
--      for select using (id_usuario = auth.uid());
--    (y politicas equivalentes para insert/update/delete y para
--    el resto de tablas).
-- 3. Buckets de Supabase Storage previstos:
--    - imagenes-prenda
--    - imagenes-usuario
--    - resultados-tryon