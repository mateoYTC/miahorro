import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Boton from '../components/Boton';
import { colores } from '../theme/colores';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    // Validaciones del formulario
    if (!email || !password || (!isLogin && !nombre)) {
      setError('Por favor, llena todos los campos.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('El correo no es válido.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    let mensaje;
    if (isLogin) {
      mensaje = await signIn(email.trim(), password);
    } else {
      mensaje = await signUp(email.trim(), password, nombre.trim());
    }
    setLoading(false);

    // Si no hay error, la navegación lleva al Inicio sola
    if (mensaje) setError(mensaje);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.caja}>
        <Text style={styles.title}>🌱 Mi Ahorro</Text>
        <Text style={styles.subtitle}>{isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!isLogin && <Input label="Nombre" placeholder="Tu nombre" value={nombre} onChangeText={setNombre} />}
        <Input
          label="Correo"
          placeholder="Escribe tu correo"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input label="Contraseña" placeholder="Mínimo 6 caracteres" value={password} onChangeText={setPassword} secureTextEntry />

        <Boton titulo={isLogin ? 'Entrar' : 'Registrarse'} onPress={handleSubmit} cargando={loading} />

        <TouchableOpacity
          onPress={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
        >
          <Text style={styles.switchText}>{isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: colores.fondo },
  caja: { width: '100%', maxWidth: 450, alignSelf: 'center' },
  title: { fontSize: 30, fontWeight: 'bold', textAlign: 'center', color: colores.primario, marginBottom: 5 },
  subtitle: { fontSize: 18, textAlign: 'center', marginBottom: 25, color: colores.gris },
  error: { backgroundColor: '#fdecea', color: colores.rojo, padding: 10, borderRadius: 8, marginBottom: 15, textAlign: 'center' },
  switchText: { color: colores.primario, textAlign: 'center', marginTop: 10, fontWeight: 'bold' },
});
