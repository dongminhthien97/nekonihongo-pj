// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

// 1. Danh sách user cứng (có password để so sánh)
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

// 2. Type SafeUser: KHÔNG có password (dùng để lưu vào localStorage và state)
type SafeUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
};

// 3. Type User: là SafeUser hoặc null → CHỈ ĐỊNH NGHĨA 1 LẦN DUY NHẤT!!!
type User = SafeUser | null;

interface AuthContextType {
  user: User;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  // Kiểm tra đã login chưa khi mở app
  useEffect(() => {
    const saved = localStorage.getItem("neko_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Đảm bảo dữ liệu hợp lệ
        if (
          parsed &&
          typeof parsed === "object" &&
          "id" in parsed &&
          "role" in parsed
        ) {
          setUser(parsed as SafeUser);
        }
      } catch (e) {
        localStorage.removeItem("neko_user");
      }
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const found = HARDCODED_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (found) {
      // Tạo object an toàn, loại bỏ password
      const { password: _, ...safeUser } = found;
      setUser(safeUser);
      localStorage.setItem("neko_user", JSON.stringify(safeUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("neko_user");
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
