import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colores } from '../theme/colores';

type Props = {
  titulo: string;
  onPress: () => void;
  color?: string;
  cargando?: boolean;
};

export default function Boton({ titulo, onPress, color = colores.primario, cargando = false }: Props) {
  return (
    <TouchableOpacity style={[styles.boton, { backgroundColor: color }]} onPress={onPress} disabled={cargando}>
      {cargando ? <ActivityIndicator color="#fff" /> : <Text style={styles.texto}>{titulo}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  boton: { padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10, minHeight: 48, justifyContent: 'center' },
  texto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
