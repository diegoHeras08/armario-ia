import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { BotonPrincipal } from '../componentes/BotonPrincipal';
import { EncabezadoPantalla } from '../componentes/EncabezadoPantalla';
import {
  CATEGORIAS_PRENDA,
  CategoriaPrenda,
  ETIQUETAS_CATEGORIA,
  NuevaPrendaEntrada,
  Prenda,
} from '../tipos/prenda';
import {
  crearPrendaEnSupabase,
  validarNuevaPrenda,
} from '../servicios/prendaServicio';
import { NombrePantalla } from '../tipos/navegacion';

interface PropiedadesAltaPrenda {
  onPrendaCreada: (prenda: Prenda) => void;
  navegarA: (pantalla: NombrePantalla) => void;
}

export function AltaPrendaPantalla({
  onPrendaCreada,
  navegarA,
}: PropiedadesAltaPrenda) {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState<CategoriaPrenda>('camiseta');
  const [notas, setNotas] = useState('');

  const [imagenUri, setImagenUri] = useState<string | null>(null);
  const [imagenBase64, setImagenBase64] = useState<string | null>(null);
  const [imagenMimeType, setImagenMimeType] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function seleccionarImagen(recortar: boolean) {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      setError('Necesitas conceder permiso para acceder a la galería.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: recortar,
      quality: 0.8,
      base64: true,
    });

    if (resultado.canceled) {
      return;
    }

    const asset = resultado.assets[0];

    if (!asset?.uri) {
      setError('No se ha podido obtener la imagen seleccionada.');
      return;
    }

    if (!asset.base64) {
      setError('No se ha podido preparar la imagen para subirla a Storage.');
      return;
    }

    setImagenUri(asset.uri);
    setImagenBase64(asset.base64);
    setImagenMimeType(asset.mimeType ?? 'image/jpeg');
    setError(null);
  }

  function quitarImagen() {
    setImagenUri(null);
    setImagenBase64(null);
    setImagenMimeType(null);
    setError(null);
  }

  function limpiarFormulario() {
    setNombre('');
    setNotas('');
    setCategoria('camiseta');
    setImagenUri(null);
    setImagenBase64(null);
    setImagenMimeType(null);
    setError(null);
  }

  const guardar = async () => {
    if (guardando) {
      return;
    }

    const entrada: NuevaPrendaEntrada = { nombre, categoria, notas };

    const mensajeError = validarNuevaPrenda(entrada);

    if (mensajeError) {
      setError(mensajeError);
      return;
    }

    const imagenSeleccionada =
      imagenBase64 && imagenMimeType
        ? {
            base64: imagenBase64,
            mimeType: imagenMimeType,
          }
        : undefined;

    setGuardando(true);
    setError(null);

    const resultado = await crearPrendaEnSupabase(entrada, imagenSeleccionada);

    setGuardando(false);

    if (resultado.error || !resultado.prenda) {
      setError(`No se pudo guardar en Supabase: ${resultado.error}`);
      return;
    }

    onPrendaCreada(resultado.prenda);

    Alert.alert(
      'Prenda añadida',
      imagenSeleccionada
        ? `"${resultado.prenda.nombre}" se ha guardado con imagen.`
        : `"${resultado.prenda.nombre}" se ha guardado en Supabase.`
    );

    limpiarFormulario();
    navegarA('armario');
  };

  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <EncabezadoPantalla
        titulo="Añadir prenda"
        subtitulo="Registra una nueva prenda en el armario"
      />

      <View style={estilos.tarjeta}>
        <Text style={estilos.etiqueta}>Imagen de la prenda</Text>

        <Text style={estilos.textoAyudaImagen}>
          Puedes subir la imagen completa o abrir el editor para recortarla. El
          recorte ya no fuerza un formato 4:5.
        </Text>

        {imagenUri ? (
          <Image
            source={{ uri: imagenUri }}
            style={estilos.imagenPreview}
            resizeMode="contain"
          />
        ) : (
          <View style={estilos.placeholderImagen}>
            <Text style={estilos.textoPlaceholder}>Sin imagen seleccionada</Text>
          </View>
        )}

        <View style={estilos.separador} />

        <BotonPrincipal
          texto={
            imagenUri ? 'Cambiar imagen completa' : 'Seleccionar imagen completa'
          }
          variante="secundario"
          onPress={() => seleccionarImagen(false)}
        />

        <View style={estilos.separador} />

        <BotonPrincipal
          texto={
            imagenUri
              ? 'Cambiar y recortar imagen'
              : 'Seleccionar y recortar imagen'
          }
          variante="secundario"
          onPress={() => seleccionarImagen(true)}
        />

        {imagenUri && (
          <>
            <View style={estilos.separador} />
            <BotonPrincipal
              texto="Quitar imagen"
              variante="secundario"
              onPress={quitarImagen}
            />
          </>
        )}

        <Text style={estilos.etiqueta}>Nombre</Text>
        <TextInput
          style={estilos.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej. Camiseta blanca básica"
          placeholderTextColor="#9ca3af"
        />

        <Text style={estilos.etiqueta}>Categoría</Text>
        <View style={estilos.gridCategorias}>
          {CATEGORIAS_PRENDA.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setCategoria(cat)}
              style={[
                estilos.opcionCategoria,
                categoria === cat && estilos.opcionCategoriaActiva,
              ]}
            >
              <Text
                style={[
                  estilos.textoOpcion,
                  categoria === cat && estilos.textoOpcionActivo,
                ]}
              >
                {ETIQUETAS_CATEGORIA[cat]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={estilos.etiqueta}>Notas</Text>
        <TextInput
          style={[estilos.input, estilos.inputMultilinea]}
          value={notas}
          onChangeText={setNotas}
          placeholder="Detalles opcionales sobre la prenda"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
        />

        {error && <Text style={estilos.error}>{error}</Text>}

        <View style={estilos.separador} />

        <BotonPrincipal
          texto={guardando ? 'Guardando...' : 'Guardar prenda'}
          onPress={guardar}
          deshabilitado={guardando}
        />

        <View style={estilos.separador} />

        <BotonPrincipal
          texto="Cancelar"
          variante="secundario"
          onPress={() => navegarA('dashboard')}
        />
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    padding: 16,
    paddingBottom: 32,
  },
  tarjeta: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  etiqueta: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  textoAyudaImagen: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 10,
  },
  imagenPreview: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  placeholderImagen: {
    width: '100%',
    height: 150,
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
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  inputMultilinea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  gridCategorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  opcionCategoria: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
    marginBottom: 8,
  },
  opcionCategoriaActiva: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  textoOpcion: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  textoOpcionActivo: {
    color: '#ffffff',
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