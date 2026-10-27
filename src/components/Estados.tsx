import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colores } from '../theme/colores';

export function Cargando() {
  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" color={colores.primario} />
      <Text style={styles.texto}>Cargando...</Text>
    </View>
  );
}

export function ListaVacia({ mensaje }: { mensaje: string }) {
  return (
    <View style={styles.centro}>
      <Text style={{ fontSize: 40 }}>📭</Text>
      <Text style={styles.texto}>{mensaje}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  texto: { marginTop: 10, color: colores.gris, fontSize: 16, textAlign: 'center' },
});
