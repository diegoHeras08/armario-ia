import React, { useMemo, useState } from 'react';
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
import { TarjetaPrenda } from '../componentes/TarjetaPrenda';
import {
  CATEGORIAS_PRENDA,
  CategoriaPrenda,
  ETIQUETAS_CATEGORIA,
  NuevaPrendaEntrada,
  Prenda,
} from '../tipos/prenda';
import { NombrePantalla } from '../tipos/navegacion';
import {
  actualizarImagenPrincipalPrendaEnSupabase,
  actualizarPrendaEnSupabase,
  eliminarPrendaEnSupabase,
  validarNuevaPrenda,
} from '../servicios/prendaServicio';

interface PropiedadesArmario {
  prendas: Prenda[];
  navegarA: (pantalla: NombrePantalla) => void;
  onPrendaActualizada?: (prenda: Prenda) => void;
  onPrendaEliminada?: (idPrenda: string) => void;
}

type FiltroCategoria = CategoriaPrenda | 'todas';

export function ArmarioPantalla({
  prendas,
  navegarA,
  onPrendaActualizada,
  onPrendaEliminada,
}: PropiedadesArmario) {
  const [filtro, setFiltro] = useState<FiltroCategoria>('todas');
  const [prendaSeleccionada, setPrendaSeleccionada] =
    useState<Prenda | null>(null);

  const [modoEdicion, setModoEdicion] = useState(false);
  const [nombreEditado, setNombreEditado] = useState('');
  const [categoriaEditada, setCategoriaEditada] =
    useState<CategoriaPrenda>('camiseta');
  const [notasEditadas, setNotasEditadas] = useState('');
  const [errorEdicion, setErrorEdicion] = useState<string | null>(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const [cambiandoImagen, setCambiandoImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState<string | null>(null);

  const [eliminando, setEliminando] = useState(false);
  const [errorEliminacion, setErrorEliminacion] = useState<string | null>(null);

  const prendasFiltradas = useMemo(() => {
    if (filtro === 'todas') return prendas;
    return prendas.filter((p) => p.categoria === filtro);
  }, [prendas, filtro]);

  function abrirDetalle(prenda: Prenda) {
    setPrendaSeleccionada(prenda);
    setModoEdicion(false);
    setErrorEdicion(null);
    setErrorImagen(null);
    setErrorEliminacion(null);
  }

  function cerrarDetalle() {
    setPrendaSeleccionada(null);
    setModoEdicion(false);
    setErrorEdicion(null);
    setErrorImagen(null);
    setErrorEliminacion(null);
  }

  function iniciarEdicion() {
    if (!prendaSeleccionada) {
      return;
    }

    setNombreEditado(prendaSeleccionada.nombre);
    setCategoriaEditada(prendaSeleccionada.categoria);
    setNotasEditadas(prendaSeleccionada.notas);
    setErrorEdicion(null);
    setModoEdicion(true);
  }

  function cancelarEdicion() {
    setModoEdicion(false);
    setErrorEdicion(null);
  }

  async function guardarEdicion() {
    if (!prendaSeleccionada || guardandoEdicion) {
      return;
    }

    const entrada: NuevaPrendaEntrada = {
      nombre: nombreEditado,
      categoria: categoriaEditada,
      notas: notasEditadas,
    };

    const mensajeError = validarNuevaPrenda(entrada);

    if (mensajeError) {
      setErrorEdicion(mensajeError);
      return;
    }

    setGuardandoEdicion(true);
    setErrorEdicion(null);

    const resultado = await actualizarPrendaEnSupabase(
      prendaSeleccionada.id,
      entrada
    );

    setGuardandoEdicion(false);

    if (resultado.error || !resultado.prenda) {
      setErrorEdicion(`No se pudo actualizar la prenda: ${resultado.error}`);
      return;
    }

    setPrendaSeleccionada(resultado.prenda);
    onPrendaActualizada?.(resultado.prenda);
    setModoEdicion(false);

    Alert.alert(
      'Prenda actualizada',
      `"${resultado.prenda.nombre}" se ha actualizado correctamente.`
    );
  }

  async function cambiarFotoPrenda() {
    if (!prendaSeleccionada || cambiandoImagen) {
      return;
    }

    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      setErrorImagen('Necesitas conceder permiso para acceder a la galería.');
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
      setErrorImagen('No se ha podido preparar la nueva imagen.');
      return;
    }

    setCambiandoImagen(true);
    setErrorImagen(null);

    const resultadoActualizacion =
      await actualizarImagenPrincipalPrendaEnSupabase(prendaSeleccionada.id, {
        base64: asset.base64,
        mimeType: asset.mimeType ?? 'image/jpeg',
      });

    setCambiandoImagen(false);

    if (resultadoActualizacion.error || !resultadoActualizacion.prenda) {
      setErrorImagen(
        `No se pudo cambiar la foto: ${resultadoActualizacion.error}`
      );
      return;
    }

    setPrendaSeleccionada(resultadoActualizacion.prenda);
    onPrendaActualizada?.(resultadoActualizacion.prenda);

    Alert.alert(
      'Foto actualizada',
      `La imagen de "${resultadoActualizacion.prenda.nombre}" se ha actualizado correctamente.`
    );
  }

  function confirmarEliminacion() {
    if (!prendaSeleccionada || eliminando) {
      return;
    }

    Alert.alert(
      'Eliminar prenda',
      `¿Seguro que quieres eliminar "${prendaSeleccionada.nombre}" del armario?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: eliminarPrendaSeleccionada,
        },
      ]
    );
  }

  async function eliminarPrendaSeleccionada() {
    if (!prendaSeleccionada || eliminando) {
      return;
    }

    setEliminando(true);
    setErrorEliminacion(null);

    const resultado = await eliminarPrendaEnSupabase(prendaSeleccionada.id);

    setEliminando(false);

    if (resultado.error || !resultado.idPrenda) {
      setErrorEliminacion(`No se pudo eliminar la prenda: ${resultado.error}`);
      return;
    }

    onPrendaEliminada?.(resultado.idPrenda);

    Alert.alert(
      'Prenda eliminada',
      `"${prendaSeleccionada.nombre}" se ha eliminado del armario.`
    );

    cerrarDetalle();
  }

  if (prendaSeleccionada) {
    const etiquetaCategoria =
      ETIQUETAS_CATEGORIA[prendaSeleccionada.categoria] ?? 'Otro';

    const tieneNotas = prendaSeleccionada.notas.trim().length > 0;

    return (
      <ScrollView contentContainerStyle={estilos.contenedor}>
        <EncabezadoPantalla
          titulo={modoEdicion ? 'Editar prenda' : 'Detalle de prenda'}
          subtitulo={
            modoEdicion
              ? 'Modifica los datos básicos de la prenda'
              : 'Vista completa de la prenda seleccionada'
          }
        />

        <View style={estilos.detalleTarjeta}>
          {prendaSeleccionada.imagenUrl ? (
            <Image
              source={{ uri: prendaSeleccionada.imagenUrl }}
              style={estilos.imagenDetalle}
              resizeMode="cover"
            />
          ) : (
            <View style={estilos.placeholderDetalle}>
              <Text style={estilos.textoPlaceholder}>Sin imagen</Text>
            </View>
          )}

          {modoEdicion ? (
            <>
              <Text style={estilos.etiquetaFormulario}>Nombre</Text>
              <TextInput
                style={estilos.input}
                value={nombreEditado}
                onChangeText={setNombreEditado}
                placeholder="Ej. Camiseta blanca básica"
                placeholderTextColor="#9ca3af"
              />

              <Text style={estilos.etiquetaFormulario}>Categoría</Text>
              <View style={estilos.gridCategorias}>
                {CATEGORIAS_PRENDA.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setCategoriaEditada(cat)}
                    style={[
                      estilos.opcionCategoria,
                      categoriaEditada === cat &&
                        estilos.opcionCategoriaActiva,
                    ]}
                  >
                    <Text
                      style={[
                        estilos.textoOpcion,
                        categoriaEditada === cat &&
                          estilos.textoOpcionActivo,
                      ]}
                    >
                      {ETIQUETAS_CATEGORIA[cat]}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={estilos.etiquetaFormulario}>Notas</Text>
              <TextInput
                style={[estilos.input, estilos.inputMultilinea]}
                value={notasEditadas}
                onChangeText={setNotasEditadas}
                placeholder="Detalles opcionales sobre la prenda"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />

              {errorEdicion && (
                <Text style={estilos.error}>{errorEdicion}</Text>
              )}

              <View style={estilos.separador} />

              <BotonPrincipal
                texto={guardandoEdicion ? 'Guardando...' : 'Guardar cambios'}
                onPress={guardarEdicion}
              />

              <View style={estilos.separador} />

              <BotonPrincipal
                texto="Cancelar edición"
                variante="secundario"
                onPress={cancelarEdicion}
              />
            </>
          ) : (
            <>
              <Text style={estilos.nombreDetalle}>
                {prendaSeleccionada.nombre}
              </Text>

              <View style={estilos.etiquetaDetalle}>
                <Text style={estilos.textoEtiquetaDetalle}>
                  {etiquetaCategoria}
                </Text>
              </View>

              <View style={estilos.bloqueInfo}>
                <Text style={estilos.tituloInfo}>Notas</Text>
                <Text style={estilos.textoInfo}>
                  {tieneNotas
                    ? prendaSeleccionada.notas
                    : 'No hay notas registradas para esta prenda.'}
                </Text>
              </View>

              {errorImagen && <Text style={estilos.error}>{errorImagen}</Text>}
              {errorEliminacion && (
                <Text style={estilos.error}>{errorEliminacion}</Text>
              )}

              <View style={estilos.separador} />

              <BotonPrincipal
                texto="Editar prenda"
                onPress={iniciarEdicion}
              />

              <View style={estilos.separador} />

              <BotonPrincipal
                texto={cambiandoImagen ? 'Cambiando foto...' : 'Cambiar foto'}
                variante="secundario"
                onPress={cambiarFotoPrenda}
              />

              <View style={estilos.separador} />

              <BotonPrincipal
                texto={eliminando ? 'Eliminando...' : 'Eliminar prenda'}
                variante="secundario"
                onPress={confirmarEliminacion}
              />

              <View style={estilos.separador} />

              <BotonPrincipal
                texto="Volver al armario"
                variante="secundario"
                onPress={cerrarDetalle}
              />
            </>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <EncabezadoPantalla
        titulo="Armario"
        subtitulo={`${prendas.length} prendas registradas`}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={estilos.filtros}
      >
        <ChipFiltro
          texto="Todas"
          activo={filtro === 'todas'}
          onPress={() => setFiltro('todas')}
        />
        {CATEGORIAS_PRENDA.map((cat) => (
          <ChipFiltro
            key={cat}
            texto={ETIQUETAS_CATEGORIA[cat]}
            activo={filtro === cat}
            onPress={() => setFiltro(cat)}
          />
        ))}
      </ScrollView>

      {prendasFiltradas.length === 0 ? (
        <View style={estilos.estadoVacio}>
          <Text style={estilos.tituloVacio}>Sin prendas en esta categoría</Text>
          <Text style={estilos.subtituloVacio}>
            Añade una nueva prenda para empezar a usar el armario.
          </Text>
          <View style={estilos.separador} />
          <BotonPrincipal
            texto="Añadir prenda"
            onPress={() => navegarA('altaPrenda')}
          />
        </View>
      ) : (
        prendasFiltradas.map((prenda) => (
          <Pressable key={prenda.id} onPress={() => abrirDetalle(prenda)}>
            <TarjetaPrenda prenda={prenda} />
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

interface PropiedadesChip {
  texto: string;
  activo: boolean;
  onPress: () => void;
}

function ChipFiltro({ texto, activo, onPress }: PropiedadesChip) {
  return (
    <Pressable
      onPress={onPress}
      style={[estilos.chip, activo && estilos.chipActivo]}
    >
      <Text style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}>
        {texto}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    padding: 16,
    paddingBottom: 32,
  },
  filtros: {
    paddingBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActivo: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  chipTexto: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  chipTextoActivo: {
    color: '#ffffff',
  },
  estadoVacio: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  tituloVacio: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  subtituloVacio: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  detalleTarjeta: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  imagenDetalle: {
    width: '100%',
    height: 360,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    marginBottom: 16,
  },
  placeholderDetalle: {
    width: '100%',
    height: 260,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  textoPlaceholder: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  nombreDetalle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  etiquetaDetalle: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 16,
  },
  textoEtiquetaDetalle: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  bloqueInfo: {
    marginTop: 4,
  },
  tituloInfo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  textoInfo: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  etiquetaFormulario: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
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
    height: 12,
  },
});