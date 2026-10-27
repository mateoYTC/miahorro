import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { obtenerIngresos } from '../services/ingresosService';
import { obtenerGastos } from '../services/gastosService';
import { obtenerMetas } from '../services/metasService';
import { obtenerUsuario } from '../services/usuariosService';
import { Cargando } from '../components/Estados';
import Tarjeta from '../components/Tarjeta';
import { colores } from '../theme/colores';
import { fechaHoy, formatoPesos, mensajeError } from '../utils/formato';
import { mostrarAlerta } from '../utils/alertas';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [gastosHoy, setGastosHoy] = useState(0);
  const [gastosMes, setGastosMes] = useState(0);
  const [totalMetas, setTotalMetas] = useState(0);

  // Recarga los datos cada vez que se entra a esta pantalla
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarDatos();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarDatos = async () => {
    if (!user) return;
    try {
      const ingresos = await obtenerIngresos(user.id);
      const gastos = await obtenerGastos(user.id);
      const metas = await obtenerMetas(user.id);
      const usuario = await obtenerUsuario(user.id);

      if (ingresos.error) throw ingresos.error;
      if (gastos.error) throw gastos.error;
      if (metas.error) throw metas.error;

      const listaGastos = gastos.data || [];
      const hoy = fechaHoy();
      const mesActual = hoy.substring(0, 7);

      let sumaIngresos = 0;
      for (const ingreso of ingresos.data || []) sumaIngresos += Number(ingreso.monto);

      let sumaGastos = 0;
      let sumaHoy = 0;
      let sumaMes = 0;
      for (const gasto of listaGastos) {
        sumaGastos += Number(gasto.monto);
        if (gasto.fecha === hoy) sumaHoy += Number(gasto.monto);
        if (gasto.fecha.startsWith(mesActual)) sumaMes += Number(gasto.monto);
      }

      setTotalIngresos(sumaIngresos);
      setTotalGastos(sumaGastos);
      setGastosHoy(sumaHoy);
      setGastosMes(sumaMes);
      setTotalMetas(metas.data?.length || 0);
      setNombre(usuario.data?.nombre || user.email?.split('@')[0] || '');
    } catch (error) {
      mostrarAlerta('Error', mensajeError(error));
    } finally {
      setLoading(false);
    }
  };

  const saldo = totalIngresos - totalGastos;

  if (loading) return <Cargando />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <Text style={styles.saludo}>Hola, {nombre} 👋</Text>

      <View style={styles.saldoCard}>
        <Text style={styles.saldoTitulo}>Saldo actual</Text>
        <Text style={[styles.saldoValor, { color: saldo >= 0 ? '#fff' : '#ffd6d6' }]}>{formatoPesos(saldo)}</Text>
      </View>

      <View style={styles.fila}>
        <Tarjeta style={styles.mitad}>
          <Text style={styles.etiqueta}>Ingresos</Text>
          <Text style={[styles.valor, { color: colores.primario }]}>{formatoPesos(totalIngresos)}</Text>
        </Tarjeta>
        <Tarjeta style={styles.mitad}>
          <Text style={styles.etiqueta}>Gastos</Text>
          <Text style={[styles.valor, { color: colores.rojo }]}>{formatoPesos(totalGastos)}</Text>
        </Tarjeta>
      </View>

      <View style={styles.fila}>
        <Tarjeta style={styles.mitad}>
          <Text style={styles.etiqueta}>Gastado hoy</Text>
          <Text style={styles.valor}>{formatoPesos(gastosHoy)}</Text>
        </Tarjeta>
        <Tarjeta style={styles.mitad}>
          <Text style={styles.etiqueta}>Gastado este mes</Text>
          <Text style={styles.valor}>{formatoPesos(gastosMes)}</Text>
        </Tarjeta>
      </View>

      <Text style={styles.seccion}>Mis módulos</Text>
      <View style={styles.grid}>
        <TouchableOpacity style={styles.modulo} onPress={() => navigation.navigate('Gastos')}>
          <Text style={styles.moduloTexto}>🛒 Gastos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modulo} onPress={() => navigation.navigate('Ingresos')}>
          <Text style={styles.moduloTexto}>💰 Ingresos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modulo} onPress={() => navigation.navigate('Metas')}>
          <Text style={styles.moduloTexto}>🎯 Metas ({totalMetas})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modulo} onPress={() => navigation.navigate('Categorias')}>
          <Text style={styles.moduloTexto}>🏷️ Categorías</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 20, width: '100%', maxWidth: 700, alignSelf: 'center' },
  saludo: { fontSize: 22, fontWeight: 'bold', color: colores.texto, marginBottom: 15 },
  saldoCard: { backgroundColor: colores.primario, padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  saldoTitulo: { color: colores.secundario, fontSize: 16 },
  saldoValor: { fontSize: 34, fontWeight: 'bold', marginTop: 5 },
  fila: { flexDirection: 'row', justifyContent: 'space-between' },
  mitad: { width: '48%' },
  etiqueta: { color: colores.gris, fontSize: 14 },
  valor: { fontSize: 18, fontWeight: 'bold', marginTop: 5, color: colores.texto },
  seccion: { fontSize: 18, fontWeight: 'bold', color: colores.texto, marginVertical: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  modulo: { backgroundColor: '#fff', width: '48%', padding: 20, borderRadius: 10, alignItems: 'center', marginBottom: 15, elevation: 2 },
  moduloTexto: { fontSize: 16, fontWeight: 'bold', color: colores.primario },
});
