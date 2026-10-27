import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colores } from '../theme/colores';
import Boton from './Boton';

type Props = {
  visible: boolean;
  titulo: string;
  onGuardar: () => void;
  onCerrar: () => void;
  guardando?: boolean;
  children: React.ReactNode;
};

// Modal que usan todas las pantallas para crear y editar
export default function ModalFormulario({ visible, titulo, onGuardar, onCerrar, guardando, children }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.fondo}>
        <View style={styles.contenido}>
          <Text style={styles.titulo}>{titulo}</Text>
          <ScrollView>{children}</ScrollView>
          <Boton titulo="Guardar" onPress={onGuardar} cargando={guardando} />
          <TouchableOpacity onPress={onCerrar} style={{ padding: 10, alignItems: 'center' }}>
            <Text style={{ color: colores.gris }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  contenido: { backgroundColor: '#fff', padding: 20, borderRadius: 15, maxHeight: '90%', width: '100%', maxWidth: 500, alignSelf: 'center' },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: colores.texto },
});
