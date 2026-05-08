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
  // Pantalla actualmente activa.
  const [pantallaActual, setPantallaActual] =
    useState<NombrePantalla>('dashboard');

  // Estado en memoria del armario.
  // Empieza con datos mock para que la app funcione incluso si Supabase falla.
  const [prendas, setPrendas] = useState<Prenda[]>(PRENDAS_MOCK);

  // Historial de resultados try-on. Sigue siendo provisional en esta fase.
  const [historial] = useState<ResultadoTryOn[]>(HISTORIAL_MOCK);

  // Indica si el armario está usando datos mock/locales o datos reales de Supabase.
  const [origenPrendas, setOrigenPrendas] = useState<'mock' | 'supabase'>(
    'mock'
  );

  // Indica si la app está intentando cargar prendas desde Supabase.
  const [cargandoPrendas, setCargandoPrendas] = useState<boolean>(true);

  // Error controlado si falla la carga remota.
  const [errorCargaPrendas, setErrorCargaPrendas] = useState<string | null>(
    null
  );

  // Comprobacion estatica de la configuracion de Supabase.
  const estadoSupabase = useMemo(() => obtenerEstadoSupabase(), []);

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
          setOrigenPrendas('mock');
          setErrorCargaPrendas(resultado.error);
          return;
        }

        // Si Supabase responde correctamente, usamos sus datos aunque sean 0.
        // Esto evita confundir datos mock con datos reales.
        setPrendas(resultado.prendas);
        setOrigenPrendas('supabase');
        setErrorCargaPrendas(null);
      } catch (error) {
        if (!componenteActivo) {
          return;
        }

        setOrigenPrendas('mock');
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

  function navegarA(pantalla: NombrePantalla) {
    setPantallaActual(pantalla);
  }

  // Anade una nueva prenda al estado local del armario.
  // En la siguiente fase se conectara tambien con Supabase.
  function anadirPrenda(prenda: Prenda) {
    setPrendas((prev) => [prenda, ...prev]);

    // En esta fase la prenda creada desde la app se guarda solo en memoria local.
    // La escritura real en Supabase se implementara despues.
    setOrigenPrendas('mock');
    setErrorCargaPrendas(null);
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
        return <ArmarioPantalla prendas={prendas} navegarA={navegarA} />;

      case 'altaPrenda':
        return (
          <AltaPrendaPantalla
            onPrendaCreada={anadirPrenda}
            navegarA={navegarA}
          />
        );

      case 'tryOn':
        return <TryOnPantalla navegarA={navegarA} />;

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
        {cargandoPrendas && (
          <View style={estilos.avisoCarga}>
            <Text style={estilos.textoAvisoCarga}>
              Comprobando prendas en Supabase...
            </Text>
          </View>
        )}

        {!cargandoPrendas && origenPrendas === 'supabase' && (
          <View style={estilos.avisoCorrecto}>
            <Text style={estilos.textoAvisoCorrecto}>
              Prendas cargadas desde Supabase.
            </Text>
          </View>
        )}

        {!cargandoPrendas && errorCargaPrendas && (
          <View style={estilos.avisoError}>
            <Text style={estilos.textoAvisoError}>
              Usando datos locales. Supabase: {errorCargaPrendas}
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
    backgroundColor: '#eff6ff',
    borderBottomWidth: 1,
    borderBottomColor: '#bfdbfe',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textoAvisoCarga: {
    color: '#1d4ed8',
    fontSize: 13,
    fontWeight: '600',
  },
  avisoCorrecto: {
    backgroundColor: '#ecfdf5',
    borderBottomWidth: 1,
    borderBottomColor: '#a7f3d0',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textoAvisoCorrecto: {
    color: '#047857',
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