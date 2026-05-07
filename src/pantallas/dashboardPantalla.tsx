import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BotonPrincipal } from '../componentes/BotonPrincipal';
import { EncabezadoPantalla } from '../componentes/EncabezadoPantalla';
import { Tarjeta } from '../componentes/Tarjeta';
import {
  CATEGORIAS_PRENDA,
  ETIQUETAS_CATEGORIA,
  Prenda,
} from '../tipos/prenda';
import { NombrePantalla } from '../tipos/navegacion';
import { EstadoSupabase } from '../servicios/supabaseEstadoServicio';

interface PropiedadesDashboard {
  prendas: Prenda[];
  estadoSupabase: EstadoSupabase;
  navegarA: (pantalla: NombrePantalla) => void;
}

export function DashboardPantalla({
  prendas,
  estadoSupabase,
  navegarA,
}: PropiedadesDashboard) {
  // Conteo de prendas por categoria para el resumen visual.
  const conteoPorCategoria = CATEGORIAS_PRENDA.map((cat) => ({
    categoria: cat,
    total: prendas.filter((p) => p.categoria === cat).length,
  }));

  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <EncabezadoPantalla
        titulo="Armario IA"
        subtitulo="Panel principal del proyecto"
      />

      <Tarjeta>
        <Text style={estilos.tituloTarjeta}>Resumen del armario</Text>
        <Text style={estilos.totalPrendas}>{prendas.length} prendas</Text>
        <View style={estilos.listaCategorias}>
          {conteoPorCategoria.map((c) => (
            <View key={c.categoria} style={estilos.filaCategoria}>
              <Text style={estilos.textoCategoria}>
                {ETIQUETAS_CATEGORIA[c.categoria]}
              </Text>
              <Text style={estilos.totalCategoria}>{c.total}</Text>
            </View>
          ))}
        </View>
      </Tarjeta>

      <Tarjeta>
        <Text style={estilos.tituloTarjeta}>Estado de Supabase</Text>
        <Text
          style={[
            estilos.estadoTexto,
            estadoSupabase.configurado
              ? estilos.estadoOk
              : estilos.estadoPendiente,
          ]}
        >
          {estadoSupabase.configurado ? 'Configurado' : 'No configurado'}
        </Text>
        <Text style={estilos.detalle}>{estadoSupabase.detalle}</Text>
      </Tarjeta>

      <Tarjeta>
        <Text style={estilos.tituloTarjeta}>Accesos rápidos</Text>
        <View style={estilos.botonera}>
          <BotonPrincipal
            texto="Ver armario"
            onPress={() => navegarA('armario')}
          />
          <View style={estilos.separador} />
          <BotonPrincipal
            texto="Añadir prenda"
            onPress={() => navegarA('altaPrenda')}
            variante="secundario"
          />
          <View style={estilos.separador} />
          <BotonPrincipal
            texto="Try-on"
            onPress={() => navegarA('tryOn')}
            variante="secundario"
          />
          <View style={estilos.separador} />
          <BotonPrincipal
            texto="Historial"
            onPress={() => navegarA('historial')}
            variante="secundario"
          />
        </View>
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
    marginBottom: 8,
  },
  totalPrendas: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  listaCategorias: {
    marginTop: 4,
  },
  filaCategoria: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  textoCategoria: {
    fontSize: 14,
    color: '#374151',
  },
  totalCategoria: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  estadoTexto: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  estadoOk: {
    color: '#047857',
  },
  estadoPendiente: {
    color: '#b45309',
  },
  detalle: {
    fontSize: 13,
    color: '#6b7280',
  },
  botonera: {
    marginTop: 4,
  },
  separador: {
    height: 8,
  },
});