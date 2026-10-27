import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { obtenerCategorias, crearCategoria, editarCategoria, eliminarCategoria } from '../services/categoriasService';
import { Categoria } from '../types';
import Boton from '../components/Boton';
import Input from '../components/Input';
import Tarjeta from '../components/Tarjeta';
import ModalFormulario from '../components/ModalFormulario';
import { Cargando, ListaVacia } from '../components/Estados';
import { colores } from '../theme/colores';
import { mensajeError } from '../utils/formato';
import { mostrarAlerta, confirmar } from '../utils/alertas';

export default function CategoriasScreen({ navigation }: any) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarCategorias();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarCategorias = async () => {
    const { data, error } = await obtenerCategorias();
    if (error) mostrarAlerta('Error', mensajeError(error));
    else setCategorias(data || []);
    setCargando(false);
  };

  const abrirModal = (cat?: Categoria) => {
    setEditandoId(cat ? cat.id_categoria : null);
    setNombre(cat ? cat.nombre_categoria : '');
    setModalVisible(true);
  };

  const guardarCategoria = async () => {
    if (!nombre) return mostrarAlerta('Error', 'El nombre es obligatorio.');

    setGuardando(true);
    const { error } = editandoId ? await editarCategoria(editandoId, nombre) : await crearCategoria(nombre);
    setGuardando(false);

    if (error) return mostrarAlerta('Error', mensajeError(error));
    setModalVisible(false);
    cargarCategorias();
  };

  const borrarCategoria = (id: number) => {
    confirmar('¿Eliminar esta categoría?', async () => {
      const { error } = await eliminarCategoria(id);
      if (error) mostrarAlerta('Error', mensajeError(error));
      cargarCategorias();
    });
  };

  if (cargando) return <Cargando />;

  return (
    <View style={styles.container}>
      <Boton titulo="+ Nueva Categoría" onPress={() => abrirModal()} />

      <FlatList
        data={categorias}
        keyExtractor={(item) => String(item.id_categoria)}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={<ListaVacia mensaje="No hay categorías. Crea una, por ejemplo: Comida." />}
        renderItem={({ item }) => (
          <Tarjeta style={styles.tarjeta}>
            <Text style={styles.nombre}>{item.nombre_categoria}</Text>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => abrirModal(item)} style={{ marginRight: 15 }}>
                <Text style={{ color: colores.primario, fontWeight: 'bold' }}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => borrarCategoria(item.id_categoria)}>
                <Text style={{ color: colores.rojo, fontWeight: 'bold' }}>Borrar</Text>
              </TouchableOpacity>
            </View>
          </Tarjeta>
        )}
      />

      <ModalFormulario
        visible={modalVisible}
        titulo={editandoId ? 'Editar Categoría' : 'Nueva Categoría'}
        onGuardar={guardarCategoria}
        onCerrar={() => setModalVisible(false)}
        guardando={guardando}
      >
        <Input label="Nombre" placeholder="Ej: Comida" value={nombre} onChangeText={setNombre} />
      </ModalFormulario>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colores.fondo, padding: 15 },
  tarjeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nombre: { fontSize: 16, fontWeight: 'bold', color: colores.texto },
});
