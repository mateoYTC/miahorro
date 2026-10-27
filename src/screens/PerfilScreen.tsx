import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { obtenerUsuario, crearUsuario, editarUsuario, eliminarUsuario } from '../services/usuariosService';
import Boton from '../components/Boton';
import Input from '../components/Input';
import Tarjeta from '../components/Tarjeta';
import { Cargando } from '../components/Estados';
import { colores } from '../theme/colores';
import { mensajeError } from '../utils/formato';
import { mostrarAlerta, confirmar } from '../utils/alertas';

export default function PerfilScreen() {
  const { user, signOut } = useAuth();
  const [nombre, setNombre] = useState('');
  const [existe, setExiste] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    if (!user) return;
    const { data, error } = await obtenerUsuario(user.id);
    if (error) mostrarAlerta('Error', mensajeError(error));
    if (data) {
      setNombre(data.nombre);
      setExiste(true);
    }
    setCargando(false);
  };

  const guardarPerfil = async () => {
    if (!user) return;
    if (!nombre) return mostrarAlerta('Error', 'El nombre es obligatorio.');

    setGuardando(true);
    // Si el usuario no está en la tabla lo creamos, si ya está lo actualizamos
    const { error } = existe ? await editarUsuario(user.id, nombre) : await crearUsuario(user.id, nombre, user.email || '');
    setGuardando(false);

    if (error) return mostrarAlerta('Error', mensajeError(error));
    setExiste(true);
    mostrarAlerta('Listo', 'Perfil guardado correctamente.');
  };

  const borrarPerfil = () => {
    if (!user) return;
    confirmar('¿Eliminar tu perfil? Esta acción no se puede deshacer.', async () => {
      const { error } = await eliminarUsuario(user.id);
      if (error) return mostrarAlerta('Error', mensajeError(error));
      signOut();
    });
  };

  if (cargando) return <Cargando />;

  return (
    <View style={styles.container}>
      <Tarjeta>
        <Text style={styles.titulo}>Mis datos</Text>
        <Input label="Nombre" value={nombre} onChangeText={setNombre} />
        <Input label="Correo" value={user?.email || ''} editable={false} />
        <Boton titulo="Guardar cambios" onPress={guardarPerfil} cargando={guardando} />
      </Tarjeta>

      <Boton titulo="Cerrar sesión" onPress={signOut} color={colores.gris} />
      {existe && <Boton titulo="Eliminar mi perfil" onPress={borrarPerfil} color={colores.rojo} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colores.fondo, padding: 15 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: colores.texto, marginBottom: 15 },
});
