import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
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
        subtitulo={`${resultados.length} resultados de simulaciones try-on`}
      />

      {resultados.length === 0 ? (
        <Tarjeta>
          <Text style={estilos.tituloVacio}>Sin resultados todavía</Text>
          <Text style={estilos.texto}>
            Aquí aparecerán las simulaciones generadas. Por ahora puedes crear
            una simulación provisional desde la pantalla Try-on.
          </Text>
          <View style={estilos.separador} />
          <BotonPrincipal
            texto="Ir a Try-on"
            onPress={() => navegarA('tryOn')}
          />
          <View style={estilos.separador} />
          <BotonPrincipal
            texto="Volver al panel principal"
            variante="secundario"
            onPress={() => navegarA('dashboard')}
          />
        </Tarjeta>
      ) : (
        resultados.map((resultado) => (
          <Tarjeta key={resultado.id}>
            {resultado.resultadoImagenUrl ? (
              <Image
                source={{ uri: resultado.resultadoImagenUrl }}
                style={estilos.imagenResultado}
                resizeMode="cover"
              />
            ) : (
              <View style={estilos.placeholderImagen}>
                <Text style={estilos.textoPlaceholder}>Sin imagen</Text>
              </View>
            )}

            <Text style={estilos.tituloResultado}>
              {resultado.prendaNombre}
            </Text>

            <Text style={estilos.detalle}>Sesión: {resultado.sesionId}</Text>

            <Text style={estilos.detalle}>
              Fecha: {new Date(resultado.fechaCreacion).toLocaleString()}
            </Text>

            <Text style={estilos.avisoMock}>
              Resultado provisional generado en modo mock.
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
  imagenResultado: {
    width: '100%',
    height: 260,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f3f4f6',
  },
  placeholderImagen: {
    width: '100%',
    height: 180,
    borderRadius: 12,
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
  avisoMock: {
    marginTop: 8,
    fontSize: 13,
    color: '#92400e',
    fontWeight: '500',
  },
  separador: {
    height: 10,npx tsc --noEmit
  },
});