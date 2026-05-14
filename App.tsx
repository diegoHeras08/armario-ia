import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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

// Etiquetas legibles para la barra inferior de navegacion local.
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
  const [pantallaActual, setPantallaActual] =
    useState<NombrePantalla>('dashboard');

  // Empieza con datos mock para que la app no quede vacia si Supabase falla.
  const [prendas, setPrendas] = useState<Prenda[]>(PRENDAS_MOCK);

  // Empieza con historial mock como respaldo temporal.
  const [historial, setHistorial] =
    useState<ResultadoTryOn[]>(HISTORIAL_MOCK);

  const [cargandoPrendas, setCargandoPrendas] = useState<boolean>(true);
  const [cargandoHistorial, setCargandoHistorial] = useState<boolean>(true);

  const [errorCargaPrendas, setErrorCargaPrendas] = useState<string | null>(
    null
  );

  const [errorCargaHistorial, setErrorCargaHistorial] = useState<string | null>(
    null
  );

  const estadoSupabase = useMemo(() => obtenerEstadoSupabase(), []);

  const cargandoDatosIniciales = cargandoPrendas || cargandoHistorial;

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

  function renderizarPantalla() {
    switch (pantallaActual) {
      case 'dashboard':
        return (
          <DashboardPantalla
            prendas={prendas}
            estadoSupabase={estadoSupabase}
            navegarA={navegarA}
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
    <SafeAreaView style={estilos.contenedor}>
      <StatusBar barStyle="dark-content" />

      <View style={estilos.contenido}>
        {cargandoDatosIniciales && (
          <View style={estilos.avisoCarga}>
            <Text style={estilos.textoAvisoCarga}>
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

      <View style={estilos.barraNavegacion}>
        {PANTALLAS_NAVEGABLES.map((pantalla) => {
          const activo = pantallaActual === pantalla;

          return (
            <Pressable
              key={pantalla}
              onPress={() => navegarA(pantalla)}
              style={estilos.botonNavegacion}
            >
              <Text
                style={[
                  estilos.textoNavegacion,
                  activo && estilos.textoNavegacionActivo,
                ]}
              >
                {ETIQUETAS_NAVEGACION[pantalla]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contenido: {
    flex: 1,
  },
  barraNavegacion: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 8,
  },
  botonNavegacion: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoNavegacion: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  textoNavegacionActivo: {
    color: '#111827',
    fontWeight: '700',
  },
  avisoCarga: {
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textoAvisoCarga: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
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