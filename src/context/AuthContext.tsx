import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { UserProfile } from "../types";

const STORAGE_KEY_USER = "@notez/user";
const STORAGE_KEY_TOKEN = "@notez/token";

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAsGuest: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEFAULT_GUEST_USER: UserProfile = {
  name: "Convidado",
  email: "convidado@notez.app",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ao abrir o app, tenta restaurar a sessão salva localmente.
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_USER);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (error) {
        console.warn("Falha ao restaurar sessão", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persistUser = useCallback(async (nextUser: UserProfile) => {
    setUser(nextUser);
    await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(nextUser));
  }, []);

  const loginAsGuest = useCallback(async () => {
    await persistUser(DEFAULT_GUEST_USER);
  }, [persistUser]);

  /**
   * Login "mock": salva um usuário local a partir do email digitado.
   *
   * Quando plugar um backend real (ex: Supabase, Firebase, API própria),
   * troque o corpo desta função por uma chamada HTTP, por exemplo:
   *
   *   const response = await fetch("https://sua-api.com/auth/login", {
   *     method: "POST",
   *     body: JSON.stringify({ email, password }),
   *   });
   *   const data = await response.json();
   *   await AsyncStorage.setItem(STORAGE_KEY_TOKEN, data.token);
   *   await persistUser(data.user);
   *
   * Nenhuma tela precisa mudar — todas usam `useAuth()`.
   */
  const login = useCallback(
    async (email: string, _password: string) => {
      const nextUser: UserProfile = { name: email.split("@")[0], email };
      await persistUser(nextUser);
    },
    [persistUser],
  );

  const updateProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!user) return;
      await persistUser({ ...user, ...data });
    },
    [user, persistUser],
  );

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.multiRemove([STORAGE_KEY_USER, STORAGE_KEY_TOKEN]);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      loginAsGuest,
      login,
      updateProfile,
      logout,
    }),
    [user, isLoading, loginAsGuest, login, updateProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
