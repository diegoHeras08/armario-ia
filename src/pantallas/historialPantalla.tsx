import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BotonPrincipal } from '../componentes/BotonPrincipal';
import { EncabezadoPantalla } from '../componentes/EncabezadoPantalla';
import { Tarjeta } from '../componentes/Tarjeta';
import { ResultadoTryOn } from '../tipos/tryOn';
import { NombrePantalla } from '../tipos/navegacion';

interface PropiedadesHistorial {
  resultados: ResultadoTryOn[];
  navegarA: (pantalla: NombrePantalla) => void;
}

export function HistorialPantalla({
  resultados,
  navegarA,
}: PropiedadesHistorial) {
  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <EncabezadoPantalla
        titulo="Historial"
        subtitulo="Resultados de simulaciones try-on"
      />

      {resultados.length === 0 ? (
        <Tarjeta>
          <Text style={estilos.tituloVacio}>Sin resultados todavía</Text>
          <Text style={estilos.texto}>
            Aquí aparecerán las simulaciones generadas cuando la integración
            con IA esté disponible. Por ahora puedes seguir gestionando tu
            armario.
          </Text>
          <View style={estilos.separador} />
          <BotonPrincipal
            texto="Volver al panel principal"
            variante="secundario"
            onPress={() => navegarA('dashboard')}
          />
        </Tarjeta>
      ) : (
        resultados.map((r) => (
          <Tarjeta key={r.id}>
            <Text style={estilos.tituloResultado}>{r.prendaNombre}</Text>
            <Text style={estilos.detalle}>Sesión: {r.sesionId}</Text>
            <Text style={estilos.detalle}>
              Fecha: {new Date(r.fechaCreacion).toLocaleString()}
            </Text>
          </Tarjeta>
        ))
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    padding: 16,
    paddingBottom: 32,
  },
  tituloVacio: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  texto: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  tituloResultado: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  detalle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  separador: {
    height: 10,
  },
});