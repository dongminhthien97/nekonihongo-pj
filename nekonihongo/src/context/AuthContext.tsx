// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

// 3 USER CỨNG – KHÔNG CHO ĐĂNG KÝ
const HARDCODED_USERS = [
  {
    id: "1",
    email: "admin@neko.jp",
    password: "neko123",
    name: "Nữ Hoàng Mèo Trúc",
    role: "admin" as const,
  },
  {
    id: "2",
    email: "truc@neko.jp",
    password: "truc123",
    name: "Trúc Kawaii",
    role: "user" as const,
  },
  {
    id: "3",
    email: "momo@neko.jp",
    password: "momo123",
    name: "Momo Neko",
    role: "user" as const,
  },
] as const;

type SafeUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
};
type User = SafeUser | null;

interface AuthContextType {
  user: User;
  login: (email: string, password: string) => boolean;
  logout: () => void; // ← ĐÃ ĐƯỢC VIẾT LẠI CHUẨN
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  // Kiểm tra đã login chưa khi mở app
  useEffect(() => {
    const saved = localStorage.getItem("neko_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("neko_user");
      }
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const found = HARDCODED_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (found) {
      const { password: _, ...safeUser } = found;
      setUser(safeUser);
      localStorage.setItem("neko_user", JSON.stringify(safeUser));
      return true;
    }
    return false;
  };

  // LOGOUT HOÀN HẢO – XÓA HẾT + VỀ LOGIN NGAY
  const logout = () => {
    setUser(null);
    localStorage.removeItem("neko_user");
    // Ép reload để AppContent tự chuyển về LoginPage
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth phải dùng trong AuthProvider");
  return context;
};
