import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ETIQUETAS_CATEGORIA, Prenda } from '../tipos/prenda';
import { Tarjeta } from './Tarjeta';

export type ModoTarjetaPrenda = 'lista' | 'cuadricula';

interface PropiedadesTarjetaPrenda {
  prenda: Prenda;
  modo?: ModoTarjetaPrenda;
}

export function TarjetaPrenda({
  prenda,
  modo = 'lista',
}: PropiedadesTarjetaPrenda) {
  const tieneImagen = Boolean(prenda.imagenUrl);
  const tieneNotas = prenda.notas.trim().length > 0;

  const etiquetaCategoria = ETIQUETAS_CATEGORIA[prenda.categoria] ?? 'Otro';

  if (modo === 'cuadricula') {
    return (
      <Tarjeta>
        <View style={estilos.contenedorImagenCuadricula}>
          {tieneImagen ? (
            <Image
              source={{ uri: prenda.imagenUrl }}
              style={estilos.imagenCuadricula}
              resizeMode="contain"
            />
          ) : (
            <View style={estilos.placeholderImagenCuadricula}>
              <Text style={estilos.textoPlaceholder}>Sin imagen</Text>
            </View>
          )}
        </View>

        <Text style={estilos.nombreCuadricula} numberOfLines={2}>
          {prenda.nombre}
        </Text>

        <View style={estilos.etiquetaCuadricula}>
          <Text style={estilos.textoEtiquetaCuadricula} numberOfLines={1}>
            {etiquetaCategoria}
          </Text>
        </View>
      </Tarjeta>
    );
  }

  return (
    <Tarjeta>
      <View style={estilos.contenedorImagen}>
        {tieneImagen ? (
          <Image
            source={{ uri: prenda.imagenUrl }}
            style={estilos.imagen}
            resizeMode="contain"
          />
        ) : (
          <View style={estilos.placeholderImagen}>
            <Text style={estilos.textoPlaceholder}>Sin imagen</Text>
          </View>
        )}
      </View>

      <View style={estilos.contenido}>
        <View style={estilos.encabezado}>
          <Text style={estilos.nombre} numberOfLines={2}>
            {prenda.nombre}
          </Text>

          <View style={estilos.etiqueta}>
            <Text style={estilos.textoEtiqueta}>{etiquetaCategoria}</Text>
          </View>
        </View>

        {tieneNotas ? (
          <Text style={estilos.detalle} numberOfLines={2}>
            {prenda.notas}
          </Text>
        ) : (
          <Text style={estilos.detalleVacio}>Sin notas añadidas</Text>
        )}

        <Text style={estilos.indicacion}>Tocar para ver detalle</Text>
      </View>
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  contenedorImagen: {
    width: '100%',
    marginBottom: 12,
  },
  imagen: {
    width: '100%',
    height: 190,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  placeholderImagen: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contenedorImagenCuadricula: {
    width: '100%',
    marginBottom: 8,
  },
  imagenCuadricula: {
    width: '100%',
    height: 135,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  placeholderImagenCuadricula: {
    width: '100%',
    height: 135,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoPlaceholder: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  contenido: {
    width: '100%',
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nombre: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 10,
    lineHeight: 22,
  },
  etiqueta: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textoEtiqueta: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  detalle: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 10,
  },
  detalleVacio: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  indicacion: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  nombreCuadricula: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 17,
    minHeight: 34,
    marginBottom: 6,
  },
  etiquetaCuadricula: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textoEtiquetaCuadricula: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
  },
});