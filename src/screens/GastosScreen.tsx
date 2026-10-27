import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { obtenerGastos, crearGasto, editarGasto, eliminarGasto } from '../services/gastosService';
import { obtenerCategorias } from '../services/categoriasService';
import { Gasto, Categoria } from '../types';
import Boton from '../components/Boton';
import Input from '../components/Input';
import Tarjeta from '../components/Tarjeta';
import ModalFormulario from '../components/ModalFormulario';
import { Cargando, ListaVacia } from '../components/Estados';
import { colores } from '../theme/colores';
import { formatoPesos, fechaHoy, esFechaValida, mensajeError } from '../utils/formato';
import { mostrarAlerta, confirmar } from '../utils/alertas';

export default function GastosScreen({ navigation }: any) {
  const { user } = useAuth();
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filtro, setFiltro] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Datos del formulario
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(fechaHoy());
  const [descripcion, setDescripcion] = useState('');
  const [idCategoria, setIdCategoria] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarDatos();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarDatos = async () => {
    if (!user) return;
    const respuestaGastos = await obtenerGastos(user.id);
    const respuestaCategorias = await obtenerCategorias();

    if (respuestaGastos.error) mostrarAlerta('Error', mensajeError(respuestaGastos.error));
    else setGastos(respuestaGastos.data || []);

    if (!respuestaCategorias.error) setCategorias(respuestaCategorias.data || []);
    setCargando(false);
  };

  const abrirModal = (gasto?: Gasto) => {
    if (gasto) {
      setEditandoId(gasto.id_gasto);
      setMonto(String(gasto.monto));
      setFecha(gasto.fecha);
      setDescripcion(gasto.descripcion || '');
      setIdCategoria(gasto.id_categoria);
    } else {
      setEditandoId(null);
      setMonto('');
      setFecha(fechaHoy());
      setDescripcion('');
      setIdCategoria(null);
    }
    setModalVisible(true);
  };

  const guardarGasto = async () => {
    if (!user) return;
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) return mostrarAlerta('Error', 'Ingresa un monto válido.');
    if (!esFechaValida(fecha)) return mostrarAlerta('Error', 'La fecha debe tener el formato AAAA-MM-DD.');
    if (!idCategoria) return mostrarAlerta('Error', 'Selecciona una categoría.');

    const datos = { monto: Number(monto), fecha, descripcion, id_categoria: idCategoria };

    setGuardando(true);
    const { error } = editandoId ? await editarGasto(editandoId, datos) : await crearGasto(user.id, datos);
    setGuardando(false);

    if (error) return mostrarAlerta('Error', mensajeError(error));
    setModalVisible(false);
    cargarDatos();
  };

  const borrarGasto = (id: number) => {
    confirmar('¿Eliminar este gasto?', async () => {
      const { error } = await eliminarGasto(id);
      if (error) mostrarAlerta('Error', mensajeError(error));
      cargarDatos();
    });
  };

  // Filtra la lista por la categoría seleccionada
  const gastosFiltrados = filtro ? gastos.filter((g) => g.id_categoria === filtro) : gastos;

  if (cargando) return <Cargando />;

  return (
    <View style={styles.container}>
      <Boton titulo="+ Nuevo Gasto" onPress={() => abrirModal()} />

      <View style={styles.filtros}>
        <TouchableOpacity style={[styles.chip, !filtro && styles.chipActivo]} onPress={() => setFiltro(null)}>
          <Text style={[styles.chipTexto, !filtro && { color: '#fff' }]}>Todas</Text>
        </TouchableOpacity>
        {categorias.map((cat) => (
          <TouchableOpacity
            key={cat.id_categoria}
            style={[styles.chip, filtro === cat.id_categoria && styles.chipActivo]}
            onPress={() => setFiltro(cat.id_categoria)}
          >
            <Text style={[styles.chipTexto, filtro === cat.id_categoria && { color: '#fff' }]}>{cat.nombre_categoria}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={gastosFiltrados}
        keyExtractor={(item) => String(item.id_gasto)}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={<ListaVacia mensaje="No tienes gastos registrados." />}
        renderItem={({ item }) => (
          <Tarjeta style={styles.tarjeta}>
            <View style={{ flex: 1 }}>
              <Text style={styles.descripcion}>{item.descripcion || 'Sin descripción'}</Text>
              <Text style={styles.detalle}>
                {item.categorias?.nombre_categoria || 'Sin categoría'} · {item.fecha}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.monto}>-{formatoPesos(item.monto)}</Text>
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <TouchableOpacity onPress={() => abrirModal(item)} style={{ marginRight: 15 }}>
                  <Text style={{ color: colores.primario, fontWeight: 'bold' }}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => borrarGasto(item.id_gasto)}>
                  <Text style={{ color: colores.rojo, fontWeight: 'bold' }}>Borrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Tarjeta>
        )}
      />

      <ModalFormulario
        visible={modalVisible}
        titulo={editandoId ? 'Editar Gasto' : 'Nuevo Gasto'}
        onGuardar={guardarGasto}
        onCerrar={() => setModalVisible(false)}
        guardando={guardando}
      >
        <Input label="Monto" placeholder="Ej: 15000" keyboardType="numeric" value={monto} onChangeText={setMonto} />
        <Input label="Fecha (AAAA-MM-DD)" value={fecha} onChangeText={setFecha} />
        <Text style={styles.label}>Categoría</Text>
        <View style={styles.filtros}>
          {categorias.length === 0 && <Text style={{ color: colores.gris }}>Primero crea una categoría.</Text>}
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat.id_categoria}
              style={[styles.chip, idCategoria === cat.id_categoria && styles.chipActivo]}
              onPress={() => setIdCategoria(cat.id_categoria)}
            >
              <Text style={[styles.chipTexto, idCategoria === cat.id_categoria && { color: '#fff' }]}>{cat.nombre_categoria}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Input label="Descripción" placeholder="Ej: Almuerzo" value={descripcion} onChangeText={setDescripcion} />
      </ModalFormulario>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colores.fondo, padding: 15 },
  filtros: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  chip: { borderWidth: 1, borderColor: colores.primario, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, marginBottom: 8 },
  chipActivo: { backgroundColor: colores.primario },
  chipTexto: { color: colores.primario, fontWeight: 'bold' },
  tarjeta: { flexDirection: 'row', justifyContent: 'space-between' },
  descripcion: { fontSize: 16, fontWeight: 'bold', color: colores.texto },
  detalle: { fontSize: 13, color: colores.gris, marginTop: 5 },
  monto: { fontSize: 18, fontWeight: 'bold', color: colores.rojo },
  label: { fontWeight: 'bold', marginBottom: 8, color: colores.texto },
});
