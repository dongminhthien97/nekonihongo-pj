// src/pages/LoginPage.tsx hoặc src/components/LoginPage.tsx
import { useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuth } from "../context/AuthContext";
import { Background } from "./Background";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        setError("Tên đăng nhập hoặc mật khẩu không đúng!");
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <Background />

      {/* Gradient Overlay */}
      <div className="absolute inset-0" />

      {/* Floating Sakura Petals */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-3xl animate-sakura-fall"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${-30 + Math.random() * 20}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          >
            🌸
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8 animate-fade-in-scale">
          <h1 className="hero-text-glow text-5xl sm:text-6xl lg:text-7xl text-white mb-4">
            🐾 猫日本語 🐾
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
            <div className="halo-glow-neko"></div>
            <div className="relative bg-white rounded-[32px] backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl border-4 border-white/50">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block mb-2 text-gray-700">
                    <span className="mr-2 text-xl">Tên đăng nhập</span> 📧
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className="input-neko-focus ${error ? 'input-shake' : ''}"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-gray-700">
                    <span className="mr-2 text-xl">Password</span> 🔐
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="input-neko-focus ${error ? 'input-shake' : ''}"
                  />
                </div>

                {error && (
                  <div className="text-center animate-scale-in">
                    <p className="alert-error-neko">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-gradient-neko"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isLoading ? (
                      <>
                        Đang đăng nhập...{" "}
                        <span className="animate-spin text-2xl">🐱</span>
                      </>
                    ) : (
                      <>
                        ĐĂNG NHẬP <span className="text-3xl">🐾</span>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-linear-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Giữ nguyên toàn bộ style đẹp lung linh của bạn */}
      <style>{`
                .hero-text-glow {
          text-shadow: 
            0 0 20px #FF69B4,
            0 0 40px #A020F0,
            0 0 60px #00FFFF,
            0 0 80px #FF69B4,
            0 0 100px #A020F0,
            0 4px 20px rgba(0,0,0,0.9);
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.8));
        }

        @keyframes scroll-bg {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100vw); }
        }

        .animate-scroll-bg {
          animation: scroll-bg 30s linear infinite;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }

        @keyframes fade-in-scale {
          0% { 
            opacity: 0;
            transform: scale(0);
          }
          100% { 
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-scale {
          animation: fade-in-scale 0.8s ease-out;
        }

        @keyframes slide-up {
          0% { 
            opacity: 0;
            transform: translateY(50px);
          }
          100% { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out 0.3s both;
        }

        @keyframes scale-in {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        @keyframes sakura-fall {
          0% {
            transform: translateY(0) rotate(0deg) translateX(0);
          }
          100% {
            transform: translateY(100vh) rotate(360deg) translateX(50px);
          }
        }

        .animate-sakura-fall {
          animation: sakura-fall 10s linear infinite;
        }

        @keyframes wiggle-1 {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-15deg); }
        }

        .animate-wiggle-1 {
          animation: wiggle-1 2s ease-in-out infinite;
        }

        @keyframes wiggle-2 {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(15deg); }
        }

        .animate-wiggle-2 {
          animation: wiggle-2 2s ease-in-out infinite 0.5s;
        }

        @keyframes wiggle-3 {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(15deg); }
        }

        .animate-wiggle-3 {
          animation: wiggle-3 2s ease-in-out infinite 1s;
        }

        @keyframes wiggle-4 {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-15deg); }
        }

        .animate-wiggle-4 {
          animation: wiggle-4 2s ease-in-out infinite 1.5s;
        }

        @keyframes confetti {
          0% {
            transform: translate(0, 0) scale(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translate(var(--confetti-x), calc(var(--confetti-y) / 2)) scale(1) rotate(calc(var(--confetti-rotate) / 2));
            opacity: 1;
          }
          100% {
            transform: translate(var(--confetti-x), var(--confetti-y)) scale(0.8) rotate(var(--confetti-rotate));
            opacity: 0;
          }
        }

        .animate-confetti {
          animation: confetti 2.5s ease-out forwards;
        }

        input::placeholder {
          color: #d8b4d8;
        }

        input:focus {
          transform: translateY(-2px);
        }

        /* Paw cursor effect */
        button:hover {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23ff69b4"><text y="20" font-size="20">🐾</text></svg>') 12 12, pointer;
        }
        .input-neko-focus {
    /* Trạng thái mặc định */
    width: 100%;
    padding: 1.5rem 1.5rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    border: 4px solid #FBB6CE;                    /* border-pink-300 */
    color: #1F2937;
    font-size: 1.125rem;
    font-weight: 600;
    outline: none;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 10px 25px -5px rgba(236, 72, 153, 0.15);
  }

  .input-neko-focus::placeholder {
    color: rgba(168, 85, 247, 0.6);               /* tím nhạt cho placeholder */
  }

  /* KHI FOCUS – ĐẸP NHƯ ƯỚC MƠ */
  .input-neko-focus:focus {
    border-color: #A855F7;                        /* border-purple-500 */
    box-shadow: 
      0 0 0 4px rgba(168, 85, 247, 0.3),          /* focus:ring-4 + focus:ring-purple-200 */
      0 20px 40px -10px rgba(168, 85, 247, 0.35);
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 1);
  }

  /* Hiệu ứng khi đã nhập chữ (không còn placeholder) */
  .input-neko-focus:not(:placeholder-shown) {
    border-color: #F472B6;                        /* hồng đậm hơn một chút */
  }

  /* Optional: rung nhẹ khi sai */
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
  }
  .input-shake {
    animation: shake 0.5s ease-in-out;
    border-color: #EF4444 !important;
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.3) !important;
  }

  .alert-error-neko {
    color: #EF4444;                    /* text-red-500 */
    background-color: #FEE2E2;         /* bg-red-100 */
    border: 3px solid #FCA5A5;         /* viền đỏ hồng cute thêm */
    border-radius: 1rem;               /* rounded-2xl */
    padding: 1rem 1.5rem;              /* px-6 py-4 → mình làm to hơn tí cho dễ đọc */
    font-weight: 700;
    font-size: 1.1rem;
    text-align: center;
    box-shadow: 0 10px 30px rgba(239, 68, 68, 0.25);
    backdrop-filter: blur(10px);
    animation: shake 0.6s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    max-width: 420px;
    margin: 1rem auto;
  }

  /* Icon cảnh báo (tùy chọn thêm) */
  .alert-error-neko::before {
    content: "Warning";
    font-size: 1.8rem;
  }

  /* Animation shake siêu mượt + rung mạnh hơn */
  @keyframes shake {
    0%, 100%   { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-12px); }
    20%, 40%, 60%, 80%      { transform: translateX(12px); }
  }

  /* Khi hover → rung thêm lần nữa (cực kỳ cute) */
  .alert-error-neko:hover {
    animation: shake 0.8s ease-in-out;
    background-color: #FECACA;   /* đỏ nhạt hơn khi hover */
  }

  .btn-gradient-neko {
    /* Kích thước & layout */
    width: 100%;
    padding-top: 1.25rem;      /* py-5 */
    padding-bottom: 1.25rem;
    border-radius: 1rem;       /* rounded-2xl */
    font-weight: 800;
    font-size: 1.25rem;
    letter-spacing: 0.5px;
    text-align: center;

    /* Gradient chính xác như Tailwind */
    background: linear-gradient(to right, #ec4899, #a855f7, #ec4899); /* from-pink-500 → via-purple-500 → to-pink-500 */
    color: white;
    border: none;
    cursor: pointer;

    /* Bóng đổ */
    box-shadow: 0 10px 25px -5px rgba(236, 72, 153, 0.4),
                0 20px 40px -12px rgba(168, 85, 247, 0.35);
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);

    /* Hiệu ứng hover */
    &:hover {
      box-shadow: 0 25px 50px -12px rgba(236, 72, 153, 0.5),
                  0 35px 60px -15px rgba(168, 85, 247, 0.45);
      transform: scale(1.05);
    }

    /* Hiệu ứng click */
    &:active {
      transform: scale(0.95);
    }

    /* Hiệu ứng sóng lấp lánh khi hover (cực kỳ kawaii max level) */
    position: relative;
    overflow: hidden;
  }

  .btn-gradient-neko::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.7s;
  }

  .btn-gradient-neko:hover::before {
    left: 100%;
  }

  /* Icon hoặc text bên trong vẫn căn giữa đẹp */
  .btn-gradient-neko > * {
    position: relative;
    z-index: 10;
  }
  
  .halo-glow-neko {
    /* Đè ra ngoài phần tử cha 1px mỗi cạnh → tạo hiệu ứng viền phát sáng */
    position: absolute;
    inset: -1px;                     /* -inset-1 = top:-1px right:-1px bottom:-1px left:-1px */

    /* Gradient siêu rực */
    background: linear-gradient(
      to right,
      #ec4899 0%,      /* from-pink-500 */
      #a855f7 50%,     /* via-purple-500 */
      #06b6d4 100%     /* to-cyan-500 */
    );

    border-radius: 1.5rem;           /* rounded-3xl */
    filter: blur(20px);              /* blur-xl */
    opacity: 0.75;

    /* Hiệu ứng nhấp nháy nhẹ nhàng */
    animation: pulseGlow 3s ease-in-out infinite;
    z-index: -1;                     /* luôn nằm dưới nội dung chính */
  }

  /* Pulse mượt hơn + sáng tối nhịp nhàng */
  @keyframes pulseGlow {
    0%, 100% {
      opacity: 0.65;
      transform: scale(1);
    }
    50% {
      opacity: 0.9;
      transform: scale(1.05);
    }
  }

  /* Khi hover lên phần tử cha → sáng bùng lên luôn! */
  .group:hover .halo-glow-neko {
    opacity: 1;
    filter: blur(24px);
    animation-duration: 1.5s;
  }
    
      `}</style>
    </div>
  );
}
