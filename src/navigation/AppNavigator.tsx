import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { Cargando } from '../components/Estados';
import { colores } from '../theme/colores';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import GastosScreen from '../screens/GastosScreen';
import IngresosScreen from '../screens/IngresosScreen';
import MetasScreen from '../screens/MetasScreen';
import CategoriasScreen from '../screens/CategoriasScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Función para poner un emoji como ícono de cada pestaña
const icono = (emoji: string) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

// Menú de abajo que se ve en todas las pantallas privadas
function MenuPrincipal() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colores.primario },
        headerTintColor: '#fff',
        tabBarActiveTintColor: colores.primario,
        tabBarLabelStyle: { fontSize: 10 },
      }}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} options={{ tabBarIcon: icono('🏠'), title: 'Mi Ahorro', tabBarLabel: 'Inicio' }} />
      <Tab.Screen name="Gastos" component={GastosScreen} options={{ tabBarIcon: icono('🛒') }} />
      <Tab.Screen name="Ingresos" component={IngresosScreen} options={{ tabBarIcon: icono('💰') }} />
      <Tab.Screen name="Metas" component={MetasScreen} options={{ tabBarIcon: icono('🎯') }} />
      <Tab.Screen name="Categorias" component={CategoriasScreen} options={{ tabBarIcon: icono('🏷️'), title: 'Categorías' }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ tabBarIcon: icono('👤') }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { session, loading } = useAuth();

  if (loading) return <Cargando />;

  // Si no hay sesión solo se puede ver el Login (rutas protegidas)
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <Stack.Screen name="Principal" component={MenuPrincipal} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
