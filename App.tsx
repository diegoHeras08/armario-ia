import React, { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { DashboardPantalla } from './src/pantallas/dashboardPantalla';
import { ArmarioPantalla } from './src/pantallas/armarioPantalla';
import { AltaPrendaPantalla } from './src/pantallas/altaPrendaPantalla';
import { TryOnPantalla } from './src/pantallas/tryOnPantalla';
import { HistorialPantalla } from './src/pantallas/historialPantalla';

import { Prenda } from './src/tipos/prenda';
import { ResultadoTryOn } from './src/tipos/tryOn';
import { NombrePantalla } from './src/tipos/navegacion';

import { PRENDAS_MOCK } from './src/datos/prendasMock';
import { HISTORIAL_MOCK } from './src/datos/historialMock';

import { obtenerEstadoSupabase } from './src/servicios/supabaseEstadoServicio';
import { obtenerPrendasDesdeSupabase } from './src/servicios/prendaServicio';
import { obtenerHistorialTryOnDesdeSupabase } from './src/servicios/tryOnServicio';

const ETIQUETAS_NAVEGACION: Record<NombrePantalla, string> = {
  dashboard: 'Inicio',
  armario: 'Armario',
  altaPrenda: 'Añadir',
  tryOn: 'Try-on',
  historial: 'Historial',
};

const PANTALLAS_NAVEGABLES: NombrePantalla[] = [
  'dashboard',
  'armario',
  'altaPrenda',
  'tryOn',
  'historial',
];

export default function App() {
  return (
    <SafeAreaProvider>
      <AplicacionContenido />
    </SafeAreaProvider>
  );
}

function AplicacionContenido() {
  const insets = useSafeAreaInsets();

  const [pantallaActual, setPantallaActual] =
    useState<NombrePantalla>('dashboard');

  const [prendas, setPrendas] = useState<Prenda[]>(PRENDAS_MOCK);
  const [historial, setHistorial] =
    useState<ResultadoTryOn[]>(HISTORIAL_MOCK);

  const [cargandoPrendas, setCargandoPrendas] = useState(true);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);

  const [errorCargaPrendas, setErrorCargaPrendas] = useState<string | null>(
    null
  );

  const [errorCargaHistorial, setErrorCargaHistorial] = useState<string | null>(
    null
  );

  const [modoAltoContraste, setModoAltoContraste] = useState(false);
  const [modoPresentacion, setModoPresentacion] = useState(false);

  const estadoSupabase = useMemo(() => obtenerEstadoSupabase(), []);
  const cargandoDatosIniciales = cargandoPrendas || cargandoHistorial;

  const paddingSuperiorSeguro =
    Platform.OS === 'android'
      ? Math.max(insets.top, StatusBar.currentHeight ?? 0)
      : insets.top;

  const paddingInferiorBarra =
    Platform.OS === 'android'
      ? Math.max(insets.bottom, 72)
      : Math.max(insets.bottom, 18);

  useEffect(() => {
    let componenteActivo = true;

    async function cargarPrendasRemotas() {
      try {
        setCargandoPrendas(true);

        const resultado = await obtenerPrendasDesdeSupabase();

        if (!componenteActivo) {
          return;
        }

        if (resultado.error) {
          setErrorCargaPrendas(resultado.error);
          return;
        }

        setPrendas(resultado.prendas);
        setErrorCargaPrendas(null);
      } catch (error) {
        if (!componenteActivo) {
          return;
        }

        setErrorCargaPrendas(
          error instanceof Error
            ? error.message
            : 'Error inesperado al cargar prendas desde Supabase.'
        );
      } finally {
        if (componenteActivo) {
          setCargandoPrendas(false);
        }
      }
    }

    cargarPrendasRemotas();

    return () => {
      componenteActivo = false;
    };
  }, []);

  useEffect(() => {
    let componenteActivo = true;

    async function cargarHistorialRemoto() {
      try {
        setCargandoHistorial(true);

        const resultado = await obtenerHistorialTryOnDesdeSupabase();

        if (!componenteActivo) {
          return;
        }

        if (resultado.error) {
          setErrorCargaHistorial(resultado.error);
          return;
        }

        setHistorial(resultado.resultados);
        setErrorCargaHistorial(null);
      } catch (error) {
        if (!componenteActivo) {
          return;
        }

        setErrorCargaHistorial(
          error instanceof Error
            ? error.message
            : 'Error inesperado al cargar el historial desde Supabase.'
        );
      } finally {
        if (componenteActivo) {
          setCargandoHistorial(false);
        }
      }
    }

    cargarHistorialRemoto();

    return () => {
      componenteActivo = false;
    };
  }, []);

  function navegarA(pantalla: NombrePantalla) {
    setPantallaActual(pantalla);
  }

  function anadirPrenda(prenda: Prenda) {
    setPrendas((prev) => [prenda, ...prev]);
    setErrorCargaPrendas(null);
  }

  function actualizarPrendaEnEstado(prendaActualizada: Prenda) {
    setPrendas((prev) =>
      prev.map((prenda) =>
        prenda.id === prendaActualizada.id ? prendaActualizada : prenda
      )
    );

    setErrorCargaPrendas(null);
  }

  function eliminarPrendaEnEstado(idPrenda: string) {
    setPrendas((prev) => prev.filter((prenda) => prenda.id !== idPrenda));
    setErrorCargaPrendas(null);
  }

  function anadirResultadoTryOn(resultado: ResultadoTryOn) {
    setHistorial((prev) => [resultado, ...prev]);
    setErrorCargaHistorial(null);
  }

  function alternarModoAltoContraste() {
    setModoAltoContraste((valor) => !valor);
  }

  function alternarModoPresentacion() {
    setModoPresentacion((valor) => !valor);
  }

  function renderizarPantalla() {
    switch (pantallaActual) {
      case 'dashboard':
        return (
          <DashboardPantalla
            prendas={prendas}
            estadoSupabase={estadoSupabase}
            navegarA={navegarA}
            modoAltoContraste={modoAltoContraste}
            modoPresentacion={modoPresentacion}
            onAlternarModoAltoContraste={alternarModoAltoContraste}
            onAlternarModoPresentacion={alternarModoPresentacion}
          />
        );

      case 'armario':
        return (
          <ArmarioPantalla
            prendas={prendas}
            navegarA={navegarA}
            onPrendaActualizada={actualizarPrendaEnEstado}
            onPrendaEliminada={eliminarPrendaEnEstado}
          />
        );

      case 'altaPrenda':
        return (
          <AltaPrendaPantalla
            onPrendaCreada={anadirPrenda}
            navegarA={navegarA}
          />
        );

      case 'tryOn':
        return (
          <TryOnPantalla
            prendas={prendas}
            onResultadoCreado={anadirResultadoTryOn}
            navegarA={navegarA}
          />
        );

      case 'historial':
        return (
          <HistorialPantalla resultados={historial} navegarA={navegarA} />
        );

      default:
        return null;
    }
  }

  return (
    <View
      style={[
        estilos.contenedor,
        modoAltoContraste && estilos.contenedorOscuro,
        { paddingTop: paddingSuperiorSeguro },
      ]}
    >
      <StatusBar
        barStyle={modoAltoContraste ? 'light-content' : 'dark-content'}
      />

      <View style={estilos.contenido}>
        {cargandoDatosIniciales && (
          <View
            style={[
              estilos.avisoCarga,
              modoAltoContraste && estilos.avisoCargaOscuro,
            ]}
          >
            <Text
              style={[
                estilos.textoAvisoCarga,
                modoAltoContraste && estilos.textoAvisoCargaOscuro,
              ]}
            >
              Sincronizando datos...
            </Text>
          </View>
        )}

        {!cargandoPrendas && errorCargaPrendas && (
          <View style={estilos.avisoError}>
            <Text style={estilos.textoAvisoError}>
              No se pudieron cargar las prendas desde Supabase. Se muestran
              datos locales.
            </Text>
          </View>
        )}

        {!cargandoHistorial && errorCargaHistorial && (
          <View style={estilos.avisoError}>
            <Text style={estilos.textoAvisoError}>
              No se pudo cargar el historial try-on.
            </Text>
          </View>
        )}

        {renderizarPantalla()}
      </View>

      <View
        style={[
          estilos.barraNavegacion,
          modoAltoContraste && estilos.barraNavegacionOscura,
          {
            paddingBottom: paddingInferiorBarra,
            minHeight: 68 + paddingInferiorBarra,
          },
        ]}
      >
        {PANTALLAS_NAVEGABLES.map((pantalla) => {
          const activo = pantallaActual === pantalla;

          return (
            <Pressable
              key={pantalla}
              onPress={() => navegarA(pantalla)}
              hitSlop={10}
              style={[
                estilos.botonNavegacion,
                activo && estilos.botonNavegacionActivo,
                modoAltoContraste &&
                  activo &&
                  estilos.botonNavegacionActivoOscuro,
              ]}
            >
              <Text
                style={[
                  estilos.textoNavegacion,
                  activo && estilos.textoNavegacionActivo,
                  modoAltoContraste && estilos.textoNavegacionOscuro,
                  modoAltoContraste &&
                    activo &&
                    estilos.textoNavegacionActivoOscuro,
                ]}
              >
                {ETIQUETAS_NAVEGACION[pantalla]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contenedorOscuro: {
    backgroundColor: '#030712',
  },
  contenido: {
    flex: 1,
  },
  barraNavegacion: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    paddingHorizontal: 6,
  },
  barraNavegacionOscura: {
    backgroundColor: '#111827',
    borderTopColor: '#374151',
  },
  botonNavegacion: {
    flex: 1,
    minHeight: 50,
    paddingVertical: 10,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  botonNavegacionActivo: {
    backgroundColor: '#f3f4f6',
  },
  botonNavegacionActivoOscuro: {
    backgroundColor: '#1f2937',
  },
  textoNavegacion: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  textoNavegacionOscuro: {
    color: '#9ca3af',
  },
  textoNavegacionActivo: {
    color: '#111827',
    fontWeight: '800',
  },
  textoNavegacionActivoOscuro: {
    color: '#f9fafb',
  },
  avisoCarga: {
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  avisoCargaOscuro: {
    backgroundColor: '#111827',
    borderBottomColor: '#374151',
  },
  textoAvisoCarga: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  textoAvisoCargaOscuro: {
    color: '#d1d5db',
  },
  avisoError: {
    backgroundColor: '#fffbeb',
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textoAvisoError: {
    color: '#92400e',
    fontSize: 13,
    fontWeight: '600',
  },
});