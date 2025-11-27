import { Home, BookOpen, FileText, Languages, CreditCard } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const navItems = [
    { id: "landing", label: "Trang chủ", icon: Home },
    { id: "vocabulary", label: "Từ vựng", icon: Languages },
    { id: "grammar", label: "Ngữ pháp", icon: BookOpen },
    { id: "kanji", label: "Kanji", icon: FileText },
    { id: "flashcard", label: "Flashcard", icon: CreditCard },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-[#FFC7EA]/20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
<button
  onClick={() => onNavigate("landing")}
  className="flex items-center gap-4 group"
  style={{ cursor: 'pointer' }}
>
  <ImageWithFallback
    src="https://ih1.redbubble.net/image.5481873298.3314/st,small,507x507-pad,600x600,f8f8f8.jpg"
    alt="Neko Nihongo"
    style={{
      width: '56px',
      height: '56px',
      borderRadius: '16px',
      objectFit: 'cover',
      boxShadow: '0 10px 25px -5px rgba(236, 72, 153, 0.5)',
      border: '4px solid rgba(255, 255, 255, 0.9)',
      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', 
    }}
    className="group-hover:scale-125 group-hover:-rotate-6 group-hover:shadow-pink-500/60"
  />

  <span
    className="hidden sm:block text-2xl font-extrabold"
    style={{
      background: 'linear-gradient(to right, #F472B6, #C084FC, #A78BFA)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}
  >
    Neko Nihongo
  </span>
</button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-[16px] transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-[#FFC7EA] to-[#D8C8FF] text-white shadow-lg scale-105"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-[#FFC7EA]/20 hover:to-[#D8C8FF]/20"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`p-2 rounded-[12px] transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-[#FFC7EA] to-[#D8C8FF] text-white shadow-lg scale-110"
                      : "text-gray-600 hover:bg-[#FFC7EA]/20"
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
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
      `}</style>
    </nav>
  );
}
