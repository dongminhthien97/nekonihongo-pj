// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

const HARDCODED_USERS = [
  {
    id: "1",
    email: "admin@neko.jp",
    password: "neko123",
    name: "Nữ Hoàng Mèo Trúc",
    role: "admin",
  },
  {
    id: "2",
    email: "truc@neko.jp",
    password: "truc123",
    name: "Trúc Kawaii",
    role: "user",
  },
  {
    id: "3",
    email: "huynh@neko.jp",
    password: "huynh123",
    name: "Huỳnh Kawaii",
    role: "user",
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
  hasSeenSplash: boolean;
  loading: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  markSplashAsSeen: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [hasSeenSplash, setHasSeenSplash] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("neko_user");
    const seen = localStorage.getItem("neko_splash_seen") === "true";

    if (saved) {
      try {
        setUser(JSON.parse(saved));
        setHasSeenSplash(seen);
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    const found = HARDCODED_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (found) {
      const { password: _, ...safeUser } = found;
      setUser(safeUser);
      localStorage.setItem("neko_user", JSON.stringify(safeUser));
      // Không set splash_seen ở đây → để SplashScreen tự set sau khi hiện
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setHasSeenSplash(false);
    localStorage.removeItem("neko_user");
    localStorage.removeItem("neko_splash_seen");
  };

  const markSplashAsSeen = () => {
    setHasSeenSplash(true);
    localStorage.setItem("neko_splash_seen", "true");
  };

  return (
    <AuthContext.Provider
      value={{ user, hasSeenSplash, login, logout, markSplashAsSeen, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth phải dùng trong AuthProvider");
  return context;
};
