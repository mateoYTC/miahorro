import React from 'react';
import { TextInput, Text, View, StyleSheet, TextInputProps } from 'react-native';
import { colores } from '../theme/colores';

type Props = TextInputProps & {
  label: string;
};

export default function Input({ label, ...props }: Props) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor={colores.gris} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: 'bold', marginBottom: 5, color: colores.texto },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});
