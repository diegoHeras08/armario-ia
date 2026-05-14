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
  const totalPrendas = prendas.length;

  const conteoPorCategoria = CATEGORIAS_PRENDA.map((cat) => ({
    categoria: cat,
    total: prendas.filter((p) => p.categoria === cat).length,
  }));

  const categoriasConPrendas = conteoPorCategoria.filter((c) => c.total > 0);
  const categoriasVisibles =
    categoriasConPrendas.length > 0 ? categoriasConPrendas : conteoPorCategoria;

  const textoEstadoSupabase = estadoSupabase.configurado
    ? 'Conectado'
    : 'Pendiente de configuración';

  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <EncabezadoPantalla
        titulo="Armario IA"
        subtitulo="Gestión de prendas y preparación de simulaciones try-on"
      />

      <Tarjeta>
        <Text style={estilos.tituloTarjeta}>Resumen general</Text>

        <View style={estilos.resumenPrincipal}>
          <View style={estilos.bloqueResumen}>
            <Text style={estilos.numeroResumen}>{totalPrendas}</Text>
            <Text style={estilos.textoResumen}>
              {totalPrendas === 1 ? 'prenda activa' : 'prendas activas'}
            </Text>
          </View>

          <View style={estilos.bloqueResumenSecundario}>
            <Text style={estilos.numeroResumenSecundario}>
              {categoriasConPrendas.length}
            </Text>
            <Text style={estilos.textoResumenSecundario}>
              categorías con contenido
            </Text>
          </View>
        </View>

        <Text style={estilos.descripcion}>
          Desde este panel puedes revisar el armario, añadir prendas, preparar
          simulaciones try-on y consultar el historial.
        </Text>
      </Tarjeta>

      <Tarjeta>
        <Text style={estilos.tituloTarjeta}>Distribución del armario</Text>

        {totalPrendas === 0 ? (
          <View style={estilos.estadoVacio}>
            <Text style={estilos.textoVacio}>
              Todavía no hay prendas registradas. Añade la primera prenda para
              empezar a construir el armario.
            </Text>
            <View style={estilos.separador} />
            <BotonPrincipal
              texto="Añadir primera prenda"
              onPress={() => navegarA('altaPrenda')}
            />
          </View>
        ) : (
          <View style={estilos.listaCategorias}>
            {categoriasVisibles.map((c) => (
              <View key={c.categoria} style={estilos.filaCategoria}>
                <Text style={estilos.textoCategoria}>
                  {ETIQUETAS_CATEGORIA[c.categoria]}
                </Text>
                <View style={estilos.contadorCategoria}>
                  <Text style={estilos.totalCategoria}>{c.total}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Tarjeta>

      <Tarjeta>
        <Text style={estilos.tituloTarjeta}>Estado técnico</Text>

        <View
          style={[
            estilos.estadoSupabase,
            estadoSupabase.configurado
              ? estilos.estadoSupabaseOk
              : estilos.estadoSupabasePendiente,
          ]}
        >
          <Text
            style={[
              estilos.estadoTexto,
              estadoSupabase.configurado
                ? estilos.estadoTextoOk
                : estilos.estadoTextoPendiente,
            ]}
          >
            Supabase: {textoEstadoSupabase}
          </Text>
        </View>

        <Text style={estilos.detalle}>
          {estadoSupabase.configurado
            ? 'La app puede leer y guardar información en Supabase.'
            : estadoSupabase.detalle}
        </Text>
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
            texto="Preparar try-on"
            onPress={() => navegarA('tryOn')}
            variante="secundario"
          />

          <View style={estilos.separador} />

          <BotonPrincipal
            texto="Ver historial"
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
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  resumenPrincipal: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  bloqueResumen: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bloqueResumenSecundario: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  numeroResumen: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
  },
  textoResumen: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 2,
    fontWeight: '600',
  },
  numeroResumenSecundario: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
  },
  textoResumenSecundario: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 2,
    fontWeight: '600',
  },
  descripcion: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  listaCategorias: {
    marginTop: 2,
  },
  filaCategoria: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  textoCategoria: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  contadorCategoria: {
    minWidth: 30,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  totalCategoria: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  estadoVacio: {
    marginTop: 4,
  },
  textoVacio: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  estadoSupabase: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 8,
  },
  estadoSupabaseOk: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  estadoSupabasePendiente: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  estadoTexto: {
    fontSize: 13,
    fontWeight: '700',
  },
  estadoTextoOk: {
    color: '#047857',
  },
  estadoTextoPendiente: {
    color: '#92400e',
  },
  detalle: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  botonera: {
    marginTop: 2,
  },
  separador: {
    height: 10,
  },
});