import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PropiedadesEncabezado {
  titulo: string;
  subtitulo?: string;
}

export function EncabezadoPantalla({ titulo, subtitulo }: PropiedadesEncabezado) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>{titulo}</Text>
      {subtitulo && <Text style={estilos.subtitulo}>{subtitulo}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    marginBottom: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitulo: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
});