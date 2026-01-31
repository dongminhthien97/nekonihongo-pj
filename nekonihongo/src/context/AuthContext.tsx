import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  avatar: string;
  level: string;
  points: number;
  vocabularyProgress: number;
  kanjiProgress: number;
  grammarProgress: number;
  completedExercises: number;
  joinedDate: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasSeenSplash: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  markSplashAsSeen: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users data
export const mockUsers: (User & { password: string })[] = [
  {
    id: "user1",
    username: "nekochan",
    email: "nekochan@example.com",
    password: "user123",
    role: "user",
    avatar: "😺",
    level: "N5",
    points: 850,
    vocabularyProgress: 75,
    kanjiProgress: 60,
    grammarProgress: 80,
    completedExercises: 12,
    joinedDate: "2024-01-15",
  },
  {
    id: "admin1",
    username: "admin",
    email: "admin@nekonihongo.com",
    password: "admin123",
    role: "admin",
    avatar: "👑",
    level: "Admin",
    points: 9999,
    vocabularyProgress: 100,
    kanjiProgress: 100,
    grammarProgress: 100,
    completedExercises: 50,
    joinedDate: "2023-12-01",
  },
  {
    id: "user2",
    username: "sakura",
    email: "sakura@example.com",
    password: "user123",
    role: "user",
    avatar: "🌸",
    level: "N4",
    points: 1250,
    vocabularyProgress: 85,
    kanjiProgress: 70,
    grammarProgress: 90,
    completedExercises: 20,
    joinedDate: "2024-02-10",
  },
  {
    id: "user3",
    username: "yuki",
    email: "yuki@example.com",
    password: "user123",
    role: "user",
    avatar: "❄️",
    level: "N5",
    points: 450,
    vocabularyProgress: 45,
    kanjiProgress: 35,
    grammarProgress: 50,
    completedExercises: 6,
    joinedDate: "2024-03-05",
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenSplash, setHasSeenSplash] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem("nekoUser");
        const splashSeen = localStorage.getItem("nekoSplashSeen");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        if (splashSeen === "true") {
          setHasSeenSplash(true);
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const foundUser = mockUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem("nekoUser", JSON.stringify(userWithoutPassword));
      // Reset splash seen when user logs in
      setHasSeenSplash(false);
      localStorage.removeItem("nekoSplashSeen");
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setHasSeenSplash(false);
    localStorage.removeItem("nekoUser");
    localStorage.removeItem("nekoSplashSeen");
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser };
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
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
