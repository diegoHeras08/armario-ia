import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BotonPrincipal } from '../componentes/BotonPrincipal';
import { EncabezadoPantalla } from '../componentes/EncabezadoPantalla';
import { TarjetaPrenda } from '../componentes/TarjetaPrenda';
import {
  CATEGORIAS_PRENDA,
  CategoriaPrenda,
  ETIQUETAS_CATEGORIA,
  Prenda,
} from '../tipos/prenda';
import { NombrePantalla } from '../tipos/navegacion';

interface PropiedadesArmario {
  prendas: Prenda[];
  navegarA: (pantalla: NombrePantalla) => void;
}

type FiltroCategoria = CategoriaPrenda | 'todas';

export function ArmarioPantalla({ prendas, navegarA }: PropiedadesArmario) {
  const [filtro, setFiltro] = useState<FiltroCategoria>('todas');

  const prendasFiltradas = useMemo(() => {
    if (filtro === 'todas') return prendas;
    return prendas.filter((p) => p.categoria === filtro);
  }, [prendas, filtro]);

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
          <Text style={estilos.tituloVacio}>
            Sin prendas en esta categoría
          </Text>
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
          <TarjetaPrenda key={prenda.id} prenda={prenda} />
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
  separador: {
    height: 12,
  },
});