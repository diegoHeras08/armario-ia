import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ETIQUETAS_CATEGORIA, Prenda } from '../tipos/prenda';
import { Tarjeta } from './Tarjeta';

interface PropiedadesTarjetaPrenda {
  prenda: Prenda;
}

export function TarjetaPrenda({ prenda }: PropiedadesTarjetaPrenda) {
  return (
    <Tarjeta>
      <View style={estilos.encabezado}>
        <Text style={estilos.nombre}>{prenda.nombre}</Text>
        <View style={estilos.etiqueta}>
          <Text style={estilos.textoEtiqueta}>
            {ETIQUETAS_CATEGORIA[prenda.categoria]}
          </Text>
        </View>
      </View>
      <Text style={estilos.detalle}>Color: {prenda.color}</Text>
      {prenda.notas.length > 0 && (
        <Text style={estilos.detalle}>Notas: {prenda.notas}</Text>
      )}
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
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