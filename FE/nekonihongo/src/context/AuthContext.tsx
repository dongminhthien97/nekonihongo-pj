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
  id: number;
  username: string;
  fullName?: string;
  email: string;
  role: "USER" | "ADMIN"; // backend trả về chữ HOA
  avatarUrl?: string;
  level: number;
  points: number;
  streak?: number;
  vocabularyProgress: number;
  kanjiProgress: number;
  grammarProgress: number;
  exerciseProgress: number;
  joinDate: string; // ISO string từ backend
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasSeenSplash: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
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

  // Khôi phục trạng thái từ localStorage khi reload
  useEffect(() => {
    const savedUser = localStorage.getItem("nekoUser");
    const splashSeen = localStorage.getItem("nekoSplashSeen") === "true";

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("nekoUser");
      }
    }

    setHasSeenSplash(splashSeen);
    setLoading(false);
  }, []);

  // LOGIN – đồng bộ 100% với backend
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await loginRequest(email, password);

      if (!data?.token || !data?.user) return false;

      // Lưu token
      localStorage.setItem("accessToken", data.token);
      if (data.refreshToken)
        localStorage.setItem("refreshToken", data.refreshToken);

      // Lưu user + chuẩn hóa role (nếu backend trả chữ thường)
      const normalizedUser: User = {
        ...data.user,
        role: (data.user.role || "USER").toUpperCase() as "USER" | "ADMIN",
        avatarUrl: data.user.avatarUrl || "",
        fullName: data.user.fullName || data.user.username,
        streak: data.user.streak || 0,
        exerciseProgress: data.user.exerciseProgress || 0,
      };

      localStorage.setItem("nekoUser", JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      setHasSeenSplash(false);

      // Chuyển về trang trung gian để phân quyền
      onNavigate?.("mypage");

      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    setHasSeenSplash(false);
    localStorage.removeItem("nekoUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("nekoSplashSeen");
    onNavigate?.("landing");
  };

  // Cập nhật user (avatar, progress, v.v.)
  const updateUser = (updates: Partial<User>) => {
    if (!user) return;

    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("nekoUser", JSON.stringify(updated));
  };

  // Đánh dấu đã xem splash
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
        onNavigate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
