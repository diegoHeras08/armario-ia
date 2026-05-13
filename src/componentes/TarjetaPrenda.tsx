import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ETIQUETAS_CATEGORIA, Prenda } from '../tipos/prenda';
import { Tarjeta } from './Tarjeta';

interface PropiedadesTarjetaPrenda {
  prenda: Prenda;
}

export function TarjetaPrenda({ prenda }: PropiedadesTarjetaPrenda) {
  const tieneImagen = Boolean(prenda.imagenUrl);
  const tieneColor = prenda.color.trim().length > 0;
  const tieneNotas = prenda.notas.trim().length > 0;

  return (
    <Tarjeta>
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

      <View style={estilos.encabezado}>
        <Text style={estilos.nombre}>{prenda.nombre}</Text>
        <View style={estilos.etiqueta}>
          <Text style={estilos.textoEtiqueta}>
            {ETIQUETAS_CATEGORIA[prenda.categoria]}
          </Text>
        </View>
      </View>

      {tieneColor && <Text style={estilos.detalle}>Color: {prenda.color}</Text>}

      {tieneNotas && <Text style={estilos.detalle}>Notas: {prenda.notas}</Text>}
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  imagen: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#f3f4f6',
  },
  placeholderImagen: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 12,
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
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  etiqueta: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  textoEtiqueta: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  detalle: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 2,
  },
});