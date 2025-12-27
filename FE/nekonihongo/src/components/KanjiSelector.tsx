// src/components/KanjiSelector.tsx
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Background } from "./Background";
import toast from "react-hot-toast";

const kanjiTypes = [
  {
    id: "minna",
    title: "Minna no Nihongo",
    subtitle: "Kanji theo giáo trình chuẩn",
    description: "Học Kanji theo bài Minna – có nét viết, ví dụ, từ ghép",
    icon: "📖",
    status: "available",
  },
  {
    id: "jlpt-n5",
    title: "JLPT N5",
    subtitle: "~100 Kanji cơ bản",
    description: "Danh sách Kanji chính thức cho kỳ thi JLPT N5",
    icon: "🎯",
    status: "available",
  },
  {
    id: "jlpt-n4",
    title: "JLPT N4",
    subtitle: "~200 Kanji",
    description: "Sắp ra mắt – mèo đang chuẩn bị rất kỹ đây!",
    icon: "🔜",
    status: "coming-soon",
  },
  {
    id: "jlpt-n3",
    title: "JLPT N3",
    subtitle: "~400 Kanji",
    description: "Sắp ra mắt",
    icon: "⏳",
    status: "coming-soon",
  },
  {
    id: "jlpt-n2",
    title: "JLPT N2",
    subtitle: "~1000 Kanji",
    description: "Sắp ra mắt",
    icon: "🚀",
    status: "coming-soon",
  },
];

export function KanjiSelector({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const handleSelect = (id: string) => {
    if (id === "minna") {
      onNavigate("kanji"); // Trang KanjiPage hiện có (Minna)
    } else if (id === "jlpt-n5") {
      onNavigate("kanji-n5"); // Trang list JLPT N5
    } else {
      toast("Kanji JLPT cấp này sẽ sớm ra mắt nhé! Mèo đang vẽ nét đây 🖌️😺", {
        icon: "⏳",
        duration: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen relative">
      <Navigation currentPage="kanji" onNavigate={onNavigate} />
      <Background />

      <main className="relative z-10 container mx-auto px-4 py-16 md:py-24 animate-fade-in">
        <div className="text-center mb-16 md:mb-24">
          <h1 className="hero-section-title hero-text-glow">
            Chọn lộ trình học Kanji
          </h1>
          <p className="lead-text">
            Mèo đã chuẩn bị sẵn các cách học Kanji siêu hay cho bạn rồi đây! 🐾
          </p>
        </div>

        <div className="grid-container">
          {kanjiTypes.map((type, index) => (
            <button
              key={type.id}
              onClick={() => handleSelect(type.id)}
              disabled={type.status === "coming-soon"}
              className={`glass-card group relative overflow-hidden ${
                type.status === "coming-soon"
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
              style={{ animationDelay: `${0.3 + index * 0.2}s` }}
            >
              <div
                className={`gradient-overlay bg-gradient-to-br ${
                  type.id === "minna"
                    ? "from-green-400 to-teal-500"
                    : type.id === "jlpt-n5"
                    ? "from-indigo-400 to-purple-500"
                    : "from-gray-400 to-gray-600"
                }`}
              />
              <div className="subtle-overlay">
                <div className="glow-orb orb-top" />
                <div className="glow-orb orb-bottom" />
              </div>

              <div className="relative z-10 p-10 md:p-16 text-center">
                <div className="hero-text group-hover:scale-110 transition-transform duration-500">
                  {type.icon}
                </div>
                <h2 className="card-title">{type.title}</h2>
                <p className="card-subtitle">{type.subtitle}</p>
                <p className="card-description">{type.description}</p>
                <div className="flex-container mt-8">
                  <span>
                    {type.status === "available"
                      ? "Bấm để học"
                      : "Sắp ra mắt..."}
                  </span>
                  <span className="moving-icon">→</span>
                </div>

                {type.status === "coming-soon" && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                    <p className="text-3xl font-bold text-white animate-pulse">
                      Coming Soon ✨
                    </p>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div
          className="footer-container text-center"
          style={{ animationDelay: "0.8s" }}
        >
          <p className="accent-text">
            Học Kanji cùng mèo – nhớ lâu, viết đẹp, dùng chuẩn! Mèo tin bạn làm
            được 💪🖌️
          </p>
          <div className="bouncing-icon">🐾</div>
        </div>
      </main>

      <Footer />
      <style>{`
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
      .grid-container {
  /* max-w-6xl (1152px) */
  max-width: 72rem;
  
  /* mx-auto (Căn giữa toàn bộ lưới) */
  margin-left: auto;
  margin-right: auto;

  /* grid grid-cols-1 */
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));

  /* gap-12 (48px) */
  gap: 3rem;
  
  padding: 1rem; /* Padding nhỏ để không bị dính sát mép màn hình điện thoại */
}

/* lg:grid-cols-3 & lg:gap-20 (Màn hình từ 1024px trở lên) */
@media (min-width: 1024px) {
  .grid-container {
    /* Chia làm 3 cột bằng nhau */
    grid-template-columns: repeat(2, minmax(0, 1fr));
    
    /* gap-20 (80px) */
    gap: 5rem;
  }
}
      .lead-text {
  /* text-xl (20px) */
  font-size: 1.25rem;
  line-height: 1.75rem;

  /* text-white/90 */
  color: rgba(255, 255, 255, 0.9);

  /* font-medium */
  font-weight: 500;

  /* max-w-4xl (896px) */
  max-width: 56rem;

  /* mx-auto (Căn giữa khối văn bản) */
  margin-left: auto;
  margin-right: auto;

  /* Căn giữa nội dung chữ */
  text-align: center;
}

/* md:text-3xl (Màn hình từ 768px trở lên - 30px) */
@media (min-width: 768px) {
  .lead-text {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }
}
      .bouncing-icon {
  /* text-6xl (60px) */
  font-size: 3.75rem;
  line-height: 1;

  /* Cấu hình để animation hoạt động tốt */
  display: inline-block;

  /* animate-bounce */
  animation: bounce 1s infinite;
}

/* md:text-8xl (Màn hình từ 768px trở lên - 96px) */
@media (min-width: 768px) {
  .bouncing-icon {
    font-size: 6rem;
  }
}

/* Định nghĩa Keyframes cho animate-bounce (Chuẩn Tailwind) */
@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
      .accent-text {
  /* text-2xl (24px) */
  font-size: 1.5rem;
  line-height: 2rem;

  /* text-white/90 (Độ trong suốt 90%) */
  color: rgba(255, 255, 255, 0.9);

  /* font-medium */
  font-weight: 500;

  /* mb-6 (24px) */
  margin-bottom: 1.5rem;
}

/* md:text-3xl (Màn hình từ 768px trở lên - 30px) */
@media (min-width: 768px) {
  .accent-text {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }
}

/* md:mt-32 (Màn hình từ 768px trở lên - 128px) */
@media (min-width: 768px) {
  .footer-container {
    margin-top: 8rem;
  }
}

      .moving-icon {
  /* text-4xl */
  font-size: 2.25rem; /* 36px */
  line-height: 2.5rem;

  /* Cấu hình để transform hoạt động */
  display: inline-block;

  /* transition-transform duration-500 */
  transition: transform 0.5s ease;
  will-change: transform;
}

/* group-hover:translate-x-6 */
/* Khi di chuột vào .glass-card (group), icon dịch sang phải 1.5rem (24px) */
.glass-card:hover .moving-icon {
  transform: translateX(1.5rem);
}
      .flex-container {
  /* inline-flex items-center gap-4 */
  display: inline-flex;
  align-items: center;
  gap: 1rem; /* 4 * 4px = 16px */

  /* text-white text-xl font-bold */
  color: #ffffff;
  font-size: 1.25rem; /* 20px */
  font-weight: 700;
  
  /* Đảm bảo căn chỉnh mượt mà */
  vertical-align: middle;
}

/* md:text-2xl (Màn hình từ 768px trở lên) */
@media (min-width: 768px) {
  .flex-container {
    font-size: 1.5rem; /* 24px */
  }
}
      .card-description {
  /* text-lg (18px) */
  font-size: 1.125rem;
  
  /* text-white */
  color: #ffffff;
  
  /* leading-relaxed (line-height: 1.625) */
  line-height: 1.625;
  
  /* max-w-md (448px) */
  max-width: 28rem;
  
  /* mx-auto (Căn giữa theo chiều ngang) */
  margin-left: auto;
  margin-right: auto;
  
  /* mb-10 (10 * 4px = 40px) */
  margin-bottom: 2.5rem;
  
  /* Đảm bảo chữ trông mịn hơn trên nền tối */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* md:text-xl (Màn hình từ 768px trở lên - 20px) */
@media (min-width: 768px) {
  .card-description {
    font-size: 1.25rem;
  }
}
      .card-subtitle {
  /* text-xl (20px) */
  font-size: 1.25rem;
  line-height: 1.75rem;

  /* text-white */
  color: #ffffff;

  /* font-semibold */
  font-weight: 600;

  /* mb-6 (6 * 4px = 24px) */
  margin-bottom: 1.5rem;
}

/* md:text-2xl (Màn hình từ 768px trở lên - 24px) */
@media (min-width: 768px) {
  .card-subtitle {
    font-size: 1.5rem;
    line-height: 2rem;
  }
}
      .card-title {
  /* text-4xl */
  font-size: 2.25rem; /* 36px */
  line-height: 2.5rem;
  
  /* font-black */
  font-weight: 900;
  
  /* text-white */
  color: #ffffff;
  
  /* mb-4 (4 * 4px) */
  margin-bottom: 1rem;
  
  /* drop-shadow-lg */
  filter: drop-shadow(0 10px 8px rgba(0, 0, 0, 0.04)) 
          drop-shadow(0 4px 3px rgba(0, 0, 0, 0.1));
}

/* md:text-5xl (Màn hình từ 768px trở lên) */
@media (min-width: 768px) {
  .card-title {
    font-size: 3rem; /* 48px */
    line-height: 1;
  }
}
      .hero-text {
  /* text-8xl */
  font-size: 6rem; /* 96px */
  line-height: 1;
  margin-bottom: 2rem; /* mb-8 (8 * 4px = 32px) */
  
  /* Cấu hình để transform hoạt động mượt mà */
  display: inline-block; 
  transition: transform 0.5s ease; /* duration-500 */
  will-change: transform; /* Tối ưu hiệu năng cho trình duyệt */
}

/* md:text-9xl (Dành cho màn hình từ 768px trở lên) */
@media (min-width: 768px) {
  .hero-text {
    font-size: 8rem; /* 128px */
  }
}

/* group-hover:scale-110 */
/* Khi di chuột vào .glass-card thì .hero-text sẽ phóng to */
.glass-card:hover .hero-text {
  transform: scale(1.1);
}
      /* Class dùng chung cho cả 2 vầng sáng */
.glow-orb {
  position: absolute;
  width: 24rem; /* w-96 */
  height: 24rem; /* h-96 */
  background-color: rgba(255, 255, 255, 0.3); /* bg-white/30 */
  border-radius: 50%; /* rounded-full */
  filter: blur(64px); /* blur-3xl */
  pointer-events: none;
  z-index: 0;
}

/* Vị trí góc trên trái */
.orb-top {
  top: 0;
  left: 0;
  transform: translate(-50%, -50%);
}

/* Vị trí góc dưới phải (Mã bạn vừa gửi) */
.orb-bottom {
  bottom: 0;
  right: 0;
  /* translate-x-48 translate-y-48 = dịch chuyển ra ngoài 50% */
  transform: translate(50%, 50%);
}
      .subtle-overlay {
  /* absolute inset-0 */
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  /* Giả sử bạn muốn phủ màu trắng hoặc màu chủ đạo của thương hiệu */
  background-color: white; 

  /* opacity-0 và transition-opacity duration-700 */
  opacity: 0;
  transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  
  pointer-events: none; /* Đảm bảo lớp này không ngăn cản việc click vào nội dung */
}

/* group-hover:opacity-40 */
.glass-card:hover .subtle-overlay {
  opacity: 0.4;
}
      .gradient-overlay {
  /* absolute inset-0 */
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  /* bg-gradient-to-br (Ví dụ: từ xanh sang tím) */
  background: linear-gradient(to bottom right, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2));

  /* opacity-0 + transition-opacity duration-700 */
  opacity: 0;
  transition: opacity 0.7s ease;
  z-index: 0; /* Đảm bảo nằm dưới nội dung */
}

/* group-hover:opacity-100 */
.glass-card:hover .gradient-overlay {
  opacity: 1;
}

/* Đảm bảo nội dung luôn hiển thị trên lớp gradient */
.content {
  position: relative;
  z-index: 1;
}
      .glass-card {
  /* Cấu trúc cơ bản */
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem; /* rounded-3xl */
  
  /* Hiệu ứng Glassmorphism */
  background-color: rgba(255, 255, 255, 0.1); /* bg-white/10 */
  backdrop-filter: blur(24px); /* backdrop-blur-xl */
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.2); /* border-white/20 */
  
  /* Đổ bóng và Chuyển cảnh */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); /* shadow-2xl */
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1); /* duration-700 */
  
  /* Animation khi load trang */
  animation: fadeIn 0.8s ease-out forwards;
}

/* Hiệu ứng Hover (Hover state) */
.glass-card:hover {
  transform: scale(1.05) translateY(-24px); /* hover:scale-105 hover:-translate-y-6 */
  box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.6); /* hover:shadow-3xl */
}

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
