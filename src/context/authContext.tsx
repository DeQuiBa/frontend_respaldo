"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import api from '@/services/api';

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: UserData | null) => void; // Agregamos setUser
  loading: boolean;
  isAuthenticated: boolean;
}

interface UserData {
  id: number;
  nombre: string;
  primer_nombre: string;
  segundo_nombre: string;
  tercer_nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo: string;
  celular: string;
  rol: string;
  rolId: number;
  estado: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        try {
          // Verificar token
          const verifyResponse = await api.get('/auth/verify', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });

          if (verifyResponse.data.valid) {
            // Obtener usuario
            const userResponse = await api.get('/usuarios/me', {
              headers: { Authorization: `Bearer ${storedToken}` }
            });

            setToken(storedToken);
            setUser(userResponse.data);
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          localStorage.removeItem('token');
          console.error('Error en verificación o carga de usuario:', err);
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', {
        correo: email,
        password
      });

      const { token, user } = data;

      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      router.push('/dashboard/home');
    } catch (err) {
      console.error('Login error:', err);
      toast.error("Credenciales inválidas");
      throw new Error('Credenciales inválidas');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear(); // Agregar esto también
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    toast.success("Sesión cerrada con éxito");
    window.location.href = '/login';
  };

  const value = {
    user,
    token,
    login,
    logout,
    setUser, // Exponemos setUser
    loading,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};