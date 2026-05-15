import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BotonPrincipal } from '../componentes/BotonPrincipal';
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
  modoAltoContraste: boolean;
  modoPresentacion: boolean;
  onAlternarModoAltoContraste: () => void;
  onAlternarModoPresentacion: () => void;
}

export function DashboardPantalla({
  prendas,
  estadoSupabase,
  navegarA,
  modoAltoContraste,
  modoPresentacion,
  onAlternarModoAltoContraste,
  onAlternarModoPresentacion,
}: PropiedadesDashboard) {
  const [ajustesAbiertos, setAjustesAbiertos] = useState(false);

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

  const temaOscuro = modoAltoContraste;

  return (
    <ScrollView
      contentContainerStyle={[
        estilos.contenedor,
        temaOscuro && estilos.contenedorOscuro,
      ]}
    >
      <View style={estilos.cabeceraConAjustes}>
        <View style={estilos.cabeceraTexto}>
          <Text
            style={[
              estilos.tituloPantalla,
              temaOscuro && estilos.textoPrincipalOscuro,
            ]}
          >
            Armario IA
          </Text>
          <Text
            style={[
              estilos.subtituloPantalla,
              temaOscuro && estilos.textoSecundarioOscuro,
            ]}
          >
            Gestión de prendas y preparación de simulaciones try-on
          </Text>
        </View>

        <Pressable
          onPress={() => setAjustesAbiertos((valor) => !valor)}
          style={[
            estilos.botonAjustes,
            temaOscuro && estilos.botonAjustesOscuro,
          ]}
        >
          <Text
            style={[
              estilos.textoBotonAjustes,
              temaOscuro && estilos.textoBotonAjustesOscuro,
            ]}
          >
            Ajustes
          </Text>
        </Pressable>
      </View>

      {ajustesAbiertos && (
        <Panel temaOscuro={temaOscuro}>
          <Text
            style={[
              estilos.tituloTarjeta,
              temaOscuro && estilos.textoPrincipalOscuro,
            ]}
          >
            Ajustes rápidos
          </Text>

          <Text
            style={[
              estilos.descripcion,
              temaOscuro && estilos.textoSecundarioOscuro,
            ]}
          >
            Panel preparado para opciones de visualización, presentación y
            futuras funciones de configuración.
          </Text>

          <View style={estilos.listaAjustes}>
            <FilaAjuste
              titulo="Modo alto contraste"
              descripcion="Oscurece Inicio, la base de la app y la barra inferior."
              activo={modoAltoContraste}
              onPress={onAlternarModoAltoContraste}
              temaOscuro={temaOscuro}
            />

            <FilaAjuste
              titulo="Modo presentación"
              descripcion="Activa un aviso de respaldo para usar la demo local sin red."
              activo={modoPresentacion}
              onPress={onAlternarModoPresentacion}
              temaOscuro={temaOscuro}
            />

            <View
              style={[
                estilos.ajusteFuturo,
                temaOscuro && estilos.ajusteFuturoOscuro,
              ]}
            >
              <Text
                style={[
                  estilos.tituloAjuste,
                  temaOscuro && estilos.textoPrincipalOscuro,
                ]}
              >
                Próximas opciones
              </Text>
              <Text
                style={[
                  estilos.descripcionAjuste,
                  temaOscuro && estilos.textoSecundarioOscuro,
                ]}
              >
                Modo oscuro global completo, tamaño de texto, reinicio de datos
                demo y configuración avanzada del proveedor IA.
              </Text>
            </View>
          </View>
        </Panel>
      )}

      <Panel temaOscuro={temaOscuro}>
        <Text
          style={[
            estilos.tituloTarjeta,
            temaOscuro && estilos.textoPrincipalOscuro,
          ]}
        >
          Resumen general
        </Text>

        <View style={estilos.resumenPrincipal}>
          <View
            style={[
              estilos.bloqueResumen,
              temaOscuro && estilos.bloqueResumenOscuro,
            ]}
          >
            <Text
              style={[
                estilos.numeroResumen,
                temaOscuro && estilos.textoPrincipalOscuro,
              ]}
            >
              {totalPrendas}
            </Text>
            <Text
              style={[
                estilos.textoResumen,
                temaOscuro && estilos.textoSecundarioOscuro,
              ]}
            >
              {totalPrendas === 1 ? 'prenda activa' : 'prendas activas'}
            </Text>
          </View>

          <View
            style={[
              estilos.bloqueResumenSecundario,
              temaOscuro && estilos.bloqueResumenOscuro,
            ]}
          >
            <Text
              style={[
                estilos.numeroResumenSecundario,
                temaOscuro && estilos.textoPrincipalOscuro,
              ]}
            >
              {categoriasConPrendas.length}
            </Text>
            <Text
              style={[
                estilos.textoResumenSecundario,
                temaOscuro && estilos.textoSecundarioOscuro,
              ]}
            >
              categorías con contenido
            </Text>
          </View>
        </View>

        <Text
          style={[
            estilos.descripcion,
            temaOscuro && estilos.textoSecundarioOscuro,
          ]}
        >
          Desde este panel puedes revisar el armario, añadir prendas, preparar
          simulaciones try-on y consultar el historial.
        </Text>

        {modoPresentacion && (
          <View
            style={[
              estilos.avisoPresentacion,
              temaOscuro && estilos.avisoPresentacionOscuro,
            ]}
          >
            <Text
              style={[
                estilos.textoAvisoPresentacion,
                temaOscuro && estilos.textoAvisoPresentacionOscuro,
              ]}
            >
              Modo presentación activo: usa la demo local sin red como respaldo
              si falla la conexión o el proveedor IA.
            </Text>
          </View>
        )}
      </Panel>

      <Panel temaOscuro={temaOscuro}>
        <Text
          style={[
            estilos.tituloTarjeta,
            temaOscuro && estilos.textoPrincipalOscuro,
          ]}
        >
          Distribución del armario
        </Text>

        {totalPrendas === 0 ? (
          <View style={estilos.estadoVacio}>
            <Text
              style={[
                estilos.textoVacio,
                temaOscuro && estilos.textoSecundarioOscuro,
              ]}
            >
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
              <View
                key={c.categoria}
                style={[
                  estilos.filaCategoria,
                  temaOscuro && estilos.filaCategoriaOscura,
                ]}
              >
                <Text
                  style={[
                    estilos.textoCategoria,
                    temaOscuro && estilos.textoSecundarioOscuro,
                  ]}
                >
                  {ETIQUETAS_CATEGORIA[c.categoria]}
                </Text>
                <View
                  style={[
                    estilos.contadorCategoria,
                    temaOscuro && estilos.contadorCategoriaOscuro,
                  ]}
                >
                  <Text
                    style={[
                      estilos.totalCategoria,
                      temaOscuro && estilos.textoPrincipalOscuro,
                    ]}
                  >
                    {c.total}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Panel>

      <Panel temaOscuro={temaOscuro}>
        <Text
          style={[
            estilos.tituloTarjeta,
            temaOscuro && estilos.textoPrincipalOscuro,
          ]}
        >
          Estado técnico
        </Text>

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

        <Text
          style={[estilos.detalle, temaOscuro && estilos.textoSecundarioOscuro]}
        >
          {estadoSupabase.configurado
            ? 'La app puede leer y guardar información en Supabase.'
            : estadoSupabase.detalle}
        </Text>
      </Panel>

      <Panel temaOscuro={temaOscuro}>
        <Text
          style={[
            estilos.tituloTarjeta,
            temaOscuro && estilos.textoPrincipalOscuro,
          ]}
        >
          Accesos rápidos
        </Text>

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
      </Panel>
    </ScrollView>
  );
}

interface PropiedadesPanel {
  children: React.ReactNode;
  temaOscuro: boolean;
}

function Panel({ children, temaOscuro }: PropiedadesPanel) {
  return (
    <View style={[estilos.panel, temaOscuro && estilos.panelOscuro]}>
      {children}
    </View>
  );
}

interface PropiedadesFilaAjuste {
  titulo: string;
  descripcion: string;
  activo: boolean;
  onPress: () => void;
  temaOscuro: boolean;
}

function FilaAjuste({
  titulo,
  descripcion,
  activo,
  onPress,
  temaOscuro,
}: PropiedadesFilaAjuste) {
  return (
    <Pressable
      onPress={onPress}
      style={[estilos.filaAjuste, temaOscuro && estilos.filaAjusteOscura]}
    >
      <View style={estilos.textoAjusteBloque}>
        <Text
          style={[
            estilos.tituloAjuste,
            temaOscuro && estilos.textoPrincipalOscuro,
          ]}
        >
          {titulo}
        </Text>
        <Text
          style={[
            estilos.descripcionAjuste,
            temaOscuro && estilos.textoSecundarioOscuro,
          ]}
        >
          {descripcion}
        </Text>
      </View>

      <View
        style={[
          estilos.switchVisual,
          activo && estilos.switchVisualActivo,
          temaOscuro && estilos.switchVisualOscuro,
        ]}
      >
        <View
          style={[estilos.switchPunto, activo && estilos.switchPuntoActivo]}
        />
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    padding: 16,
    paddingBottom: 32,
  },
  contenedorOscuro: {
    backgroundColor: '#030712',
  },
  cabeceraConAjustes: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cabeceraTexto: {
    flex: 1,
  },
  tituloPantalla: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtituloPantalla: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  botonAjustes: {
    marginTop: 2,
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  botonAjustesOscuro: {
    backgroundColor: '#111827',
    borderColor: '#374151',
  },
  textoBotonAjustes: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  textoBotonAjustesOscuro: {
    color: '#f9fafb',
  },
  panel: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  panelOscuro: {
    backgroundColor: '#111827',
    borderColor: '#374151',
  },
  tituloTarjeta: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  textoPrincipalOscuro: {
    color: '#f9fafb',
  },
  textoSecundarioOscuro: {
    color: '#d1d5db',
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
  bloqueResumenOscuro: {
    backgroundColor: '#030712',
    borderColor: '#374151',
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
  avisoPresentacion: {
    marginTop: 12,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 10,
    padding: 10,
  },
  avisoPresentacionOscuro: {
    backgroundColor: '#451a03',
    borderColor: '#92400e',
  },
  textoAvisoPresentacion: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
    fontWeight: '600',
  },
  textoAvisoPresentacionOscuro: {
    color: '#fde68a',
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
  filaCategoriaOscura: {
    borderBottomColor: '#1f2937',
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
  contadorCategoriaOscuro: {
    backgroundColor: '#030712',
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
  listaAjustes: {
    marginTop: 12,
  },
  filaAjuste: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  filaAjusteOscura: {
    backgroundColor: '#030712',
    borderColor: '#374151',
  },
  textoAjusteBloque: {
    flex: 1,
    marginRight: 10,
  },
  tituloAjuste: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 3,
  },
  descripcionAjuste: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 17,
  },
  switchVisual: {
    width: 46,
    height: 26,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    padding: 3,
    justifyContent: 'center',
  },
  switchVisualActivo: {
    backgroundColor: '#111827',
  },
  switchVisualOscuro: {
    backgroundColor: '#374151',
  },
  switchPunto: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  switchPuntoActivo: {
    alignSelf: 'flex-end',
  },
  ajusteFuturo: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
  },
  ajusteFuturoOscuro: {
    backgroundColor: '#030712',
    borderColor: '#374151',
  },
  separador: {
    height: 10,
  },
});