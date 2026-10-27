import { Alert, Platform } from 'react-native';

// En web Alert.alert no funciona, por eso se usa window.alert y window.confirm

export function mostrarAlerta(titulo: string, mensaje: string) {
  if (Platform.OS === 'web') {
    window.alert(titulo + '\n' + mensaje);
  } else {
    Alert.alert(titulo, mensaje);
  }
}

export function confirmar(mensaje: string, alAceptar: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(mensaje)) alAceptar();
  } else {
    Alert.alert('Confirmar', mensaje, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí, eliminar', style: 'destructive', onPress: alAceptar },
    ]);
  }
}
