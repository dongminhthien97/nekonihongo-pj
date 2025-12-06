// src/pages/MyPage.tsx
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

interface MyPageProps {
  onNavigate: (path: string) => void;
}

export function MyPage({ onNavigate }: MyPageProps) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      onNavigate("/login");
      return;
    }

    // Role check: navigate using simple page ids to match `MainApp`
    if (user.role === "ADMIN") {
      onNavigate("admin");
    } else {
      onNavigate("user");
    }
  }, [user, onNavigate]);

  // Hiển thị loading cute trong lúc kiểm tra
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-pink-100 via-purple-100 to-indigo-100">
      <div className="text-center">
        <div className="text-9xl animate-bounce mb-8">Cat Face</div>
        <p className="text-4xl font-bold text-purple-700 animate-pulse">
          Đang đưa mèo về nhà...
        </p>
        <p className="text-xl text-gray-600 mt-4">
          {user?.username
            ? `Chào ${user.username} Sparkles`
            : "Đang kiểm tra quyền..."}
        </p>
      </div>
    </div>
  );
}
