import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { BotonPrincipal } from '../componentes/BotonPrincipal';
import { EncabezadoPantalla } from '../componentes/EncabezadoPantalla';
import { Tarjeta } from '../componentes/Tarjeta';
import {
  crearSesionTryOnMockEnSupabase,
  PASOS_TRYON,
} from '../servicios/tryOnServicio';
import { NombrePantalla } from '../tipos/navegacion';
import { ETIQUETAS_CATEGORIA, Prenda } from '../tipos/prenda';
import { ResultadoTryOn } from '../tipos/tryOn';
import {
  guardarImagenUsuarioPrincipal,
  obtenerImagenUsuarioPrincipal,
} from '../servicios/imagenUsuarioServicio';

const imagenGuiaModelo: ImageSourcePropType = require('../../assets/modelo-guia.png');

interface PropiedadesTryOn {
  prendas: Prenda[];
  onResultadoCreado: (resultado: ResultadoTryOn) => void;
  navegarA: (pantalla: NombrePantalla) => void;
}

export function TryOnPantalla({
  prendas,
  onResultadoCreado,
  navegarA,
}: PropiedadesTryOn) {
  const [imagenBaseUrl, setImagenBaseUrl] = useState<string | null>(null);
  const [imagenPreviewUri, setImagenPreviewUri] = useState<string | null>(null);
  const [imagenBase64, setImagenBase64] = useState<string | null>(null);
  const [imagenMimeType, setImagenMimeType] = useState<string | null>(null);

  const [prendaSeleccionadaId, setPrendaSeleccionadaId] = useState<
    string | null
  >(null);

  const [resultadoMock, setResultadoMock] = useState<string | null>(null);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prendaSeleccionada =
    prendas.find((prenda) => prenda.id === prendaSeleccionadaId) ?? null;

  useEffect(() => {
    let activo = true;

    async function cargarImagenPrincipal() {
      setCargando(true);

      const resultado = await obtenerImagenUsuarioPrincipal();

      if (!activo) {
        return;
      }

      if (resultado.error) {
        setError(resultado.error);
      } else {
        setImagenBaseUrl(resultado.imagenUrl);
        setError(null);
      }

      setCargando(false);
    }

    cargarImagenPrincipal();

    return () => {
      activo = false;
    };
  }, []);

  async function seleccionarImagenBase() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      setError('Necesitas conceder permiso para acceder a la galería.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 5],
      base64: true,
    });

    if (resultado.canceled) {
      return;
    }

    const asset = resultado.assets[0];

    if (!asset?.uri || !asset.base64) {
      setError('No se ha podido preparar la imagen seleccionada.');
      return;
    }

    setImagenPreviewUri(asset.uri);
    setImagenBase64(asset.base64);
    setImagenMimeType(asset.mimeType ?? 'image/jpeg');
    setResultadoMock(null);
    setError(null);
  }

  async function guardarImagenBase() {
    if (guardando) {
      return;
    }

    if (!imagenBase64 || !imagenMimeType) {
      setError('Selecciona una imagen antes de guardar.');
      return;
    }

    setGuardando(true);
    setError(null);

    const resultado = await guardarImagenUsuarioPrincipal({
      base64: imagenBase64,
      mimeType: imagenMimeType,
    });

    setGuardando(false);

    if (resultado.error || !resultado.imagenUrl) {
      setError(`No se pudo guardar la imagen base: ${resultado.error}`);
      return;
    }

    setImagenBaseUrl(resultado.imagenUrl);
    setImagenPreviewUri(null);
    setImagenBase64(null);
    setImagenMimeType(null);

    Alert.alert(
      'Imagen base guardada',
      'La imagen del modelo se ha guardado correctamente.'
    );
  }

  function obtenerImagenMostrada(): {
    source: ImageSourcePropType;
    esGuia: boolean;
  } {
    if (imagenPreviewUri) {
      return {
        source: { uri: imagenPreviewUri },
        esGuia: false,
      };
    }

    if (imagenBaseUrl) {
      return {
        source: { uri: imagenBaseUrl },
        esGuia: false,
      };
    }

    return {
      source: imagenGuiaModelo,
      esGuia: true,
    };
  }

  async function generarSimulacionMock() {
    if (generando) {
      return;
    }

    if (!imagenBaseUrl) {
      setError(
        'Primero guarda una imagen base real del modelo. La imagen guía solo sirve como referencia.'
      );
      return;
    }

    if (!prendaSeleccionada) {
      setError('Selecciona una prenda del armario antes de generar el try-on.');
      return;
    }

    setGenerando(true);
    setError(null);
    setResultadoMock(null);

    const resultado = await crearSesionTryOnMockEnSupabase(
      prendaSeleccionada.id,
      prendaSeleccionada.nombre
    );

    setGenerando(false);

    if (resultado.error || !resultado.resultado) {
      setError(`No se pudo crear la sesión try-on: ${resultado.error}`);
      return;
    }

    onResultadoCreado(resultado.resultado);

    setResultadoMock(
      `Sesión try-on mock guardada en Supabase con la prenda "${resultado.resultado.prendaNombre}".`
    );
  }

  const imagenMostrada = obtenerImagenMostrada();

  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <EncabezadoPantalla
        titulo="Try-on"
        subtitulo="Imagen base del modelo y simulación visual"
      />

      <Tarjeta>
        <Text style={estilos.tituloTarjeta}>Imagen base del modelo</Text>
        <Text style={estilos.texto}>
          Esta imagen será la referencia corporal que se usará más adelante para
          probar prendas mediante IA. Debe ser frontal, de cuerpo completo, con
          brazos ligeramente separados y fondo limpio.
        </Text>

        <View style={estilos.separador} />

        {cargando ? (
          <View style={estilos.placeholderImagen}>
            <Text style={estilos.textoPlaceholder}>Cargando imagen...</Text>
          </View>
        ) : (
          <>
            <Image
              source={imagenMostrada.source}
              style={[
                estilos.imagenBase,
                imagenMostrada.esGuia && estilos.imagenGuia,
              ]}
              resizeMode="cover"
            />

            {imagenMostrada.esGuia && (
              <Text style={estilos.textoGuia}>
                Imagen guía: usa una pose similar a este modelo para subir tu
                foto base.
              </Text>
            )}
          </>
        )}

        <View style={estilos.separador} />

        <BotonPrincipal
          texto={
            imagenBaseUrl || imagenPreviewUri
              ? 'Cambiar imagen base'
              : 'Seleccionar imagen base'
          }
          variante="secundario"
          onPress={seleccionarImagenBase}
        />

        {imagenPreviewUri && (
          <>
            <View style={estilos.separador} />
            <BotonPrincipal
              texto={guardando ? 'Guardando...' : 'Guardar como imagen base'}
              onPress={guardarImagenBase}
            />
          </>
        )}
      </Tarjeta>

      <Tarjeta>
        <Text style={estilos.tituloTarjeta}>Seleccionar prenda</Text>
        <Text style={estilos.texto}>
          Elige una prenda del armario para preparar una simulación provisional.
        </Text>

        <View style={estilos.separador} />

        {prendas.length === 0 ? (
          <>
            <Text style={estilos.texto}>
              No hay prendas disponibles. Añade primero una prenda al armario.
            </Text>
            <View style={estilos.separador} />
            <BotonPrincipal
              texto="Añadir prenda"
              onPress={() => navegarA('altaPrenda')}
            />
          </>
        ) : (
          prendas.map((prenda) => {
            const activa = prenda.id === prendaSeleccionadaId;

            return (
              <Pressable
                key={prenda.id}
                onPress={() => {
                  setPrendaSeleccionadaId(prenda.id);
                  setResultadoMock(null);
                  setError(null);
                }}
                style={[
                  estilos.prendaOpcion,
                  activa && estilos.prendaOpcionActiva,
                ]}
              >
                {prenda.imagenUrl ? (
                  <Image
                    source={{ uri: prenda.imagenUrl }}
                    style={estilos.prendaImagen}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={estilos.prendaImagenPlaceholder}>
                    <Text style={estilos.prendaImagenTexto}>Sin imagen</Text>
                  </View>
                )}

                <View style={estilos.prendaInfo}>
                  <Text
                    style={[
                      estilos.prendaNombre,
                      activa && estilos.prendaNombreActiva,
                    ]}
                  >
                    {prenda.nombre}
                  </Text>
                  <Text
                    style={[
                      estilos.prendaCategoria,
                      activa && estilos.prendaCategoriaActiva,
                    ]}
                  >
                    {ETIQUETAS_CATEGORIA[prenda.categoria]}
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}
      </Tarjeta>

      <Tarjeta>
        <Text style={estilos.tituloTarjeta}>Simulación mock</Text>
        <Text style={estilos.texto}>
          Esta simulación todavía no usa IA real. Sirve para validar el flujo:
          imagen base, prenda seleccionada y resultado provisional.
        </Text>

        <View style={estilos.separador} />

        <BotonPrincipal
          texto={generando ? 'Guardando sesión...' : 'Generar try-on mock'}
          onPress={generarSimulacionMock}
        />

        {resultadoMock && (
          <View style={estilos.resultadoMock}>
            <Text style={estilos.resultadoTitulo}>Resultado provisional</Text>
            <Text style={estilos.texto}>{resultadoMock}</Text>
            <Text style={estilos.textoSecundario}>
              Este resultado ya se ha guardado en Supabase y aparecerá en el
              historial persistente de la app.
            </Text>

            <View style={estilos.separador} />

            <BotonPrincipal
              texto="Ver historial"
              variante="secundario"
              onPress={() => navegarA('historial')}
            />
          </View>
        )}

        {error && <Text style={estilos.error}>{error}</Text>}
      </Tarjeta>

      <Tarjeta>
        <Text style={estilos.tituloTarjeta}>Requisitos de la imagen</Text>
        <Text style={estilos.texto}>• Cuerpo completo visible.</Text>
        <Text style={estilos.texto}>• Pose frontal y recta.</Text>
        <Text style={estilos.texto}>
          • Brazos relajados, ligeramente separados del torso.
        </Text>
        <Text style={estilos.texto}>• Fondo liso y buena iluminación.</Text>
        <Text style={estilos.texto}>
          • Evitar selfies, ángulos laterales, sombras fuertes o ropa muy
          voluminosa.
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
          El flujo mock ya crea sesiones y resultados en Supabase. El siguiente
          paso será sustituir el resultado provisional por una generación real
          con IA.
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
  tituloTarjeta: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  texto: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  textoSecundario: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginTop: 6,
  },
  imagenBase: {
    width: '100%',
    height: 360,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  imagenGuia: {
    opacity: 0.98,
  },
  placeholderImagen: {
    width: '100%',
    height: 260,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoPlaceholder: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  textoGuia: {
    marginTop: 8,
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  prendaOpcion: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  prendaOpcionActiva: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  prendaImagen: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  prendaImagenPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prendaImagenTexto: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  prendaInfo: {
    flex: 1,
    marginLeft: 10,
  },
  prendaNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  prendaNombreActiva: {
    color: '#ffffff',
  },
  prendaCategoria: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  prendaCategoriaActiva: {
    color: '#d1d5db',
  },
  resultadoMock: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resultadoTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
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
  error: {
    color: '#b91c1c',
    fontSize: 13,
    marginTop: 12,
  },
  separador: {
    height: 10,
  },
});