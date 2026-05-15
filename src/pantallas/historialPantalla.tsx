import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

  const [resultadoSeleccionado, setResultadoSeleccionado] =
    useState<ResultadoTryOn | null>(null);

  function cerrarVisor() {
    setResultadoSeleccionado(null);
  }

  return (
    <>
      <ScrollView contentContainerStyle={estilos.contenedor}>
        <EncabezadoPantalla
          titulo="Historial"
          subtitulo={`${resultados.length} ${
            resultados.length === 1
              ? 'resultado guardado'
              : 'resultados guardados'
          }`}
        />

        <Tarjeta>
          <Text style={estilos.tituloTarjeta}>Resumen del historial</Text>
          <Text style={estilos.texto}>
            Aquí se guardan las simulaciones try-on generadas. Toca cualquier
            resultado para abrir una vista completa de la imagen.
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
              Todavía no hay simulaciones guardadas. Crea una simulación desde
              Try-on para validar el flujo de imagen base, prenda seleccionada e
              historial.
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
            <Pressable
              key={resultado.id}
              onPress={() => setResultadoSeleccionado(resultado)}
            >
              <Tarjeta>
                <View style={estilos.encabezadoResultado}>
                  <View style={estilos.bloqueTituloResultado}>
                    <Text style={estilos.tituloResultado} numberOfLines={2}>
                      {resultado.prendaNombre}
                    </Text>
                    <Text style={estilos.fechaResultado}>
                      {formatearFecha(resultado.fechaCreacion)}
                    </Text>
                  </View>

                  <View style={estilos.etiquetaResultado}>
                    <Text style={estilos.textoEtiquetaResultado}>
                      Guardado
                    </Text>
                  </View>
                </View>

                {resultado.resultadoImagenUrl ? (
                  <Image
                    source={{ uri: resultado.resultadoImagenUrl }}
                    style={estilos.imagenResultado}
                    resizeMode="contain"
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
                    Estado: resultado guardado en Supabase.
                  </Text>
                </View>

                <View style={estilos.avisoResultado}>
                  <Text style={estilos.textoAvisoResultado}>
                    Toca este resultado para verlo a pantalla completa.
                  </Text>
                </View>
              </Tarjeta>
            </Pressable>
          ))
        )}
      </ScrollView>

      <Modal
        visible={Boolean(resultadoSeleccionado)}
        animationType="fade"
        transparent={false}
        onRequestClose={cerrarVisor}
      >
        <View
          style={[
            estilos.modalContenedor,
            {
              paddingTop: Math.max(insets.top, 16),
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
        >
          <View style={estilos.modalCabecera}>
            <View style={estilos.modalTituloBloque}>
              <Text style={estilos.modalTitulo} numberOfLines={1}>
                {resultadoSeleccionado?.prendaNombre ?? 'Resultado'}
              </Text>

              <Text style={estilos.modalSubtitulo} numberOfLines={1}>
                {resultadoSeleccionado
                  ? formatearFecha(resultadoSeleccionado.fechaCreacion)
                  : ''}
              </Text>
            </View>

            <Pressable onPress={cerrarVisor} style={estilos.botonCerrar}>
              <Text style={estilos.textoBotonCerrar}>Cerrar</Text>
            </Pressable>
          </View>

          <View style={estilos.modalImagenZona}>
            {resultadoSeleccionado?.resultadoImagenUrl ? (
              <Image
                source={{ uri: resultadoSeleccionado.resultadoImagenUrl }}
                style={estilos.modalImagen}
                resizeMode="contain"
              />
            ) : (
              <View style={estilos.modalPlaceholder}>
                <Text style={estilos.modalTextoPlaceholder}>
                  Sin imagen disponible
                </Text>
              </View>
            )}
          </View>

          <View style={estilos.modalPie}>
            <Text style={estilos.modalDetalle} numberOfLines={1}>
              ID sesión: {resultadoSeleccionado?.sesionId ?? '-'}
            </Text>
          </View>
        </View>
      </Modal>
    </>
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
    paddingBottom: 40,
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
  etiquetaResultado: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  textoEtiquetaResultado: {
    fontSize: 12,
    color: '#047857',
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
  avisoResultado: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textoAvisoResultado: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  separador: {
    height: 10,
  },
  modalContenedor: {
    flex: 1,
    backgroundColor: '#030712',
    paddingHorizontal: 12,
  },
  modalCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTituloBloque: {
    flex: 1,
    marginRight: 10,
  },
  modalTitulo: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  modalSubtitulo: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  botonCerrar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  textoBotonCerrar: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
  },
  modalImagenZona: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImagen: {
    width: '100%',
    height: '100%',
  },
  modalPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTextoPlaceholder: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
  },
  modalPie: {
    paddingTop: 10,
  },
  modalDetalle: {
    color: '#9ca3af',
    fontSize: 12,
  },
});