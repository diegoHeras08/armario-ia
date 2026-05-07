import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BotonPrincipal } from '../componentes/BotonPrincipal';
import { EncabezadoPantalla } from '../componentes/EncabezadoPantalla';
import { Tarjeta } from '../componentes/Tarjeta';
import { PASOS_TRYON } from '../servicios/tryOnServicio';
import { NombrePantalla } from '../tipos/navegacion';

interface PropiedadesTryOn {
  navegarA: (pantalla: NombrePantalla) => void;
}

export function TryOnPantalla({ navegarA }: PropiedadesTryOn) {
  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <EncabezadoPantalla
        titulo="Try-on"
        subtitulo="Simulación visual con IA"
      />

      <Tarjeta>
        <Text style={estilos.aviso}>Función en preparación</Text>
        <Text style={estilos.texto}>
          La generación real con inteligencia artificial se añadirá en una fase
          posterior del proyecto. Esta pantalla muestra el flujo previsto.
        </Text>
      </Tarjeta>

      <Tarjeta>
        <Text style={estilos.tituloTarjeta}>Flujo previsto</Text>
        {PASOS_TRYON.map((paso, indice) => (
          <View key={indice} style={estilos.paso}>
            <View style={estilos.numero}>
              <Text style={estilos.textoNumero}>{indice + 1}</Text>
            </View>
            <Text style={estilos.textoPaso}>{paso}</Text>
          </View>
        ))}
      </Tarjeta>

      <Tarjeta>
        <Text style={estilos.tituloTarjeta}>Estado actual</Text>
        <Text style={estilos.texto}>
          Sin sesiones activas. La integración con el servicio externo de IA y
          el almacenamiento de imágenes se implementarán cuando la base
          funcional esté consolidada.
        </Text>
        <View style={estilos.separador} />
        <BotonPrincipal
          texto="Volver al panel principal"
          variante="secundario"
          onPress={() => navegarA('dashboard')}
        />
      </Tarjeta>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    padding: 16,
    paddingBottom: 32,
  },
  aviso: {
    fontSize: 15,
    color: '#b45309',
    fontWeight: '600',
    marginBottom: 6,
  },
  texto: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  tituloTarjeta: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  paso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  numero: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  textoNumero: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  textoPaso: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  separador: {
    height: 10,
  },
});