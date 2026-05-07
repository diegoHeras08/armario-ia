import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

// Componente contenedor reutilizable con estilo de tarjeta.
interface PropiedadesTarjeta {
  children: React.ReactNode;
  estiloAdicional?: ViewStyle;
}

export function Tarjeta({ children, estiloAdicional }: PropiedadesTarjeta) {
  return <View style={[estilos.tarjeta, estiloAdicional]}>{children}</View>;
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
});