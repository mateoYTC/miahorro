import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { obtenerMetas, crearMeta, editarMeta, abonarMeta, eliminarMeta } from '../services/metasService';
import { crearGasto } from '../services/gastosService';
import { obtenerCategoriaAhorro } from '../services/categoriasService';
import { Meta } from '../types';
import Boton from '../components/Boton';
import Input from '../components/Input';
import Tarjeta from '../components/Tarjeta';
import ModalFormulario from '../components/ModalFormulario';
import { Cargando, ListaVacia } from '../components/Estados';
import { colores } from '../theme/colores';
import { formatoPesos, fechaHoy, esFechaValida, mensajeError } from '../utils/formato';
import { mostrarAlerta, confirmar } from '../utils/alertas';

export default function MetasScreen({ navigation }: any) {
  const { user } = useAuth();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Formulario de crear / editar
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreMeta, setNombreMeta] = useState('');
  const [montoObjetivo, setMontoObjetivo] = useState('');
  const [montoActual, setMontoActual] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Formulario para abonar
  const [metaAbono, setMetaAbono] = useState<Meta | null>(null);
  const [abono, setAbono] = useState('');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarMetas();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarMetas = async () => {
    if (!user) return;
    const { data, error } = await obtenerMetas(user.id);
    if (error) mostrarAlerta('Error', mensajeError(error));
    else setMetas(data || []);
    setCargando(false);
  };

  const abrirModal = (meta?: Meta) => {
    setEditandoId(meta ? meta.id_meta_ahorro : null);
    setNombreMeta(meta ? meta.nombre_meta : '');
    setMontoObjetivo(meta ? String(meta.monto_objetivo) : '');
    setMontoActual(meta ? String(meta.monto_actual || 0) : '0');
    setFechaInicio(meta?.fecha_inicio || fechaHoy());
    setFechaFin(meta?.fecha_fin || '');
    setModalVisible(true);
  };

  const guardarMeta = async () => {
    if (!user) return;
    if (!nombreMeta) return mostrarAlerta('Error', 'Escribe el nombre de la meta.');
    if (!montoObjetivo || isNaN(Number(montoObjetivo)) || Number(montoObjetivo) <= 0) {
      return mostrarAlerta('Error', 'Ingresa un monto objetivo válido.');
    }
    if (isNaN(Number(montoActual))) return mostrarAlerta('Error', 'El monto ahorrado no es válido.');
    if (fechaInicio && !esFechaValida(fechaInicio)) return mostrarAlerta('Error', 'La fecha de inicio debe ser AAAA-MM-DD.');
    if (fechaFin && !esFechaValida(fechaFin)) return mostrarAlerta('Error', 'La fecha fin debe ser AAAA-MM-DD.');

    const datos = {
      nombre_meta: nombreMeta,
      monto_objetivo: Number(montoObjetivo),
      monto_actual: Number(montoActual || 0),
      fecha_inicio: fechaInicio || null,
      fecha_fin: fechaFin || null,
    };

    setGuardando(true);
    const { error } = editandoId ? await editarMeta(editandoId, datos) : await crearMeta(user.id, datos);
    setGuardando(false);

    if (error) return mostrarAlerta('Error', mensajeError(error));
    setModalVisible(false);
    cargarMetas();
  };

  const guardarAbono = async () => {
    if (!metaAbono) return;
    if (!abono || isNaN(Number(abono)) || Number(abono) <= 0) return mostrarAlerta('Error', 'Ingresa un monto válido.');

    const nuevoMonto = Number(metaAbono.monto_actual || 0) + Number(abono);
    setGuardando(true);
    const { error } = await abonarMeta(metaAbono.id_meta_ahorro, nuevoMonto);
    setGuardando(false);

    if (error) return mostrarAlerta('Error', mensajeError(error));

    // El abono también cuenta como un gasto (categoría "Ahorro") para que baje el saldo del Inicio
    if (user) {
      const categoria = await obtenerCategoriaAhorro(user.id);
      let errorGasto = categoria.error;
      if (!errorGasto && categoria.id) {
        const respuesta = await crearGasto(user.id, {
          monto: Number(abono),
          fecha: fechaHoy(),
          descripcion: 'Abono a meta: ' + metaAbono.nombre_meta,
          id_categoria: categoria.id,
        });
        errorGasto = respuesta.error;
      }
      if (errorGasto) mostrarAlerta('Aviso', 'El abono se guardó, pero no se pudo registrar como gasto: ' + mensajeError(errorGasto));
    }

    setMetaAbono(null);
    setAbono('');
    cargarMetas();
  };

  const borrarMeta = (id: number) => {
    confirmar('¿Eliminar esta meta?', async () => {
      const { error } = await eliminarMeta(id);
      if (error) mostrarAlerta('Error', mensajeError(error));
      cargarMetas();
    });
  };

  if (cargando) return <Cargando />;

  return (
    <View style={styles.container}>
      <Boton titulo="+ Nueva Meta" onPress={() => abrirModal()} />

      <FlatList
        data={metas}
        keyExtractor={(item) => String(item.id_meta_ahorro)}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={<ListaVacia mensaje="No tienes metas de ahorro." />}
        renderItem={({ item }) => {
          const ahorrado = Number(item.monto_actual || 0);
          const objetivo = Number(item.monto_objetivo);
          const porcentaje = Math.min(100, Math.round((ahorrado / objetivo) * 100)) || 0;
          return (
            <Tarjeta>
              <View style={styles.fila}>
                <Text style={styles.nombre}>{item.nombre_meta}</Text>
                <Text style={styles.porcentaje}>{porcentaje}%</Text>
              </View>

              {/* Barra de progreso */}
              <View style={styles.barraFondo}>
                <View style={[styles.barra, { width: `${porcentaje}%` }]} />
              </View>

              <Text style={styles.detalle}>
                {formatoPesos(ahorrado)} de {formatoPesos(objetivo)}
              </Text>
              {item.fecha_fin && <Text style={styles.fecha}>Hasta: {item.fecha_fin}</Text>}

              <View style={[styles.fila, { marginTop: 10 }]}>
                <TouchableOpacity onPress={() => setMetaAbono(item)}>
                  <Text style={{ color: colores.primario, fontWeight: 'bold' }}>+ Abonar</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity onPress={() => abrirModal(item)} style={{ marginRight: 15 }}>
                    <Text style={{ color: colores.primario, fontWeight: 'bold' }}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => borrarMeta(item.id_meta_ahorro)}>
                    <Text style={{ color: colores.rojo, fontWeight: 'bold' }}>Borrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Tarjeta>
          );
        }}
      />

      <ModalFormulario
        visible={modalVisible}
        titulo={editandoId ? 'Editar Meta' : 'Nueva Meta'}
        onGuardar={guardarMeta}
        onCerrar={() => setModalVisible(false)}
        guardando={guardando}
      >
        <Input label="Nombre" placeholder="Ej: Viaje" value={nombreMeta} onChangeText={setNombreMeta} />
        <Input label="Monto objetivo" placeholder="Ej: 2000000" keyboardType="numeric" value={montoObjetivo} onChangeText={setMontoObjetivo} />
        <Input label="Monto ahorrado" keyboardType="numeric" value={montoActual} onChangeText={setMontoActual} />
        <Input label="Fecha inicio (AAAA-MM-DD)" value={fechaInicio} onChangeText={setFechaInicio} />
        <Input label="Fecha fin (AAAA-MM-DD)" placeholder="Opcional" value={fechaFin} onChangeText={setFechaFin} />
      </ModalFormulario>

      <ModalFormulario
        visible={metaAbono !== null}
        titulo={'Abonar a ' + (metaAbono?.nombre_meta || '')}
        onGuardar={guardarAbono}
        onCerrar={() => setMetaAbono(null)}
        guardando={guardando}
      >
        <Input label="Monto a abonar" placeholder="Ej: 50000" keyboardType="numeric" value={abono} onChangeText={setAbono} />
      </ModalFormulario>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colores.fondo, padding: 15 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nombre: { fontSize: 16, fontWeight: 'bold', color: colores.texto },
  porcentaje: { fontWeight: 'bold', color: colores.primario },
  barraFondo: { height: 10, backgroundColor: colores.borde, borderRadius: 5, marginTop: 10, overflow: 'hidden' },
  barra: { height: 10, backgroundColor: colores.primario, borderRadius: 5 },
  detalle: { marginTop: 8, color: colores.texto },
  fecha: { fontSize: 12, color: colores.gris, marginTop: 3 },
});
