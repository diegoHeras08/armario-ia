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
type ModoVistaArmario = 'lista' | 'cuadricula';

export function ArmarioPantalla({
  prendas,
  navegarA,
  onPrendaActualizada,
  onPrendaEliminada,
}: PropiedadesArmario) {
  const [filtro, setFiltro] = useState<FiltroCategoria>('todas');
  const [modoVista, setModoVista] = useState<ModoVistaArmario>('lista');

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

  function alternarModoVista() {
    setModoVista((modoActual) =>
      modoActual === 'lista' ? 'cuadricula' : 'lista'
    );
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

  async function cambiarFotoPrenda(recortar: boolean) {
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
      allowsEditing: recortar,
      quality: 0.8,
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
              resizeMode="contain"
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
                deshabilitado={guardandoEdicion}
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

              <View style={estilos.seccionAcciones}>
                <Text style={estilos.tituloSeccion}>Acciones principales</Text>

                <BotonPrincipal texto="Editar prenda" onPress={iniciarEdicion} />

                <View style={estilos.separador} />

                <BotonPrincipal
                  texto={
                    cambiandoImagen
                      ? 'Cambiando foto...'
                      : 'Cambiar foto completa'
                  }
                  variante="secundario"
                  onPress={() => cambiarFotoPrenda(false)}
                  deshabilitado={cambiandoImagen}
                />

                <View style={estilos.separador} />

                <BotonPrincipal
                  texto={
                    cambiandoImagen
                      ? 'Cambiando foto...'
                      : 'Cambiar y recortar foto'
                  }
                  variante="secundario"
                  onPress={() => cambiarFotoPrenda(true)}
                  deshabilitado={cambiandoImagen}
                />

                <Text style={estilos.textoAyudaImagen}>
                  La opción completa conserva el formato original. La opción de
                  recorte abre el editor del sistema sin imponer formato 4:5.
                </Text>
              </View>

              <View style={estilos.seccionAcciones}>
                <Text style={estilos.tituloSeccion}>Navegación</Text>

                <BotonPrincipal
                  texto="Volver al armario"
                  variante="secundario"
                  onPress={cerrarDetalle}
                />
              </View>

              <View style={estilos.zonaPeligro}>
                <Text style={estilos.tituloPeligro}>Zona peligrosa</Text>
                <Text style={estilos.textoPeligro}>
                  Esta acción oculta la prenda del armario, pero conserva sus
                  datos en Supabase para no romper relaciones con imágenes o
                  sesiones try-on.
                </Text>

                <View style={estilos.separador} />

                <BotonPrincipal
                  texto={eliminando ? 'Eliminando...' : 'Eliminar prenda'}
                  variante="peligro"
                  onPress={confirmarEliminacion}
                  deshabilitado={eliminando}
                />
              </View>
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

      <View style={estilos.barraHerramientas}>
        <View>
          <Text style={estilos.tituloHerramienta}>Vista del armario</Text>
          <Text style={estilos.textoHerramienta}>
            {modoVista === 'lista'
              ? 'Lista detallada con notas e imagen grande.'
              : 'Cuadrícula visual para revisar más prendas de un vistazo.'}
          </Text>
        </View>

        <Pressable onPress={alternarModoVista} style={estilos.botonVista}>
          <Text style={estilos.textoBotonVista}>
            {modoVista === 'lista' ? 'Cuadrícula' : 'Lista'}
          </Text>
        </Pressable>
      </View>

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
      ) : modoVista === 'lista' ? (
        prendasFiltradas.map((prenda) => (
          <Pressable key={prenda.id} onPress={() => abrirDetalle(prenda)}>
            <TarjetaPrenda prenda={prenda} modo="lista" />
          </Pressable>
        ))
      ) : (
        <View style={estilos.gridPrendas}>
          {prendasFiltradas.map((prenda) => (
            <Pressable
              key={prenda.id}
              onPress={() => abrirDetalle(prenda)}
              style={estilos.itemGridPrenda}
            >
              <TarjetaPrenda prenda={prenda} modo="cuadricula" />
            </Pressable>
          ))}
        </View>
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
  barraHerramientas: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tituloHerramienta: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  textoHerramienta: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    maxWidth: 210,
  },
  botonVista: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginLeft: 10,
  },
  textoBotonVista: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
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
  gridPrendas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  itemGridPrenda: {
    width: '50%',
    paddingHorizontal: 5,
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
    marginBottom: 8,
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
  seccionAcciones: {
    marginTop: 18,
  },
  tituloSeccion: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  textoAyudaImagen: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginTop: 10,
  },
  zonaPeligro: {
    marginTop: 24,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff7f7',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  tituloPeligro: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991b1b',
    marginBottom: 4,
  },
  textoPeligro: {
    fontSize: 13,
    color: '#7f1d1d',
    lineHeight: 18,
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