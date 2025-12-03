import {
  Home,
  BookOpen,
  FileText,
  Languages,
  CreditCard,
  Dumbbell,
  LogOut,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { User } from "lucide-react";

export function Navigation({
  currentPage,
  onNavigate,
}: {
  currentPage: string;
  onNavigate: (page: string) => void;
}) {
  const navItems = [
    { id: "landing", label: "Trang chủ", icon: Home },
    { id: "vocabulary", label: "Từ vựng", icon: Languages },
    { id: "grammar", label: "Ngữ pháp", icon: BookOpen },
    { id: "kanji", label: "Kanji", icon: FileText },
    { id: "flashcard", label: "Flashcard", icon: CreditCard },
    { id: "exercise", label: "Bài tập", icon: Dumbbell },
    { id: "mypage", label: "MyPage", icon: User },
    {
      id: "logout",
      label: "Thoát",
      icon: LogOut,
      itemId: "nav-logout",
      isLogout: true,
    },
  ];
  const { user, logout } = useAuth();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout(); // → hàm logout thật của bạn (xóa token, redirect về login, v.v.)
  };

  if (!user) return null;
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-[#FFC7EA]/20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-4 group"
            style={{ cursor: "pointer" }}
          >
            <ImageWithFallback
              src="https://ih1.redbubble.net/image.5481873298.3314/st,small,507x507-pad,600x600,f8f8f8.jpg"
              alt="Neko Nihongo"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                objectFit: "cover",
                boxShadow: "0 10px 25px -5px rgba(236, 72, 153, 0.5)",
                border: "4px solid rgba(255, 255, 255, 0.9)",
                transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
              className="group-hover:scale-125 group-hover:-rotate-6 group-hover:shadow-pink-500/60"
            />

            <span
              className="hidden sm:block text-2xl font-extrabold"
              style={{
                background:
                  "linear-gradient(to right, #F472B6, #C084FC, #A78BFA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Neko Nihongo
            </span>
          </button>

          {/* Desktop Navigation – ĐÃ THÊM NÚT THOÁT */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              const isLogout = item.isLogout;

              return (
                <button
                  key={item.id}
                  onClick={() =>
                    isLogout ? handleLogout() : onNavigate(item.id)
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-[16px] transition-all duration-300 ${
                    isLogout
                      ? "text-black shadow-lg hover:shadow-red-500/60 scale-105"
                      : isActive
                      ? "bg-linear-to-r from-[#FFC7EA] to-[#D8C8FF] text-red-600 shadow-lg scale-105"
                      : "text-red-600 hover:bg-linear-to-r hover:from-[#FFC7EA]/20 hover:to-[#D8C8FF]/20"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isLogout
                        ? "group-hover:rotate-180 transition duration-500"
                        : ""
                    }`}
                  />
                  <span
                    className={`text-sm font-bold transition-all duration-300
${
  item.isLogout
    ? "text-red-600 drop-shadow-md group-hover:text-red-400 group-hover:drop-shadow-xl"
    : "text-gray-800"
}`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mobile Navigation – ĐÃ THÊM NÚT THOÁT */}
          <div className="flex md:hidden items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              const isLogout = item.isLogout;

              return (
                <button
                  key={item.id}
                  onClick={() =>
                    isLogout ? handleLogout() : onNavigate(item.id)
                  }
                  className={`p-2 rounded-[12px] transition-all duration-300 ${
                    isLogout
                      ? "hover text-red-600 shadow-lg scale-110"
                      : isActive
                      ? "hover text-black shadow-lg scale-110"
                      : "text-gray-600 hover:bg-[#FFC7EA]/20"
                  }`}
                  title={item.label}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isLogout
                        ? "group-hover:rotate-180 transition duration-500"
                        : ""
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }

        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }
          /* TEXT ĐỎ RỰC GLOBAL CHO NÚT LOGOUT – SIÊU MẠNH, SIÊU ĐỎ, SIÊU DỄ SỢ */
.text-red-600 {
  --tw-text-opacity: 1;
  color: rgb(220 38 38 / var(--tw-text-opacity));
  font-weight: 900 !important;
  text-shadow: 0 2px 6px rgba(220, 38, 38, 0.5) !important;
  letter-spacing: 0.8px !important;
}

/* Hover → đỏ sáng + phát sáng neon */
.text-red-600:hover {
  color: #ef4444 !important;
  text-shadow: 
    0 0 12px rgba(239, 68, 68, 0.9),
    0 4px 12px rgba(239, 68, 68, 0.6) !important;
  transform: translateY(-1px);
  transition: all 0.3s ease !important;
}

/* Đảm bảo chữ "Thoát" luôn đỏ rực dù có class gì đi nữa */
#nav-logout span,
button[title="Thoát"] span,
button:has(svg[data-icon="log-out"]) span,
span:where(.text-red-600) {
  @apply text-red-600 !important;
  
}
  .btn-stay-neko {
    padding: 1.25rem 2rem;               /* py-5 */
    border-radius: 1rem;                 /* rounded-2xl */
    font-weight: 700;                    /* font-bold */
    font-size: 1.25rem;                  /* text-xl */
    color: #7e22ce;                      /* text-purple-700 */
    
    /* Gradient nền */
    background: linear-gradient(to right, #e9d5ff, #fbcfe8); /* from-purple-100 → to-pink-100 */
    
    box-shadow: 0 10px 25px -5px rgba(168, 34, 222, 0.3),
                0 20px 40px -12px rgba(236, 72, 153, 0.25);
    
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    border: none;
    position: relative;
    overflow: hidden;
  }

  /* Hover – đậm màu hơn + phóng to */
  .btn-stay-neko:hover {
    background: linear-gradient(to right, #ddd6fe, #f9a8d4); /* hover:from-purple-200 → hover:to-pink-200 */
    transform: scale(1.05);
    box-shadow: 0 20px 40px -10px rgba(168, 34, 222, 0.4),
                0 30px 60px -15px rgba(236, 72, 153, 0.35);
  }

  /* Khi nhấn – bẹp xuống tí */
  .btn-stay-neko:active {
    transform: scale(0.95);
  }

  /* Hiệu ứng sóng lấp lánh khi hover – siêu kawaii */
  .btn-stay-neko::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transition: left 0.7s;
  }

  .btn-stay-neko:hover::before {
    left: 100%;
  }
    .btn-logout-danger-neko {
    padding: 1.25rem 2rem;                    /* py-5 */
    border-radius: 1rem;                      /* rounded-2xl */
    font-weight: 800;                         /* font-bold + mạnh hơn tí */
    font-size: 1.25rem;                       /* text-xl */
    color: white;
    text-shadow: 0 2px 8px rgba(0,0,0,0.3);

    /* Gradient đỏ → hồng đậm */
    background: linear-gradient(to right, #ef4444, #ec4899); /* from-red-500 → to-pink-600 */

    box-shadow: 
      0 15px 35px -5px rgba(239, 68, 68, 0.5),
      0 25px 50px -12px rgba(236, 72, 153, 0.4);

    border: none;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* HOVER – đỏ hơn, đậm hơn, to hơn */
  .btn-logout-danger-neko:hover {
    background: linear-gradient(to right, #dc2626, #db2777); /* from-red-600 → to-pink-700 */
    transform: scale(1.05);
    box-shadow: 
      0 25px 50px -10px rgba(239, 68, 68, 0.6),
      0 35px 70px -15px rgba(236, 72, 153, 0.5);
  }

  /* KHI NHẤN – bẹp xuống + rung nhẹ */
  .btn-logout-danger-neko:active {
    transform: scale(0.95);
  }

  /* SÓNG LẤP LÁNH SIÊU SANG – chạy ngang khi hover */
  */
  .btn-logout-danger-neko::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transition: left 0.8s;
  }

  .btn-logout-danger-neko:hover::before {
    left: 100%;
  }

  /* Hiệu ứng rung nhẹ khi hover (thêm drama) */
  .btn-logout-danger-neko:hover {
    animation: microShake 0.5s ease-in-out;
  }

  @keyframes microShake {
    0%, 100% { transform: translateX(0) scale(1.05); }
    25%      { transform: translateX(-4px) scale(1.05); }
     }
    .title-logout-neko {
    font-size: 2.25rem;                    /* text-4xl */
    line-height: 1.2;
    font-weight: 900;                      /* font-black */
    text-align: center;
    margin-bottom: 1rem;                   /* mb-4 */

    /* Gradient hồng → tím đậm */
    background: linear-gradient(to right, #ec4899, #a855f7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    /* Thêm phát sáng + bóng chữ cho nổi bần bật */
    text-shadow: 
      0 4px 15px rgba(236, 72, 153, 0.4),
      0 8px 25px rgba(168, 85, 247, 0.3);

    /* Hiệu ứng nhẹ khi modal hiện */
    animation: titleGlow 3s ease-in-out infinite alternate;
  }

  @keyframes titleGlow {
    from {
      text-shadow: 
        0 4px 15px rgba(236, 72, 153, 0.4),
        0 8px 25px rgba(168, 85, 247, 0.3);
    }
    to {
      text-shadow: 
        0 4px 25px rgba(236, 72, 153, 0.6),
        0 10px 40px rgba(168, 85, 247, 0.5);
    }
  }

  /* Mobile nhỏ hơn tí cho đẹp */
  @media (max-width: 480px) {
    .title-logout-neko {
      font-size: 2rem;
    }
  }
    .modal-card-neko {
    position: relative;
    background: rgba(255, 255, 255, 0.80);       /* bg-white/80 */
    backdrop-filter: blur(24px);                 /* backdrop-blur-xl */
    -webkit-backdrop-filter: blur(24px);
    border-radius: 32px;                         /* rounded-[32px] */
    
    /* Bóng đổ siêu to */
    box-shadow: 
      0 25px 50px -12px rgba(236, 72, 153, 0.35),
      0 35px 70px -15px rgba(168, 85, 247, 0.25),
      0 0 80px rgba(236, 72, 153, 0.15);

    padding: 2rem;                               /* p-8 */
  }

  @media (min-width: 640px) {
    .modal-card-neko {
      padding: 2.5rem 3rem;                      /* sm:p-10 */
    }
  }

  /* Viền hồng phấn + viền phát sáng tím */
  .modal-card-neko {
    border: 4px solid rgba(236, 146, 255, 0.60);  /* border-pink-300/60 */
    outline: 4px solid rgba(182, 146, 255, 0.20); /* ring-4 ring-purple-300/20 */
    outline-offset: 4px;
  }

  /* Hiệu ứng slide-up mượt như bơ */
  .modal-card-neko {
    animation: slideUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    transform: translateY(60px);
    opacity: 0;
  }

  @keyframes slideUp {
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Bonus: hover nhẹ → nổi lên tí cho sang */
  .modal-card-neko:hover {
    transform: translateY(-6px);
    box-shadow: 
      0 35px 70px -10px rgba(236, 72, 153, 0.45),
      0 45px 90px -20px rgba(168, 85, 247, 0.35);
    transition: all 0.5s ease;
  }
      `}</style>
      {/* MODAL LOGOUT – ĐÃ FIX HOÀN HẢO, LUÔN Ở GIỮA MÀN HÌNH 100% */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center px-4">
          {/* Overlay mờ + click để tắt */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setIsLogoutModalOpen(false)}
          />

          {/* Modal chính – ĐÃ ĐƯỢC CĂN CHÍNH XÁC GIỮA */}
          <div className="relative w-full max-w-md">
            {/* Thêm div này để tạo khoảng cách với navbar và căn giữa hoàn hảo */}
            <div className="my-20 sm:my-0">
              <div className="modal-card-neko">
                {/* Mèo khóc huhu */}
                <div className="text-9xl text-center mb-6 drop-shadow-lg"></div>

                <h3 className="title-logout-neko">Thoát hả em?</h3>

                <p className="text-center text-red-600 mb-10 text-lg font-medium leading-relaxed">
                  Are you sure??
                </p>

                <div className="grid grid-cols-2 gap-5">
                  <button
                    onClick={() => setIsLogoutModalOpen(false)}
                    className="btn-stay-neko"
                  >
                    Học thêm tí nữa
                  </button>

                  <button
                    onClick={confirmLogout}
                    className="btn-logout-danger-neko"
                  >
                    Mệt qué nghỉ thoai
                  </button>
                </div>

                {/* Mèo nhỏ góc */}
                <div className="absolute -top-10 -right-10 text-8xl animate-wiggle-1 opacity-90"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
