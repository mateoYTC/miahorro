import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { crearUsuario } from '../services/usuariosService';
import { crearCategoriasIniciales } from '../services/categoriasService';
import { mensajeError } from '../utils/formato';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, nombre: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Revisa si ya había una sesión guardada en el celular
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));

    // Se ejecuta cada vez que el usuario inicia o cierra sesión
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  // Las funciones devuelven el mensaje de error o null si todo salió bien
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? mensajeError(error) : null;
    } catch (error) {
      return mensajeError(error);
    }
  };

  const signUp = async (email: string, password: string, nombre: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return mensajeError(error);

      // Si no hay sesión es porque Supabase está pidiendo confirmar el correo
      if (!data.session || !data.user) {
        return 'Cuenta creada, pero Supabase pide confirmar el correo. Desactiva "Confirm email" en Authentication.';
      }

      // Guardamos el usuario en nuestra tabla "usuarios"
      const respuesta = await crearUsuario(data.user.id, nombre, email);
      if (respuesta.error) return mensajeError(respuesta.error);

      // Cada usuario nuevo recibe sus propias categorías
      const categorias = await crearCategoriasIniciales(data.user.id);
      if (categorias.error) return mensajeError(categorias.error);

      return null;
    } catch (error) {
      return mensajeError(error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};
