import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

interface PropiedadesBoton {
  texto: string;
  onPress: () => void;
  variante?: 'principal' | 'secundario';
  deshabilitado?: boolean;
  estiloAdicional?: ViewStyle;
}

export function BotonPrincipal({
  texto,
  onPress,
  variante = 'principal',
  deshabilitado = false,
  estiloAdicional,
}: PropiedadesBoton) {
  const estiloBase =
    variante === 'principal' ? estilos.botonPrincipal : estilos.botonSecundario;
  const estiloTexto =
    variante === 'principal' ? estilos.textoPrincipal : estilos.textoSecundario;

  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      style={[
        estiloBase,
        deshabilitado && estilos.botonDeshabilitado,
        estiloAdicional,
      ]}
    >
      <Text style={estiloTexto}>{texto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botonPrincipal: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonSecundario: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
  textoPrincipal: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  textoSecundario: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
});