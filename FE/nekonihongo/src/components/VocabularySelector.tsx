// src/components/VocabularySelector.tsx
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Background } from "./Background";

interface VocabType {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradientFrom: string;
  gradientTo: string;
}

const vocabTypes: VocabType[] = [
  {
    id: "minna",
    title: "Minna no Nihongo",
    subtitle: "Giáo trình chuẩn Nhật Bản",
    description: "Học theo bài có cấu trúc rõ ràng, phù hợp người mới bắt đầu",
    icon: "📚",
    gradientFrom: "from-pink-500",
    gradientTo: "to-purple-600",
  },
  {
    id: "n5",
    title: "JLPT N5",
    subtitle: "~800 từ vựng chuẩn thi",
    description: "Học theo ngày, flashcard thông minh, dễ đạt chứng chỉ",
    icon: "🎯",
    gradientFrom: "from-cyan-500",
    gradientTo: "to-blue-600",
  },
];

export function VocabularySelector({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const handleSelect = (typeId: string) => {
    if (typeId === "minna") {
      onNavigate("vocabulary");
    } else if (typeId === "n5") {
      onNavigate("vocabulary-n5");
    }
  };

  return (
    <div className="min-h-screen relative">
      <Navigation currentPage="vocabulary" onNavigate={onNavigate} />
      <Background />

      <main className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        {/* Tiêu đề fade in đầu tiên */}
        <div className="text-center mb-16 md:mb-24 animate-fade-in">
          <h1 className="hero-section-title hero-text-glow">
            Chọn lộ trình học
          </h1>
          <p className="text-xl md:text-3xl text-white/90 font-medium max-w-4xl mx-auto">
            Mèo đã chuẩn bị sẵn 2 phong cách học siêu hay cho bạn rồi đấy! 🐾
          </p>
        </div>

        {/* Cards chọn loại – fade in lần lượt với delay */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {vocabTypes.map((type, index) => (
            <button
              key={type.id}
              onClick={() => handleSelect(type.id)}
              className={`group relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-6 animate-fade-in-delay`}
              style={{ animationDelay: `${0.3 + index * 0.2}s` }} // Card đầu 0.3s, card sau 0.5s
            >
              {/* Gradient nền khi hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${type.gradientFrom} ${type.gradientTo} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
              />

              {/* Ánh sáng blur khi hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-700">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/30 rounded-full blur-3xl -translate-x-48 -translate-y-48" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/30 rounded-full blur-3xl translate-x-48 translate-y-48" />
              </div>

              {/* Nội dung */}
              <div className="relative z-10 p-10 md:p-16 text-center">
                <div className="text-8xl md:text-9xl mb-8 transform group-hover:scale-110 transition-transform duration-500">
                  {type.icon}
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
                  {type.title}
                </h2>

                <p className="text-xl md:text-2xl text-white/90 font-semibold mb-6">
                  {type.subtitle}
                </p>

                <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-md mx-auto mb-10">
                  {type.description}
                </p>

                <div className="inline-flex items-center gap-4 text-white text-xl md:text-2xl font-bold">
                  <span>Bấm để bắt đầu</span>
                  <span className="text-4xl transform group-hover:translate-x-6 transition-transform duration-500">
                    →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer text – fade in cuối cùng */}
        <div
          className="text-center mt-20 md:mt-32 animate-fade-in-delay"
          style={{ animationDelay: "0.8s" }}
        >
          <p className="text-2xl md:text-3xl text-white/90 font-medium mb-6">
            Dù bạn chọn lộ trình nào, mèo cũng sẽ đồng hành cùng bạn đến cùng
            nhé! 💕
          </p>
          <div className="text-6xl md:text-8xl animate-bounce">🐾</div>
        </div>
      </main>

      <Footer />

      {/* CSS cho fade-in animation */}
      <style>{`
            .hero-section-title {
  /* relative */
  position: relative;
  
  /* block */
  display: block; 
  
  /* p-x (padding-left và padding-right) */
  padding-left: 2.5rem;  /* 40px */
  padding-right: 2.5rem; /* 40px */
  
  /* p-y (padding-top và padding-bottom) */
  padding-top: 2rem;    /* 32px */
  padding-bottom: 2rem; /* 32px */
  
  /* font-black */
  font-weight: 900; 
  
  /* tracking-wider */
  letter-spacing: 0.05em; 
  
  /* text-white */
  color: #ffffff; 
  
  /* drop-shadow-2xl (Giá trị gần đúng, có thể phức tạp hơn) */
  filter: drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15)) drop-shadow(0 10px 10px rgba(0, 0, 0, 0.04));
  
  /* -translate-y-3 */
  transform: translateY(-0.75rem); /* -12px */
  
  /* text-6xl (Giá trị mặc định cho text-6xl) */
  font-size: 3.75rem; /* 60px */
  line-height: 1; 
  
  /* hero-text-glow (CSS Tùy chỉnh gần đúng cho hiệu ứng glow) */
  text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #f687b3; /* Ánh sáng trắng và hồng nhạt */
  
  /* animate-pulse-soft (CSS Tùy chỉnh: Tạo keyframes và áp dụng) */
  animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Kích thước text cho màn hình nhỏ (sm:text-6xl) */
/* Cùng giá trị mặc định, không cần media query */

/* Thiết lập cho màn hình trung bình (md) - min-width: 768px */
@media (min-width: 768px) {
  .hero-section-title {
    /* md:px-14 */
    padding-left: 3.5rem;  /* 56px */
    padding-right: 3.5rem; /* 56px */
    
    /* md:py-10 */
    padding-top: 2.5rem;    /* 40px */
    padding-bottom: 2.5rem; /* 40px */
    
    /* md:text-7xl */
    font-size: 4.5rem; /* 72px */
    line-height: 1;
    
    /* md:-translate-y-4 */
    transform: translateY(-1rem); /* -16px */
  }
}

/* Thiết lập cho màn hình lớn (lg) - min-width: 1024px */
@media (min-width: 1024px) {
  .hero-section-title {
    /* lg:px-20 */
    padding-left: 5rem;  /* 80px */
    padding-right: 5rem; /* 80px */
    
    /* lg:py-12 */
    padding-top: 3rem;    /* 48px */
    padding-bottom: 3rem; /* 48px */
    
    /* lg:text-10xl (Không có trong Tailwind mặc định, tôi dùng 9xl + 1/2) */
    font-size: 8rem; /* 128px */ 
    line-height: 1;
    
    /* lg:-translate-y-5 */
    transform: translateY(-1.25rem); /* -20px */
  }
}

/* Keyframes cho hiệu ứng pulse-soft (giả định) */
@keyframes pulse-soft {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
}
      .circular-shadow-button {
  /* p-4 */
  padding: 1rem; /* 16px */
  
  /* rounded-full */
  border-radius: 9999px; 
  
  /* bg-white/80 */
  background-color: rgba(255, 255, 255, 0.8); 
  
  /* transition */
  transition: all 150ms ease-in-out; 
}

/* hover:bg-pink-200 */
.circular-shadow-button:hover {
  background-color: #fecaca; /* pink-200 */
}

/* disabled:opacity-50 */
.circular-shadow-button:disabled {
  opacity: 0.5;
}
             .hero-text-glow {
    text-shadow: 
      0 0 20px #FF69B4,
      0 0 40px #A020F0,
      0 0 60px #00FFFF,
      0 0 80px #FF69B4,
      0 0 100px #A020F0,
      0 4px 20px rgba(0,0,0,0.9);
    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.8));

     @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }    
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
              .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
                  @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }

        .animate-fade-in-delay {
          opacity: 0;
          animation: fadeIn 1.2s ease-out forwards;
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 10s ease infinite;
        }
      `}</style>
    </div>
  );
}
