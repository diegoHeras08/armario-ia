import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ETIQUETAS_CATEGORIA, Prenda } from '../tipos/prenda';
import { Tarjeta } from './Tarjeta';

interface PropiedadesTarjetaPrenda {
  prenda: Prenda;
}

export function TarjetaPrenda({ prenda }: PropiedadesTarjetaPrenda) {
  const tieneImagen = Boolean(prenda.imagenUrl);
  const tieneNotas = prenda.notas.trim().length > 0;

  const etiquetaCategoria = ETIQUETAS_CATEGORIA[prenda.categoria] ?? 'Otro';

  return (
    <Tarjeta>
      <View style={estilos.contenedorImagen}>
        {tieneImagen ? (
          <Image
            source={{ uri: prenda.imagenUrl }}
            style={estilos.imagen}
            resizeMode="cover"
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
  textoPlaceholder: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '500',
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
});