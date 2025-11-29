// src/components/LoginPage.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      // Nếu đã login → tự động chuyển qua splash
      window.location.href = "/";
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (login(email, password)) {
      window.location.href = "/"; // reload để vào splash
    } else {
      setError("Sai rồi nè mèo ơi");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-cyan-500 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl blur-xl opacity-75" />
        <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl border-4 border-white/50">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Neko Nihongo
            </h1>
            <p className="text-2xl text-gray-700 mt-4">Đăng nhập thôi nào</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              placeholder="Email (vd: truc@neko.jp)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-6 py-4 rounded-2xl border-4 border-purple-300 focus:border-pink-500 outline-none text-lg"
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-6 py-4 rounded-2xl border-4 border-purple-300 focus:border-pink-500 outline-none text-lg"
            />

            {error && (
              <p className="text-red-500 text-center font-bold text-xl animate-bounce">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black text-2xl shadow-lg hover:scale-105 transition"
            >
              ĐĂNG NHẬP
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            <p>Gợi ý:</p>
            <p className="font-bold text-purple-600">admin@neko.jp / neko123</p>
            <p className="font-bold text-pink-600">truc@neko.jp / truc123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
