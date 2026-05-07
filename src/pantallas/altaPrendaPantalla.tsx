import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BotonPrincipal } from '../componentes/BotonPrincipal';
import { EncabezadoPantalla } from '../componentes/EncabezadoPantalla';
import {
  CATEGORIAS_PRENDA,
  CategoriaPrenda,
  ETIQUETAS_CATEGORIA,
  NuevaPrendaEntrada,
  Prenda,
} from '../tipos/prenda';
import {
  construirPrenda,
  validarNuevaPrenda,
} from '../servicios/prendaServicio';
import { NombrePantalla } from '../tipos/navegacion';

interface PropiedadesAltaPrenda {
  onPrendaCreada: (prenda: Prenda) => void;
  navegarA: (pantalla: NombrePantalla) => void;
}

export function AltaPrendaPantalla({
  onPrendaCreada,
  navegarA,
}: PropiedadesAltaPrenda) {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState<CategoriaPrenda>('superior');
  const [color, setColor] = useState('');
  const [notas, setNotas] = useState('');
  const [error, setError] = useState<string | null>(null);

  const guardar = () => {
    const entrada: NuevaPrendaEntrada = { nombre, categoria, color, notas };
    const mensajeError = validarNuevaPrenda(entrada);
    if (mensajeError) {
      setError(mensajeError);
      return;
    }
    const prenda = construirPrenda(entrada);
    onPrendaCreada(prenda);
    Alert.alert('Prenda añadida', `"${prenda.nombre}" se ha guardado.`);
    setNombre('');
    setColor('');
    setNotas('');
    setCategoria('superior');
    setError(null);
    navegarA('armario');
  };

  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <EncabezadoPantalla
        titulo="Añadir prenda"
        subtitulo="Registra una nueva prenda en el armario"
      />

      <View style={estilos.tarjeta}>
        <Text style={estilos.etiqueta}>Nombre</Text>
        <TextInput
          style={estilos.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej. Camiseta blanca básica"
          placeholderTextColor="#9ca3af"
        />

        <Text style={estilos.etiqueta}>Categoría</Text>
        <View style={estilos.gridCategorias}>
          {CATEGORIAS_PRENDA.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setCategoria(cat)}
              style={[
                estilos.opcionCategoria,
                categoria === cat && estilos.opcionCategoriaActiva,
              ]}
            >
              <Text
                style={[
                  estilos.textoOpcion,
                  categoria === cat && estilos.textoOpcionActivo,
                ]}
              >
                {ETIQUETAS_CATEGORIA[cat]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={estilos.etiqueta}>Color</Text>
        <TextInput
          style={estilos.input}
          value={color}
          onChangeText={setColor}
          placeholder="Ej. Azul oscuro"
          placeholderTextColor="#9ca3af"
        />

        <Text style={estilos.etiqueta}>Notas</Text>
        <TextInput
          style={[estilos.input, estilos.inputMultilinea]}
          value={notas}
          onChangeText={setNotas}
          placeholder="Detalles opcionales sobre la prenda"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
        />

        {error && <Text style={estilos.error}>{error}</Text>}

        <View style={estilos.separador} />
        <BotonPrincipal texto="Guardar prenda" onPress={guardar} />
        <View style={estilos.separador} />
        <BotonPrincipal
          texto="Cancelar"
          variante="secundario"
          onPress={() => navegarA('dashboard')}
        />
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    padding: 16,
    paddingBottom: 32,
  },
  tarjeta: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  etiqueta: {
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
    height: 10,
  },
});