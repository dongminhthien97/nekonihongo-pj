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
interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

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
    {
      id: "logout",
      label: "Thoát",
      icon: LogOut,
      itemId: "nav-logout",
      isLogout: true, // Đánh dấu để xử lý riêng
    },
  ];
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (confirm("Thoát ra thật hả mèo ơi?")) {
      logout(); // → tự động reload → về LoginPage
    }
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
                      ? "bg-gradient-to-r from-[#FFC7EA] to-[#D8C8FF] text-red-600 shadow-lg scale-105"
                      : "text-red-600 hover:bg-gradient-to-r hover:from-[#FFC7EA]/20 hover:to-[#D8C8FF]/20"
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
      `}</style>
    </nav>
  );
}
