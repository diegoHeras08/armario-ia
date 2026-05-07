import React, { useMemo, useState } from 'react';
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

  // Estado en memoria del armario (datos mock como punto de partida).
  const [prendas, setPrendas] = useState<Prenda[]>(PRENDAS_MOCK);

  // Historial de resultados try-on (vacio en la primera fase).
  const [historial] = useState<ResultadoTryOn[]>(HISTORIAL_MOCK);

  // Comprobacion estatica de la configuracion de Supabase.
  const estadoSupabase = useMemo(() => obtenerEstadoSupabase(), []);

  // Anade una nueva prenda al estado local del armario.
  const anadirPrenda = (prenda: Prenda) => {
    setPrendas((prev) => [prenda, ...prev]);
  };

  const renderizarPantalla = () => {
    switch (pantallaActual) {
      case 'dashboard':
        return (
          <DashboardPantalla
            prendas={prendas}
            estadoSupabase={estadoSupabase}
            navegarA={setPantallaActual}
          />
        );
      case 'armario':
        return (
          <ArmarioPantalla prendas={prendas} navegarA={setPantallaActual} />
        );
      case 'altaPrenda':
        return (
          <AltaPrendaPantalla
            onPrendaCreada={anadirPrenda}
            navegarA={setPantallaActual}
          />
        );
      case 'tryOn':
        return <TryOnPantalla navegarA={setPantallaActual} />;
      case 'historial':
        return (
          <HistorialPantalla
            resultados={historial}
            navegarA={setPantallaActual}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={estilos.contenedor}>
      <StatusBar barStyle="dark-content" />
      <View style={estilos.contenido}>{renderizarPantalla()}</View>
      <View style={estilos.barraNavegacion}>
        {PANTALLAS_NAVEGABLES.map((pantalla) => {
          const activo = pantallaActual === pantalla;
          return (
            <Pressable
              key={pantalla}
              onPress={() => setPantallaActual(pantalla)}
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
});