import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { obtenerIngresos, crearIngreso, editarIngreso, eliminarIngreso } from '../services/ingresosService';
import { Ingreso } from '../types';
import Boton from '../components/Boton';
import Input from '../components/Input';
import Tarjeta from '../components/Tarjeta';
import ModalFormulario from '../components/ModalFormulario';
import { Cargando, ListaVacia } from '../components/Estados';
import { colores } from '../theme/colores';
import { formatoPesos, mensajeError } from '../utils/formato';
import { mostrarAlerta, confirmar } from '../utils/alertas';

export default function IngresosScreen({ navigation }: any) {
  const { user } = useAuth();
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [monto, setMonto] = useState('');
  const [periodo, setPeriodo] = useState('');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarIngresos();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarIngresos = async () => {
    if (!user) return;
    const { data, error } = await obtenerIngresos(user.id);
    if (error) mostrarAlerta('Error', mensajeError(error));
    else setIngresos(data || []);
    setCargando(false);
  };

  const abrirModal = (ingreso?: Ingreso) => {
    setEditandoId(ingreso ? ingreso.id_ingreso : null);
    setMonto(ingreso ? String(ingreso.monto) : '');
    setPeriodo(ingreso ? ingreso.periodo : '');
    setModalVisible(true);
  };

  const guardarIngreso = async () => {
    if (!user) return;
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) return mostrarAlerta('Error', 'Ingresa un monto válido.');
    if (!periodo) return mostrarAlerta('Error', 'Escribe el periodo. Ej: Octubre 2026');

    const datos = { monto: Number(monto), periodo };

    setGuardando(true);
    const { error } = editandoId ? await editarIngreso(editandoId, datos) : await crearIngreso(user.id, datos);
    setGuardando(false);

    if (error) return mostrarAlerta('Error', mensajeError(error));
    setModalVisible(false);
    cargarIngresos();
  };

  const borrarIngreso = (id: number) => {
    confirmar('¿Eliminar este ingreso?', async () => {
      const { error } = await eliminarIngreso(id);
      if (error) mostrarAlerta('Error', mensajeError(error));
      cargarIngresos();
    });
  };

  if (cargando) return <Cargando />;

  return (
    <View style={styles.container}>
      <Boton titulo="+ Nuevo Ingreso" onPress={() => abrirModal()} />

      <FlatList
        data={ingresos}
        keyExtractor={(item) => String(item.id_ingreso)}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={<ListaVacia mensaje="No tienes ingresos registrados." />}
        renderItem={({ item }) => (
          <Tarjeta style={styles.tarjeta}>
            <View>
              <Text style={styles.periodo}>{item.periodo}</Text>
              <Text style={styles.monto}>+{formatoPesos(item.monto)}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => abrirModal(item)} style={{ marginRight: 15 }}>
                <Text style={{ color: colores.primario, fontWeight: 'bold' }}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => borrarIngreso(item.id_ingreso)}>
                <Text style={{ color: colores.rojo, fontWeight: 'bold' }}>Borrar</Text>
              </TouchableOpacity>
            </View>
          </Tarjeta>
        )}
      />

      <ModalFormulario
        visible={modalVisible}
        titulo={editandoId ? 'Editar Ingreso' : 'Nuevo Ingreso'}
        onGuardar={guardarIngreso}
        onCerrar={() => setModalVisible(false)}
        guardando={guardando}
      >
        <Input label="Monto" placeholder="Ej: 1500000" keyboardType="numeric" value={monto} onChangeText={setMonto} />
        <Input label="Periodo" placeholder="Ej: Octubre 2026" value={periodo} onChangeText={setPeriodo} />
      </ModalFormulario>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colores.fondo, padding: 15 },
  tarjeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  periodo: { fontSize: 16, fontWeight: 'bold', color: colores.texto },
  monto: { fontSize: 18, fontWeight: 'bold', color: colores.primario, marginTop: 5 },
});
