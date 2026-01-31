// src/context/AuthContext.tsx (FULL CODE HOÀN CHỈNH – FIX BUG REPEATED LOGIN/LOGOUT REDIRECT LOGIN, THÊM RELOAD SAU LOGIN/LOGOUT ĐỂ AUTH LOAD USER MỚI, LOADING UX MƯỢT)

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { loginRequest } from "../api/auth";
import api from "../api/auth";
import toast from "react-hot-toast";

export interface User {
  id: number;
  username: string;
  fullName?: string;
  email: string;
  role: "USER" | "ADMIN";
  avatarUrl?: string;
  level: number;
  points: number;
  streak?: number;
  longestStreak?: number;
  joinDate: string;
  lastLoginDate?: string;
  status?: "ACTIVE" | "INACTIVE" | "BANNED";
  vocabularyProgress?: number;
  kanjiProgress?: number;
  grammarProgress?: number;
  exerciseProgress?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasSeenSplash: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  markSplashAsSeen: () => void;
  onNavigate?: (page: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
  onNavigate,
}: {
  children: ReactNode;
  onNavigate?: (page: string) => void;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenSplash, setHasSeenSplash] = useState(false);

  const loadUserFromBackend = async () => {
    try {
      const res = await api.get("/user/me");
      const backendUser = res.data?.data;

      if (!backendUser) throw new Error("No user data");

      const normalizedUser: User = {
        id: backendUser.id,
        username: backendUser.username || "",
        fullName: backendUser.fullName,
        email: backendUser.email,
        role: (backendUser.role || "USER").toUpperCase() as "USER" | "ADMIN",
        avatarUrl: backendUser.avatarUrl || "",
        level: backendUser.level || 1,
        points: backendUser.points || 0,
        streak: backendUser.streak || 0,
        longestStreak: backendUser.longestStreak || 0,
        joinDate: backendUser.joinDate,
        lastLoginDate: backendUser.lastLoginDate,
        status: backendUser.status,
        vocabularyProgress: backendUser.vocabularyProgress || 0,
        kanjiProgress: backendUser.kanjiProgress || 0,
        grammarProgress: backendUser.grammarProgress || 0,
        exerciseProgress: backendUser.exerciseProgress || 0,
      };

      setUser(normalizedUser);
      localStorage.setItem("nekoUser", JSON.stringify(normalizedUser));
    } catch (err: any) {
      console.error("Load user failed:", err);
      const savedUser = localStorage.getItem("nekoUser");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }

      if (err?.response?.status === 401) {
        logout();
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const splashSeen = localStorage.getItem("nekoSplashSeen") === "true";
      setHasSeenSplash(splashSeen);

      if (token) {
        await loadUserFromBackend();
      } else {
        const savedUser = localStorage.getItem("nekoUser");
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            localStorage.removeItem("nekoUser");
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await loginRequest(email, password);

      if (!data?.token) {
        toast.error("Đăng nhập thất bại! Kiểm tra email/mật khẩu 😿");
        return false;
      }

      localStorage.setItem("accessToken", data.token);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      await loadUserFromBackend();

      // Không set hasSeenSplash = false nếu muốn giữ splash chỉ lần đầu
      // setHasSeenSplash(false); // Comment nếu không muốn splash mỗi lần login

      toast.success("Đăng nhập thành công! Chào mừng trở lại 😻");

      // FORCE RELOAD ĐỂ AUTH CONTEXT + INTERCEPTOR LOAD TOKEN MỚI HOÀN TOÀN
      // FIX BUG REPEATED LOGIN REDIRECT LOGIN
      window.location.reload();

      return true;
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Email hoặc mật khẩu sai! 😿");
      } else {
        toast.error("Lỗi đăng nhập. Mèo đang kiểm tra... 😿");
      }
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setHasSeenSplash(false);
    localStorage.removeItem("nekoUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("nekoSplashSeen");

    toast.success("Đăng xuất thành công! Hẹn gặp lại nhé 👋");

    onNavigate?.("landing");

    // FORCE RELOAD ĐỂ CLEAN STATE HOÀN TOÀN
    window.location.reload();
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("nekoUser", JSON.stringify(updated));
  };

  const refreshUser = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      await loadUserFromBackend();
    } catch {
      toast.error("Không thể cập nhật thông tin 😿");
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
        refreshUser,
        markSplashAsSeen,
        onNavigate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
