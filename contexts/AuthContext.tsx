"use client"
import { createContext, useContext, useEffect, useState } from 'react';
import { login as loginFn, register as registerFn, logout as logoutFn, forgotPassword as forgotPasswordFn, getCurrentUser } from '@/controllers/AuthController';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, middleName: string, lastName: string, gender: string, dateOfBirth: Date, phone: string, service: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  forgotPassword: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      await loginFn(email, password);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      // Redirect based on user role
      if (currentUser?.profile?.role) {
        const role = currentUser.profile.role;
        console.log("Login successful, redirecting based on role:", role);
        switch (role) {
          case "student":
            router.push('/dashboard');
            break;
          case "mod":
            router.push('/mod');
            break;
          case "admin":
            router.push('/admin');
            break;
          default:
            router.push('/dashboard');
        }
      } else {
        console.log("Login successful, but no role found. Redirecting to dashboard.");
        router.push('/dashboard');
      }
    } catch (error) {
      console.error("Login error in AuthContext:", error);
      throw error;
    }
  }

  async function register(
    email: string, 
    password: string, 
    firstName: string,
    middleName: string,
    lastName: string,
    gender: string,
    dateOfBirth: Date,
    phone: string,
    service: string
  ) {
    try {
      await registerFn(
        email, 
        password, 
        firstName,
        middleName,
        lastName,
        gender,
        dateOfBirth,
        phone,
        service
      );
      await checkUser();
      router.push('/login');
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    try {
      await logoutFn();
      setUser(null);
      router.push('/login');
    } catch (error) {
      throw error;
    }
  }

  async function forgotPassword(email: string) {
    try {
      await forgotPasswordFn(email);
    } catch (error) {
      throw error;
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      forgotPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
