// src/context/AuthContext.tsx

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import { loginRequest } from "../api/auth";

export interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  avatarUrl: string;
  level: string;
  points: number;
  vocabularyProgress: number;
  kanjiProgress: number;
  grammarProgress: number;
  joinedDate: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasSeenSplash: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (u: Partial<User>) => void;
  markSplashAsSeen: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenSplash, setHasSeenSplash] = useState(false);

  // Load saved state
  useEffect(() => {
    const savedUser = localStorage.getItem("nekoUser");
    const seen = localStorage.getItem("nekoSplashSeen");

    if (savedUser) setUser(JSON.parse(savedUser));
    if (seen === "true") setHasSeenSplash(true);

    setLoading(false);
  }, []);

  // ---------------------
  // LOGIN with backend
  // ---------------------
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await loginRequest(email, password);

      if (!data?.token) {
        return false;
      }

      localStorage.setItem("accessToken", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("nekoUser", JSON.stringify(data.user));

      setUser(data.user);
      setHasSeenSplash(false);

      return true;
    } catch (err) {
      return false;
    }
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem("nekoUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("nekoSplashSeen");
    setHasSeenSplash(false);
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updated };
      setUser(newUser);
      localStorage.setItem("nekoUser", JSON.stringify(newUser));
    }
  };

  const markSplashAsSeen = () => {
    setHasSeenSplash(true);
    localStorage.setItem("nekoSplashSeen", "true");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        hasSeenSplash,
        login,
        logout,
        updateUser,
        markSplashAsSeen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
