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
  crearSesionTryOnRealEnSupabase,
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
const imagenDemoLocal: ImageSourcePropType = require('../../assets/demo/resultado-tryon-demo.png');

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
  const [resultadoIa, setResultadoIa] = useState<string | null>(null);
  const [resultadoDemoLocal, setResultadoDemoLocal] = useState<string | null>(
    null
  );

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [generandoIa, setGenerandoIa] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prendaSeleccionada =
    prendas.find((prenda) => prenda.id === prendaSeleccionadaId) ?? null;

  const hayImagenPendiente = Boolean(imagenPreviewUri);
  const hayImagenBaseGuardada = Boolean(imagenBaseUrl);
  const hayPrendaSeleccionada = Boolean(prendaSeleccionada);
  const generacionEnCurso = generando || generandoIa;

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
    setResultadoIa(null);
    setResultadoDemoLocal(null);
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
    setResultadoMock(null);
    setResultadoIa(null);
    setResultadoDemoLocal(null);

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
    if (generacionEnCurso) {
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
    setResultadoIa(null);
    setResultadoDemoLocal(null);

    const resultado = await crearSesionTryOnMockEnSupabase(
      prendaSeleccionada.id,
      prendaSeleccionada.nombre,
      {
        imagenPrendaUrl: prendaSeleccionada.imagenUrl,
        rutaStorageImagenPrenda: prendaSeleccionada.rutaStorageImagen,
      }
    );

    setGenerando(false);

    if (resultado.error || !resultado.resultado) {
      setError(`No se pudo crear la sesión try-on mock: ${resultado.error}`);
      return;
    }

    onResultadoCreado(resultado.resultado);

    setResultadoMock(
      `Sesión try-on mock guardada en Supabase con la prenda "${resultado.resultado.prendaNombre}".`
    );
  }

  async function generarSimulacionIa() {
    if (generacionEnCurso) {
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

    if (
      !prendaSeleccionada.imagenUrl ||
      !prendaSeleccionada.rutaStorageImagen
    ) {
      setError(
        'Para usar IA real, la prenda seleccionada debe tener una imagen guardada en Supabase.'
      );
      return;
    }

    setGenerandoIa(true);
    setError(null);
    setResultadoMock(null);
    setResultadoIa(null);
    setResultadoDemoLocal(null);

    const resultado = await crearSesionTryOnRealEnSupabase(
      prendaSeleccionada.id,
      prendaSeleccionada.nombre,
      {
        imagenPrendaUrl: prendaSeleccionada.imagenUrl,
        rutaStorageImagenPrenda: prendaSeleccionada.rutaStorageImagen,
      }
    );

    setGenerandoIa(false);

    if (resultado.error || !resultado.resultado) {
      setError(`No se pudo generar el try-on con IA: ${resultado.error}`);
      return;
    }

    onResultadoCreado(resultado.resultado);

    setResultadoIa(
      `Try-on con IA generado y guardado en Supabase con la prenda "${resultado.resultado.prendaNombre}".`
    );
  }

  function generarDemoLocal() {
    if (generacionEnCurso) {
      return;
    }

    const imagenDemo = Image.resolveAssetSource(imagenDemoLocal);

    if (!imagenDemo?.uri) {
      setError('No se ha podido cargar la imagen demo local.');
      return;
    }

    const fechaActual = new Date().toISOString();
    const marcaTiempo = Date.now().toString(36);

    const resultado: ResultadoTryOn = {
      id: `demo-local-${marcaTiempo}`,
      sesionId: `sesion-demo-local-${marcaTiempo}`,
      prendaNombre: prendaSeleccionada?.nombre ?? 'Resultado demo local',
      resultadoImagenUrl: imagenDemo.uri,
      fechaCreacion: fechaActual,
    };

    onResultadoCreado(resultado);

    setResultadoMock(null);
    setResultadoIa(null);
    setResultadoDemoLocal(
      `Demo local generada sin conexión con la prenda "${resultado.prendaNombre}".`
    );
    setError(null);
  }

  const imagenMostrada = obtenerImagenMostrada();

  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <EncabezadoPantalla
        titulo="Try-on"
        subtitulo="Preparación de imagen base, prenda y simulación provisional"
      />

      <Tarjeta>
        <View style={estilos.encabezadoTarjeta}>
          <View>
            <Text style={estilos.tituloTarjeta}>Imagen base del modelo</Text>
            <Text style={estilos.textoSecundario}>
              Referencia corporal para futuras generaciones con IA.
            </Text>
          </View>

          <View
            style={[
              estilos.estadoMini,
              hayImagenBaseGuardada
                ? estilos.estadoMiniOk
                : hayImagenPendiente
                  ? estilos.estadoMiniPendiente
                  : estilos.estadoMiniNeutro,
            ]}
          >
            <Text
              style={[
                estilos.textoEstadoMini,
                hayImagenBaseGuardada
                  ? estilos.textoEstadoMiniOk
                  : hayImagenPendiente
                    ? estilos.textoEstadoMiniPendiente
                    : estilos.textoEstadoMiniNeutro,
              ]}
            >
              {hayImagenBaseGuardada
                ? 'Guardada'
                : hayImagenPendiente
                  ? 'Pendiente'
                  : 'Guía'}
            </Text>
          </View>
        </View>

        <Text style={estilos.texto}>
          La foto debe ser frontal, de cuerpo completo, con brazos ligeramente
          separados y fondo limpio.
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
              <View style={estilos.avisoGuia}>
                <Text style={estilos.textoGuia}>
                  Imagen guía. Sirve para indicar la pose recomendada, pero no
                  se usa para generar simulaciones.
                </Text>
              </View>
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
              deshabilitado={guardando}
            />
          </>
        )}
      </Tarjeta>

      <Tarjeta>
        <View style={estilos.encabezadoTarjeta}>
          <View>
            <Text style={estilos.tituloTarjeta}>Prenda seleccionada</Text>
            <Text style={estilos.textoSecundario}>
              Elige una prenda activa del armario.
            </Text>
          </View>

          <View
            style={[
              estilos.estadoMini,
              hayPrendaSeleccionada
                ? estilos.estadoMiniOk
                : estilos.estadoMiniNeutro,
            ]}
          >
            <Text
              style={[
                estilos.textoEstadoMini,
                hayPrendaSeleccionada
                  ? estilos.textoEstadoMiniOk
                  : estilos.textoEstadoMiniNeutro,
              ]}
            >
              {hayPrendaSeleccionada ? 'Lista' : 'Sin elegir'}
            </Text>
          </View>
        </View>

        <View style={estilos.separador} />

        {prendas.length === 0 ? (
          <View style={estilos.estadoVacio}>
            <Text style={estilos.texto}>
              No hay prendas disponibles. Añade primero una prenda al armario.
            </Text>
            <View style={estilos.separador} />
            <BotonPrincipal
              texto="Añadir prenda"
              onPress={() => navegarA('altaPrenda')}
            />
          </View>
        ) : (
          prendas.map((prenda) => {
            const activa = prenda.id === prendaSeleccionadaId;

            return (
              <Pressable
                key={prenda.id}
                onPress={() => {
                  setPrendaSeleccionadaId(prenda.id);
                  setResultadoMock(null);
                  setResultadoIa(null);
                  setResultadoDemoLocal(null);
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
                    numberOfLines={1}
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

                <Text
                  style={[
                    estilos.textoSeleccion,
                    activa && estilos.textoSeleccionActivo,
                  ]}
                >
                  {activa ? 'Seleccionada' : 'Elegir'}
                </Text>
              </Pressable>
            );
          })
        )}
      </Tarjeta>

      <Tarjeta>
        <View style={estilos.encabezadoTarjeta}>
          <View>
            <Text style={estilos.tituloTarjeta}>Simulación try-on</Text>
            <Text style={estilos.textoSecundario}>
              Flujo mock, demo local y generación real con IA.
            </Text>
          </View>

          <View style={[estilos.estadoMini, estilos.estadoMiniPendiente]}>
            <Text
              style={[
                estilos.textoEstadoMini,
                estilos.textoEstadoMiniPendiente,
              ]}
            >
              Mock / Demo / IA
            </Text>
          </View>
        </View>

        <Text style={estilos.texto}>
          Puedes usar el mock para validar Supabase, la demo local para
          presentación sin red, o generar una imagen real con IA usando Nano
          Banana.
        </Text>

        <View style={estilos.resumenFlujo}>
          <FilaEstado
            texto="Imagen base guardada"
            completado={hayImagenBaseGuardada}
          />
          <FilaEstado
            texto="Prenda seleccionada"
            completado={hayPrendaSeleccionada}
          />
          <FilaEstado
            texto="Demo local sin red"
            completado={Boolean(resultadoDemoLocal)}
            pendiente={!resultadoDemoLocal}
          />
          <FilaEstado
            texto="Resultado real con IA"
            completado={Boolean(resultadoIa)}
            pendiente={!resultadoIa}
          />
        </View>

        <View style={estilos.separador} />

        <BotonPrincipal
          texto={generando ? 'Guardando sesión mock...' : 'Generar try-on mock'}
          onPress={generarSimulacionMock}
          deshabilitado={generacionEnCurso}
        />

        <View style={estilos.separador} />

        <BotonPrincipal
          texto="Generar demo local sin red"
          variante="secundario"
          onPress={generarDemoLocal}
          deshabilitado={generacionEnCurso}
        />

        <View style={estilos.separador} />

        <BotonPrincipal
          texto={generandoIa ? 'Generando con IA...' : 'Generar try-on con IA'}
          variante="secundario"
          onPress={generarSimulacionIa}
          deshabilitado={generacionEnCurso}
        />

        {resultadoMock && (
          <View style={estilos.resultadoMock}>
            <Text style={estilos.resultadoTitulo}>Resultado provisional</Text>
            <Text style={estilos.texto}>{resultadoMock}</Text>
            <Text style={estilos.textoSecundario}>
              El resultado mock se ha añadido al historial.
            </Text>

            <View style={estilos.separador} />

            <BotonPrincipal
              texto="Ver historial"
              variante="secundario"
              onPress={() => navegarA('historial')}
            />
          </View>
        )}

        {resultadoDemoLocal && (
          <View style={estilos.resultadoMock}>
            <Text style={estilos.resultadoTitulo}>Resultado demo local</Text>
            <Text style={estilos.texto}>{resultadoDemoLocal}</Text>
            <Text style={estilos.textoSecundario}>
              Este resultado no usa Supabase, Gemini ni conexión de red. Sirve
              como respaldo para enseñar el funcionamiento visual de la app
              durante la presentación.
            </Text>

            <View style={estilos.separador} />

            <BotonPrincipal
              texto="Ver historial"
              variante="secundario"
              onPress={() => navegarA('historial')}
            />
          </View>
        )}

        {resultadoIa && (
          <View style={estilos.resultadoMock}>
            <Text style={estilos.resultadoTitulo}>Resultado IA</Text>
            <Text style={estilos.texto}>{resultadoIa}</Text>
            <Text style={estilos.textoSecundario}>
              El resultado generado se ha guardado en Supabase y aparecerá en el
              historial.
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
        <Text style={estilos.tituloTarjeta}>Requisitos de la imagen base</Text>

        <View style={estilos.listaRequisitos}>
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
        </View>
      </Tarjeta>

      <Tarjeta>
        <Text style={estilos.tituloTarjeta}>Flujo técnico previsto</Text>

        {PASOS_TRYON.map((paso, indice) => (
          <View key={indice} style={estilos.paso}>
            <View style={estilos.numero}>
              <Text style={estilos.textoNumero}>{indice + 1}</Text>
            </View>
            <Text style={estilos.textoPaso}>{paso}</Text>
          </View>
        ))}

        <View style={estilos.separador} />

        <Text style={estilos.textoSecundario}>
          Estado actual: el flujo mock funciona como respaldo, la demo local
          permite presentar sin conexión y el proveedor IA ya está conectado
          como flujo separado.
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

interface PropiedadesFilaEstado {
  texto: string;
  completado: boolean;
  pendiente?: boolean;
}

function FilaEstado({
  texto,
  completado,
  pendiente = false,
}: PropiedadesFilaEstado) {
  return (
    <View style={estilos.filaEstado}>
      <View
        style={[
          estilos.puntoEstado,
          completado
            ? estilos.puntoEstadoOk
            : pendiente
              ? estilos.puntoEstadoPendiente
              : estilos.puntoEstadoNeutro,
        ]}
      />
      <Text style={estilos.textoFilaEstado}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    padding: 16,
    paddingBottom: 32,
  },
  encabezadoTarjeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tituloTarjeta: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
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
  },
  estadoMini: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    marginLeft: 10,
  },
  estadoMiniOk: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  estadoMiniPendiente: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  estadoMiniNeutro: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  textoEstadoMini: {
    fontSize: 12,
    fontWeight: '700',
  },
  textoEstadoMiniOk: {
    color: '#047857',
  },
  textoEstadoMiniPendiente: {
    color: '#92400e',
  },
  textoEstadoMiniNeutro: {
    color: '#374151',
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
  avisoGuia: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textoGuia: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  estadoVacio: {
    marginTop: 4,
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
    width: 56,
    height: 56,
    borderRadius: 9,
    backgroundColor: '#f3f4f6',
  },
  prendaImagenPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 9,
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
    fontWeight: '700',
    color: '#111827',
  },
  prendaNombreActiva: {
    color: '#ffffff',
  },
  prendaCategoria: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    fontWeight: '500',
  },
  prendaCategoriaActiva: {
    color: '#d1d5db',
  },
  textoSeleccion: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '700',
    marginLeft: 8,
  },
  textoSeleccionActivo: {
    color: '#ffffff',
  },
  resumenFlujo: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filaEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  puntoEstado: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  puntoEstadoOk: {
    backgroundColor: '#10b981',
  },
  puntoEstadoPendiente: {
    backgroundColor: '#f59e0b',
  },
  puntoEstadoNeutro: {
    backgroundColor: '#d1d5db',
  },
  textoFilaEstado: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  resultadoMock: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
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
  listaRequisitos: {
    marginTop: 2,
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
    fontWeight: '600',
  },
  separador: {
    height: 10,
  },
});