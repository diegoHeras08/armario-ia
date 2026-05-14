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
        subtitulo={`${resultados.length} ${
          resultados.length === 1 ? 'resultado guardado' : 'resultados guardados'
        }`}
      />

      <Tarjeta>
        <Text style={estilos.tituloTarjeta}>Resumen del historial</Text>
        <Text style={estilos.texto}>
          Aquí se guardan las simulaciones try-on generadas. Actualmente los
          resultados son provisionales, pero esta pantalla ya queda preparada
          para mostrar imágenes generadas por IA real.
        </Text>

        <View style={estilos.resumenFila}>
          <View style={estilos.resumenCaja}>
            <Text style={estilos.numeroResumen}>{resultados.length}</Text>
            <Text style={estilos.textoResumen}>
              {resultados.length === 1 ? 'simulación' : 'simulaciones'}
            </Text>
          </View>

          <View style={estilos.resumenCaja}>
            <Text style={estilos.numeroResumen}>
              {resultados.filter((r) => Boolean(r.resultadoImagenUrl)).length}
            </Text>
            <Text style={estilos.textoResumen}>con imagen</Text>
          </View>
        </View>
      </Tarjeta>

      {resultados.length === 0 ? (
        <Tarjeta>
          <Text style={estilos.tituloVacio}>Sin resultados todavía</Text>
          <Text style={estilos.texto}>
            Todavía no hay simulaciones guardadas. Crea una simulación
            provisional desde Try-on para validar el flujo de imagen base,
            prenda seleccionada e historial.
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
            <View style={estilos.encabezadoResultado}>
              <View style={estilos.bloqueTituloResultado}>
                <Text style={estilos.tituloResultado} numberOfLines={2}>
                  {resultado.prendaNombre}
                </Text>
                <Text style={estilos.fechaResultado}>
                  {formatearFecha(resultado.fechaCreacion)}
                </Text>
              </View>

              <View style={estilos.etiquetaMock}>
                <Text style={estilos.textoEtiquetaMock}>Mock</Text>
              </View>
            </View>

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

            <View style={estilos.bloqueInfo}>
              <Text style={estilos.tituloInfo}>Información de sesión</Text>

              <Text style={estilos.detalle} numberOfLines={1}>
                ID sesión: {resultado.sesionId}
              </Text>

              <Text style={estilos.detalle}>
                Estado: resultado provisional guardado en Supabase.
              </Text>
            </View>

            <View style={estilos.avisoMock}>
              <Text style={estilos.textoAvisoMock}>
                Este resultado usa todavía el flujo mock. En la integración IA
                real aquí se mostrará la imagen generada final.
              </Text>
            </View>
          </Tarjeta>
        ))
      )}
    </ScrollView>
  );
}

function formatearFecha(fechaIso: string): string {
  const fecha = new Date(fechaIso);

  if (Number.isNaN(fecha.getTime())) {
    return 'Fecha no disponible';
  }

  return fecha.toLocaleString();
}

const estilos = StyleSheet.create({
  contenedor: {
    padding: 16,
    paddingBottom: 32,
  },
  tituloTarjeta: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  tituloVacio: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  texto: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  resumenFila: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  resumenCaja: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  numeroResumen: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  textoResumen: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '600',
    marginTop: 2,
  },
  encabezadoResultado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bloqueTituloResultado: {
    flex: 1,
    marginRight: 10,
  },
  tituloResultado: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 22,
  },
  fechaResultado: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 3,
  },
  etiquetaMock: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  textoEtiquetaMock: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '700',
  },
  imagenResultado: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f3f4f6',
  },
  placeholderImagen: {
    width: '100%',
    height: 190,
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
  bloqueInfo: {
    marginTop: 2,
  },
  tituloInfo: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
    marginBottom: 4,
  },
  detalle: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginTop: 2,
  },
  avisoMock: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textoAvisoMock: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  separador: {
    height: 10,
  },
});