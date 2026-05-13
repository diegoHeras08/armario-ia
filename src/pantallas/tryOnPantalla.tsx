import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { BotonPrincipal } from '../componentes/BotonPrincipal';
import { EncabezadoPantalla } from '../componentes/EncabezadoPantalla';
import { Tarjeta } from '../componentes/Tarjeta';
import { PASOS_TRYON } from '../servicios/tryOnServicio';
import { NombrePantalla } from '../tipos/navegacion';
import {
  guardarImagenUsuarioPrincipal,
  obtenerImagenUsuarioPrincipal,
} from '../servicios/imagenUsuarioServicio';

const imagenGuiaModelo = require('../../assets/modelo-guia.png');

interface PropiedadesTryOn {
  navegarA: (pantalla: NombrePantalla) => void;
}

export function TryOnPantalla({ navegarA }: PropiedadesTryOn) {
  const [imagenBaseUrl, setImagenBaseUrl] = useState<string | null>(null);
  const [imagenPreviewUri, setImagenPreviewUri] = useState<string | null>(null);
  const [imagenBase64, setImagenBase64] = useState<string | null>(null);
  const [imagenMimeType, setImagenMimeType] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          La imagen base queda preparada para la siguiente fase. La generación
          real con IA se añadirá más adelante.
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