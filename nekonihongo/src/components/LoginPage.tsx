// src/pages/LoginPage.tsx hoặc src/components/LoginPage.tsx
import { useState, useEffect } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuth } from "../context/AuthContext";
import { Background } from "./Background";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [confetti, setConfetti] = useState(false);

  const { login, user } = useAuth();

  // Nếu đã đăng nhập → tự động về trang chủ
  useEffect(() => {
    if (user) {
      window.location.href = "/";
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const success = await login(email, password); // gọi đúng hàm login từ AuthContext

    if (success) {
      setConfetti(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 1800);
    } else {
      setError("Sai mật khẩu rồi nè mèo ơi!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <Background />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-900/30 via-purple-900/30 to-cyan-900/30" />

      {/* Sakura Petals */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-3xl animate-sakura-fall"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${-10 + Math.random() * 20}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8 animate-fade-in-scale">
          <h1 className="hero-text-glow text-5xl sm:text-6xl lg:text-7xl text-white mb-4">
            猫日本語
          </h1>
          <p className="hero-text-glow text-3xl sm:text-4xl text-white">
            にゃんこログイン
          </p>
        </div>

        {/* Bouncing Neko */}
        <div className="mb-8 animate-bounce-gentle">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500 blur-3xl opacity-60 animate-pulse-slow"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-pink-300 to-purple-400 blur-xl opacity-50 animate-spin-slow"></div>
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <ImageWithFallback
                src="https://ih1.redbubble.net/image.5481873298.3314/st,small,507x507-pad,600x600,f8f8f8.jpg"
                alt="Neko Nihongo"
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover shadow-2xl border-6 border-white/95 
                           ring-4 ring-pink-300/60 hover:ring-pink-400/90 
                           hover:scale-110 hover:-rotate-6 transition-all duration-500"
              />
            </div>
            <div className="absolute inset-0 rounded-full ring-8 ring-pink-400/30 animate-ping-slow"></div>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md animate-slide-up">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-3xl blur-xl opacity-75 animate-pulse"></div>
            <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl border-4 border-white/50">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block mb-2 text-gray-700">
                    <span className="mr-2 text-xl">Email</span> Email
                  </label>
                  <input
                    type="email"
                    placeholder="admin@neko.jp"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-5 py-4 rounded-2xl border-3 border-pink-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-gray-700">
                    <span className="mr-2 text-xl">Password</span> Mật khẩu
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-5 py-4 rounded-2xl border-3 border-pink-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all duration-300"
                  />
                </div>

                {error && (
                  <div className="text-center animate-scale-in">
                    <p className="text-red-500 bg-red-100 rounded-2xl px-4 py-3 animate-shake">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white text-xl font-bold shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    ĐĂNG NHẬP
                    <span className="text-3xl">Paw</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </form>

              {/* Corner Cats */}
              <div className="absolute -top-16 -left-6 text-5xl animate-wiggle-1">
                😺
              </div>
              <div className="absolute -top-6 -right-6 text-5xl animate-wiggle-2">
                😸
              </div>
              <div className="absolute -bottom-6 -left-6 text-5xl animate-wiggle-3">
                😻
              </div>
              <div className="absolute -bottom-6 -right-6 text-5xl animate-wiggle-4">
                😽
              </div>
            </div>
          </div>
        </div>

        {/* Confetti khi login thành công */}
        {confetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 60 }).map((_, i) => (
              <div
                key={i}
                className="absolute text-4xl animate-confetti"
                style={
                  {
                    left: "50%",
                    top: "50%",
                    animationDelay: `${i * 0.02}s`,
                    "--confetti-x": `${(Math.random() - 0.5) * 120}vw`,
                    "--confetti-y": `${-300 - Math.random() * 500}px`,
                    "--confetti-rotate": `${Math.random() * 720}deg`,
                  } as React.CSSProperties
                }
              >
                {
                  [
                    "Cat",
                    "Cherry Blossom",
                    "Party",
                    "Sparkles",
                    "Paw",
                    "Heart",
                  ][i % 6]
                }
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toàn bộ CSS giữ nguyên – siêu đẹp, không thiếu hiệu ứng nào */}
      <style>{`
        /* (Giữ nguyên toàn bộ style bạn đã có trước đó – mình không cắt bớt) */
        .hero-text-glow { text-shadow: 0 0 20px #FF69B4, 0 0 40px #A020F0, 0 0 60px #00FFFF, 0 0 80px #FF69B4, 0 0 100px #A020F0, 0 4px 20px rgba(0,0,0,0.9); filter: drop-shadow(0 10px 20px rgba(0,0,0,0.8)); }
        @keyframes scroll-bg { 0% { transform: translateX(0); } 100% { transform: translateX(-100vw); } }
        .animate-scroll-bg { animation: scroll-bg 35s linear infinite; }
        @keyframes bounce-gentle { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
        .animate-bounce-gentle { animation: bounce-gentle 2.5s ease-in-out infinite; }
        @keyframes fade-in-scale { 0% { opacity:0; transform:scale(0); } 100% { opacity:1; transform:scale(1); } }
        .animate-fade-in-scale { animation: fade-in-scale 0.9s ease-out; }
        @keyframes slide-up { 0% { opacity:0; transform:translateY(50px); }100% { opacity:1; transform:translateY(0); } }
        .animate-slide-up { animation: slide-up 0.7s ease-out 0.4s both; }
        @keyframes sakura-fall { 0% { transform: translateY(-10vh) rotate(0deg); } 100% { transform: translateY(110vh) rotate(360deg) translateX(50px); } }
        .animate-sakura-fall { animation: sakura-fall linear infinite; }
        @keyframes confetti { 0% { transform: translate(0,0) scale(0) rotate(0); opacity:1; } 100% { transform: translate(var(--confetti-x), var(--confetti-y)) scale(0.8) rotate(var(--confetti-rotate)); opacity:0; } }
        .animate-confetti { animation: confetti 3s ease-out forwards; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        @keyframes ping-slow { 0%,100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.3); opacity: 0.6; } }
        .animate-ping-slow { animation: ping-slow 4s ease-in-out infinite; }
        .animate-wiggle-1 { animation: wiggle-1 3s ease-in-out infinite; }
        .animate-wiggle-2 { animation: wiggle-2 3s ease-in-out infinite 0.5s; }
        .animate-wiggle-3 { animation: wiggle-3 3s ease-in-out infinite 1s; }
        .animate-wiggle-4 { animation: wiggle-4 3s ease-in-out infinite 1.5s; }
        @keyframes wiggle-1 { 0%,100%{transform:rotate(0)}50%{transform:rotate(-20deg)} }
        @keyframes wiggle-2 { 0%,100%{transform:rotate(0)}50%{transform:rotate(20deg)} }
        @keyframes wiggle-3 { 0%,100%{transform:rotate(0)}50%{transform:rotate(18deg)} }
        @keyframes wiggle-4 { 0%,100%{transform:rotate(0)}50%{transform:rotate(-18deg)} }
        @keyframes shake { 0%,100%{transform:translateX(0)}25%{transform:translateX(-12px)}75%{transform:translateX(12px)} }
        .animate-shake { animation: shake 0.6s ease-in-out; }
        button:hover { cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><text y="20" font-size="24">Paw</text></svg>') 16 16, pointer; }
      `}</style>
    </div>
  );
}
