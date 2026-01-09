// src/components/KanjiN5ListPage.tsx
import { useState, useEffect } from "react";
import { NekoLoading } from "../components/NekoLoading";
import api from "../api/auth";
import toast from "react-hot-toast";

interface KanjiItem {
  stt: string;
  kanji: string;
  hanViet: string;
  meaning: string;
  onYomi: string;
  kunYomi: string;
}

const KANJI_PER_DAY = 10;

export function KanjiN5ListPage({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const [kanjiList, setKanjiList] = useState<KanjiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState(1);

  useEffect(() => {
    let hasToasted = false;
    const fetchKanjiN5 = async () => {
      try {
        const res = await api.get("/kanji/n5");
        if (res.data && Array.isArray(res.data)) {
          if (res.data.length > 0) {
            setKanjiList(res.data);
            //Loading
            await new Promise((resolve) => setTimeout(resolve, 600));
          } else {
            setKanjiList([]);
            if (!hasToasted) {
              hasToasted = true;
              toast("Chưa có Kanji nào. Mèo sẽ sớm cập nhật nhé! 😺", {
                icon: "😺",
                duration: 1000,
              });
            }
          }
        } else {
          setKanjiList([]);
          if (!hasToasted) {
            hasToasted = true;
            toast("Dữ liệu không hợp lệ. Mèo đang kiểm tra lại... 😿", {
              icon: "😿",
            });
          }
        }
      } catch (err: any) {
        console.error("💥 [KANJI N5] Lỗi API:", err);
        if (!hasToasted) {
          hasToasted = true;
          toast.error("Không tải được Kanji N5. Mèo đang sửa đây... 😿");
        }
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 600);
      }
    };

    fetchKanjiN5();
  }, []);

  // Tìm kiếm
  const searchedKanji = kanjiList.filter((k) =>
    searchQuery.trim()
      ? k.kanji.includes(searchQuery) ||
        k.hanViet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.onYomi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.kunYomi.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const totalDays = Math.ceil(searchedKanji.length / KANJI_PER_DAY);
  const currentDayKanji = searchedKanji.slice(
    (selectedDay - 1) * KANJI_PER_DAY,
    selectedDay * KANJI_PER_DAY
  );

  const handleStartFlashcardDay = () => {
    if (currentDayKanji.length === 0) {
      toast("Ngày này chưa có Kanji để học flashcard! 😿");
      return;
    }

    let selected = [...currentDayKanji];
    if (selected.length > 10) {
      selected = selected.sort(() => Math.random() - 0.5).slice(0, 10);
    }

    const flashcardData = selected.map((k) => ({
      japanese: k.kanji,
      kanji: k.kanji,
      vietnamese: k.meaning,
      onYomi: k.onYomi,
      kunYomi: k.kunYomi,
      hanViet: k.hanViet || undefined,
    }));

    localStorage.setItem(
      "nekoFlashcardData",
      JSON.stringify({
        lessonId: `KanjiN5-Day${selectedDay}`,
        lessonTitle: `Kanji N5 - Ngày ${selectedDay}`,
        words: flashcardData,
        originPage: "kanji-n5",
      })
    );

    onNavigate("flashcard");
  };

  if (isLoading) return <NekoLoading message="Mèo đang vẽ Kanji N5..." />;

  return (
    <div className="min-h-screen">
      <main className="relative z-10 mb-12 md:mb-16">
        <h1 className="hero-section-title hero-text-glow text-center">
          Kanji JLPT N5 (~{kanjiList.length} chữ)
        </h1>

        <div className="text-center mb-10">
          <p className="text-white text-3xl mb-4">
            Học theo ngày – 10 Kanji mỗi ngày
          </p>
          <div className="flex-center-group">
            <button
              onClick={() => setSelectedDay((d) => Math.max(1, d - 1))}
              disabled={selectedDay === 1}
              className="btn-primary"
            >
              ← Ngày trước
            </button>
            <span className="btn-secondary">
              Ngày {selectedDay} / {totalDays} ({currentDayKanji.length} Kanji)
            </span>
            <button
              onClick={() => setSelectedDay((d) => Math.min(totalDays, d + 1))}
              disabled={selectedDay === totalDays}
              className="btn-primary"
            >
              Ngày sau →
            </button>
          </div>
        </div>

        <div className="main-container-glass">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gradient-pink-purple">
              <tr>
                <th className="p-6 text-center font-bold">STT</th>
                <th className="p-6 text-center font-bold">Kanji</th>
                <th className="p-6 text-center font-bold">Âm Hán</th>
                <th className="p-6 text-center font-bold">Nghĩa</th>
                <th className="p-6 text-center font-bold">Âm On</th>
                <th className="p-6 text-center font-bold">Âm Kun</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {currentDayKanji.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center text-gray-500 text-2xl"
                  >
                    Không có Kanji nào trong ngày này 😿
                  </td>
                </tr>
              ) : (
                currentDayKanji.map((k) => (
                  <tr key={k.stt} className="list-item-hover">
                    <td className="p-6 text-center font-medium">{k.stt}</td>
                    <td className="p-6 text-center">
                      <span className="text-6xl font-black text-gray-900">
                        {k.kanji}
                      </span>
                    </td>
                    <td className="p-6 text-center text-2xl">
                      {k.hanViet || "-"}
                    </td>
                    <td className="p-6 text-center text-2xl text-gray-800">
                      {k.meaning}
                    </td>
                    <td className="p-6 text-center text-xl text-purple-700">
                      {k.onYomi || "-"}
                    </td>
                    <td className="p-6 text-center text-xl text-blue-700">
                      {k.kunYomi || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MÈO BAY FLASHCARD */}
        <div className="fixed bottom-10 right-10 z-50 hidden lg:block">
          <div
            className="relative group cursor-pointer"
            onClick={handleStartFlashcardDay}
          >
            <div className="tooltip-slide-out">
              <div className="colored-border-label">
                <p className="text-xl font-bold drop-shadow-md">
                  Học flashcard 10 Kanji ngày {selectedDay} nào mèo ơi! 🖌️🐾
                </p>
              </div>
            </div>
            <img
              src="https://i.pinimg.com/1200x/8c/98/00/8c9800bb4841e7daa0a3db5f7db8a4b7.jpg"
              alt="Flying Neko"
              className="responsive-circular-image-hover"
            />
            <div className="circular-gradient-hover-glow"></div>
          </div>
        </div>
      </main>
      <style>{`
      .flex-center-group {
  /* flex */
  display: flex;

  /* justify-center */
  justify-content: center;

  /* items-center */
  align-items: center;

  /* gap-4 (16px) */
  gap: 1rem;

  /* flex-wrap */
  flex-wrap: wrap;

  /* Thêm một chút margin để tách biệt với các khối khác */
  margin: 2rem 0;
}
      .btn-secondary {
  /* text-white */
  color: #ffffff;

  /* text-xl (20px) */
  font-size: 1.25rem;

  /* font-bold */
  font-weight: 700;

  /* bg-black/50 (Nền đen trong suốt 50%) */
  background-color: rgba(0, 0, 0, 0.5);

  /* px-6 py-3 (Ngang 24px, Dọc 12px) */
  padding: 0.75rem 1.5rem;

  /* rounded-full */
  border-radius: 9999px;

  /* Cấu hình cơ bản */
  border: 1px solid rgba(255, 255, 255, 0.1); /* Thêm viền nhẹ để tách nền tốt hơn */
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px); /* Hiệu ứng kính mờ nhẹ cho nền tối */
}

.btn-secondary:hover {
  background-color: rgba(0, 0, 0, 0.7);
  transform: scale(1.05);
}
      .btn-primary {
  /* px-6 py-3 (Ngang 24px, Dọc 12px) */
  padding: 0.75rem 1.5rem;

  /* bg-white/80 */
  background-color: rgba(255, 255, 255, 0.8);

  /* rounded-full */
  border-radius: 9999px;

  /* font-bold */
  font-weight: 700;
  
  /* Cấu hình cơ bản */
  border: none;
  cursor: pointer;
  color: #1e293b; /* Màu chữ tối để tương phản với nền trắng */
  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* transition */
  transition: all 0.3s ease;
}

/* hover:bg-white */
.btn-primary:hover {
  background-color: rgba(255, 255, 255, 1);
  transform: translateY(-2px); /* Thêm hiệu ứng nhấc lên nhẹ cho chuyên nghiệp */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
      .list-item-hover {
  /* border-b border-gray-200 */
  border-bottom: 1px solid #e5e7eb;

  /* transition-colors */
  transition-property: background-color, border-color, color, fill, stroke;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

  /* Đảm bảo con trỏ chuột thay đổi để người dùng biết có thể tương tác */
  cursor: pointer;
}

/* hover:bg-pink-50/70 */
.list-item-hover:hover {
  background-color: rgba(253, 242, 248, 0.7);
}
      .bg-gradient-pink-purple {
  /* bg-gradient-to-r from-pink-500 to-purple-600 */
  background: linear-gradient(to right, #ec4899, #9333ea);
  
  /* text-white */
  color: #ffffff;
}
      .main-container-glass {
  /* max-w-7xl */
  max-width: 80rem; /* 1280px */
  
  /* mx-auto */
  margin-left: auto;
  margin-right: auto;

  /* overflow-x-auto */
  overflow-x: auto;

  /* rounded-2xl */
  border-radius: 1rem;

  /* shadow-2xl */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  /* bg-white/90 + backdrop-blur-md */
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  /* Thêm viền mảnh để định hình khối kính */
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  /* Đảm bảo nội dung không dính sát mép */
  width: 100%;
}

      .circular-gradient-hover-glow {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 9999px;
  background-image: linear-gradient(to right, 
    rgba(244, 114, 182, 0.3), /* Pink-400/30 */
    rgba(168, 85, 247, 0.3)  /* Purple-400/30 */
  );
  opacity: 0;
  transition: opacity 500ms ease-in-out;
  filter: blur(24px); 
}

.group:hover .circular-gradient-hover-glow {
  opacity: 1;
}

      @keyframes fly {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(2deg);
  }
  100% {
    transform: translateY(0) rotate(-1deg);
  }
}

.responsive-circular-image-hover {
  width: 10rem;
  height: 10rem;
  border-radius: 9999px;
  object-fit: cover;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: fly 6s ease-in-out infinite; 
  filter: drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15));
  transform: scale(1) rotate(0deg);
  transition: all 300ms ease-in-out;
  border-width: 4px;
  border-style: solid;
  border-color: #f9a8d4;
}

@media (min-width: 640px) {
  .responsive-circular-image-hover {
    width: 6rem;
    height: 6rem;
  }
}

@media (min-width: 768px) {
  .responsive-circular-image-hover {
    width: 7rem;
    height: 7rem;
  }
}

@media (min-width: 1024px) {
  .responsive-circular-image-hover {
    width: 8rem;
    height: 8rem;
  }
}

@media (min-width: 1280px) {
  .responsive-circular-image-hover {
    width: 9rem;
    height: 9rem;
  }
}

.group:hover .responsive-circular-image-hover {
  transform: scale(1.1) rotate(12deg);
}
      .triangle-down-pink {
  width: 0;
  height: 0;
  border-left-width: 8px;
  border-left-style: solid;
  border-left-color: transparent;
  border-right-width: 8px;
  border-right-style: solid;
  border-right-color: transparent;
  border-top-width: 8px;
  border-top-style: solid;
  border-top-color: #f9a8d4;
}

      .colored-border-label {
  background-color: #ffffff;
  color: #6d28d9;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  white-space: nowrap;
  border-width: 4px;
  border-style: solid;
  border-color: #f9a8d4;
}
      .tooltip-slide-out {
  position: absolute;
  bottom: 100%; 
  margin-bottom: 1rem; 
  right: 0; 
  transform: translateX(2rem); 
  opacity: 0; 
  transition: all 500ms ease-in-out; 
  pointer-events: none;
}

.group:hover .tooltip-slide-out {
  opacity: 1; 
  transform: translateX(0); 
}
      .pulsing-animation {
  /* Khai báo animation: pulse, chu kỳ 2s, lặp vô hạn, timing function default */
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Định nghĩa keyframes cho hiệu ứng pulse */
@keyframes pulse {
  0%, 100% {
    opacity: 1; /* Bắt đầu và kết thúc với độ mờ đầy đủ */
  }
  50% {
    opacity: 0.4; /* Giảm độ mờ xuống 40% ở giữa chu kỳ */
  }
}
      .bold-subheading-style {
  /* text-2xl */
  font-size: 1.5rem; /* 24px */
  line-height: 2rem; /* 32px */
  
  /* font-bold */
  font-weight: 700; 
  
  /* opacity-90 */
  opacity: 0.9; 
  
  /* mt-2 */
  margin-top: 0.5rem; /* 8px */
}
  .responsive-hover-card {
  /* group */
  /* Lớp đánh dấu cho phần tử cha, không có thuộc tính CSS trực tiếp. */
  
  /* relative */
  position: relative;
  
  /* bg-white/80 */
  background-color: rgba(255, 255, 255, 0.8); /* Nền trắng mờ 80% */
  
  /* rounded-[32px] */
  border-radius: 2rem; /* 32px */
  
  /* p-8 */
  padding: 2rem; /* 32px */
  
  /* transition-all duration-500 */
  transition: all 500ms ease-in-out; 
  
  /* overflow-hidden */
  overflow: hidden; 
}

/* hover:scale-105 */
.responsive-hover-card:hover {
  transform: scale(1.05); /* Phóng to 5% khi di chuột */
}
      .pulsing-centered-text {
  /* text-center */
  text-align: center;
  
  /* text-white */
  color: #ffffff;
  
  /* font-bold */
  font-weight: 700;
  
  /* text-xl */
  font-size: 1.25rem; /* 20px */
  line-height: 1.75rem; /* 28px */
  
  /* mb-6 */
  margin-bottom: 1.5rem; /* 24px */
  
  /* animate-pulse */
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Keyframes cho hiệu ứng pulse */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
      .full-screen-gradient-center {
  /* min-h-screen */
  min-height: 100vh; /* Chiều cao tối thiểu bằng chiều cao của viewport */
  
  /* flex */
  display: flex;
  
  /* items-center */
  align-items: center; /* Căn giữa dọc các item con */
  
  /* justify-center */
  justify-content: center; /* Căn giữa ngang các item con */
  
  /* bg-gradient-to-br */
  background-image: linear-gradient(to bottom right, #581c87, #831843);
  /* from-purple-900 (#581c87) */
  /* to-pink-900 (#831843) */
}
      .centered-circle-transition {
  /* rounded-full */
  border-radius: 9999px; 
  
  /* transition-all duration-200 */
  transition: all 200ms ease-in-out; 
  
  /* flex */
  display: flex;
  
  /* items-center */
  align-items: center; /* Căn giữa dọc */
  
  /* justify-center */
  justify-content: center; /* Căn giữa ngang */
}
      .glassmorphism-card {
  /* bg-white */
  background-color: #ffffff;
  /* rounded-[32px] (Ưu tiên giá trị tùy chỉnh này) */
  border-radius: 2rem; /* 32px */
  
  /* p-8 */
  padding: 2rem; /* 32px */
  
  /* border-2 */
  border-width: 2px;
  
  /* border-white/40 */
  border-color: rgba(255, 255, 255, 0.4); 
  
  /* transition-all duration-400 */
  transition: all 400ms ease-in-out; 
  
  /* shadow-xl */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

/* Các hiệu ứng hover */
.glassmorphism-card:hover {
  /* hover:border-pink-400 */
  border-color: #f472b6; 
  
  /* hover:bg-white/80 */
  background-color: rgba(255, 255, 255, 0.80); 
  
  /* hover:scale-105 */
  transform: scale(1.05);
}
      .small-white-rainbow-glow {
  /* text-lg */
  font-size: 1.125rem; /* 18px */
  line-height: 1.75rem; /* 28px */
  
  /* text-white */
  color: #ffffff; 
  
  /* mt-2 */
  margin-top: 0.5rem; /* 8px */
  
  /* text-glow-rainbow (CSS Tùy chỉnh: Hiệu ứng phát sáng cầu vồng rực rỡ) */
  /* Sử dụng text-shadow để tạo hiệu ứng glow */
  text-shadow: 
    /* Lớp bóng mờ trắng làm nền để chữ sáng hơn */
    0 0 3px rgba(255, 255, 255, 0.9),
    /* Các lớp bóng mờ màu neon chính */
    0 0 8px rgba(255, 0, 150, 0.9),  /* Hồng đậm (Fuschia) */
    0 0 12px rgba(147, 51, 234, 0.9),  /* Tím (Violet) */
    0 0 16px rgba(6, 182, 212, 0.9);   /* Xanh ngọc (Cyan) */
}
      .white-rainbow-glow-bold {
  /* text-3xl */
  font-size: 1.875rem; /* 30px */
  line-height: 2.25rem; /* 36px */
  
  /* font-bold */
  font-weight: 700; 
  
  /* text-white */
  color: #ffffff; 
  
  /* text-glow-rainbow (CSS Tùy chỉnh: Hiệu ứng phát sáng cầu vồng rực rỡ) */
  /* Tập trung vào các lớp bóng mờ màu neon để làm nổi bật chữ trắng */
  text-shadow: 
    /* Lớp bóng mờ trắng nhẹ làm nền */
    0 0 4px rgba(255, 255, 255, 0.8),
    /* Các lớp bóng mờ màu neon chính */
    0 0 10px rgba(255, 0, 150, 0.9),  /* Hồng đậm (Fuschia) */
    0 0 15px rgba(147, 51, 234, 0.9),  /* Tím (Violet) */
    0 0 20px rgba(6, 182, 212, 0.9);   /* Xanh ngọc (Cyan) */
    
  /* drop-shadow-lg bị loại bỏ do không phù hợp với hiệu ứng glow của chữ trắng */
  filter: none; /* Đảm bảo không có drop-shadow */
}
      
      .small-rainbow-glow {
  /* text-2xl */
  font-size: 1.5rem; /* 24px */
  line-height: 2rem; /* 32px */
  
  /* text-white */
  color: #ffffff; 
  
  /* mt-1 */
  margin-top: 0.25rem; /* 4px */
  
  /* text-glow-rainbow (CSS Tùy chỉnh: Hiệu ứng phát sáng cầu vồng rực rỡ) */
  /* Sử dụng text-shadow để tạo hiệu ứng glow */
  text-shadow: 
    /* Lớp bóng mờ trắng làm nền */
    0 0 2px rgba(255, 255, 255, 0.8),
    /* Các lớp bóng mờ màu neon */
    0 0 5px rgba(255, 0, 150, 0.9),  /* Hồng đậm (Fuschia) */
    0 0 8px rgba(147, 51, 234, 0.9),  /* Tím (Violet) */
    0 0 12px rgba(6, 182, 212, 0.9);   /* Xanh ngọc (Cyan) */
}
      .rainbow-glow-title {
  /* text-4xl */
  font-size: 2.25rem; /* 36px */
  line-height: 2.5rem; /* 40px */
  
  /* font-black */
  font-weight: 900; 
  
  /* text-white */
  color: #ffffff; /* Giữ nguyên màu chữ trắng */
  
  /* text-glow-rainbow (CSS Tùy chỉnh: Hiệu ứng phát sáng cầu vồng rực rỡ) */
  /* Sử dụng text-shadow để tạo hiệu ứng glow, không dùng filter: drop-shadow */
  text-shadow: 
    /* Lớp bóng mờ trắng làm nền */
    0 0 4px rgba(255, 255, 255, 0.8),
    /* Các lớp bóng mờ màu neon */
    0 0 10px rgba(255, 0, 150, 0.9),  /* Hồng đậm (Fuschia) */
    0 0 15px rgba(147, 51, 234, 0.9),  /* Tím (Violet) */
    0 0 20px rgba(6, 182, 212, 0.9);   /* Xanh ngọc (Cyan) */
    
    /* Có thể thêm các màu khác nếu muốn đầy đủ dải cầu vồng */
}
      .full-gradient-hover-effect {
  /* absolute */
  position: absolute;
  
  /* inset-0 */
  top: 0;
  right: 0;
  bottom: 0;
  left: 0; /* Bao phủ hoàn toàn phần tử cha */
  
  /* rounded-2xl */
  border-radius: 1rem; /* 16px */
  
  /* bg-linear-to-r from-pink-500 via-purple-500 to-cyan-500 */
  background: linear-gradient(to right, #ec4899, #a855f7, #06b6d4);
  
  /* opacity-0 */
  opacity: 0;
  
  /* blur-xl */
  filter: blur(20px); 
  
  /* transition-opacity duration-500 */
  transition: opacity 500ms ease-in-out;
  
  /* -z-10 */
  z-index: -10; /* Đặt lớp này ra phía sau nội dung chính */
}

/* group-hover:opacity-100 (Áp dụng khi di chuột qua phần tử cha có class 'group') */
.group:hover .full-gradient-hover-effect {
  opacity: 1;
}
      .glass-card-hover-effect {
  /* relative */
  position: relative;
  
  /* bg-white/80 */
  background-color: rgba(255, 255, 255, 0.8); /* Nền trắng mờ 80% */
  
  /* border */
  border-width: 1px; 
  
  /* border-white/30 */
  border-color: rgba(255, 255, 255, 0.3); 
  
  /* rounded-2xl */
  border-radius: 1rem; /* 16px */
  
  /* p-6 */
  padding: 1.5rem; /* 24px */
  
  /* transition-all duration-400 */
  transition: all 400ms ease-in-out; 
  
  /* shadow-xl */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); 
}

/* hover:border-pink-400, hover:bg-white/20, hover:scale-[1.02], hover:shadow-2xl, hover:shadow-pink-500/30 */
.glass-card-hover-effect:hover {
  /* hover:border-pink-400 */
  border-color: #f472b6; 
  
  /* hover:bg-white/20 */
  background-color: rgba(255, 255, 255, 0.2); 
  
  /* hover:scale-[1.02] */
  transform: scale(1.02);
  
  /* hover:shadow-2xl (Kết hợp với shadow màu hồng) */
  box-shadow: 
    /* shadow-2xl */
    0 25px 50px -12px rgba(0, 0, 0, 0.25), 
    /* hover:shadow-pink-500/30 */
    0 0 15px rgba(236, 72, 153, 0.3); /* Giá trị gần đúng cho shadow màu hồng */
}
      .transparent-search-input {
  /* w-full */
  width: 100%;
  
  /* py-8 */
  padding-top: 2rem;    /* 32px */
  padding-bottom: 2rem; /* 32px */
  
  /* pl-28 */
  padding-left: 7rem;   /* 112px */
  
  /* pr-10 */
  padding-right: 2.5rem; /* 40px */
  
  /* text-3xl */
  font-size: 1.875rem; /* 30px */
  line-height: 2.25rem; /* 36px */
  
  /* font-black */
  font-weight: 900; 
  
  /* text-white */
  color: #ffffff; 
  
  /* bg-transparent */
  background-color: transparent; 
  
  /* text-center */
  text-align: center; 
}

/* focus:outline-none */
.transparent-search-input:focus {
  outline: 0; /* Loại bỏ viền focus mặc định của trình duyệt */
}

/* placeholder:text-white/70 và placeholder:font-bold */
.transparent-search-input::placeholder {
  color: rgba(255, 255, 255, 0.7); /* Màu trắng mờ 70% */
  font-weight: 700; /* In đậm */
}
      .element-overlay-positioned {
  /* absolute */
  position: absolute;
  
  /* left-8 */
  left: 2rem; /* 32px */
  
  /* top-1/2 */
  top: 50%;
  
  /* -translate-y-1/2 */
  transform: translateY(-50%); /* Căn giữa dọc */
  
  /* pointer-events-none */
  pointer-events: none; /* NGĂN CHẶN tương tác chuột/chạm */
  
  /* z-20 */
  z-index: 20; 
}
      .icon-centered-left {
  /* absolute */
  position: absolute;
  
  /* left-8 */
  left: 2rem; /* 32px */
  
  /* top-1/2 */
  top: 50%;
  
  /* -translate-y-1/2 */
  transform: translateY(-50%); /* Dùng để căn giữa dọc (Vertical centering) */
  
  /* w-12 */
  width: 3rem; /* 48px */
  
  /* h-12 */
  height: 3rem; /* 48px */
  
  /* text-white */
  color: #ffffff;
  
  /* z-20 */
  z-index: 20; 
  
  /* drop-shadow-neon (CSS Tùy chỉnh gần đúng cho hiệu ứng neon) */
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 10px #f472b6);
  /* Hoặc sử dụng text-shadow nếu đây là icon dạng chữ: */
  /* text-shadow: 0 0 5px #fff, 0 0 10px #f472b6; */
}
      .glass-effect-container {
  /* relative */
  position: relative;
  
  /* bg-black/50 */
  background-color: rgba(0, 0, 0, 0.5); /* Nền đen mờ 50% */
  
  /* backdrop-blur-2xl */
  backdrop-filter: blur(40px); /* Hiệu ứng làm mờ nền phía sau */
  
  /* rounded-full */
  border-radius: 9999px; 
  
  /* border-4 */
  border-width: 4px; 
  
  /* border-white/40 */
  border-color: rgba(255, 255, 255, 0.4); /* Viền trắng mờ 40% */
  
  /* shadow-2xl */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); /* Bóng lớn */
  
  /* ring-8 ring-white/10 (Tạo hiệu ứng "ring" bằng box-shadow inset hoặc outline/viền thứ hai) */
  /* Sử dụng box-shadow để mô phỏng hiệu ứng ring */
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25), /* Shadow-2xl */
    0 0 0 8px rgba(255, 255, 255, 0.1); /* Ring 8px, màu trắng 10% */

  /* overflow-hidden */
  overflow: hidden; 
}

/* LƯU Ý QUAN TRỌNG VỀ backdrop-filter:
Để đảm bảo backdrop-filter hoạt động, phần tử này phải có độ trong suốt (opacity < 1) hoặc màu nền sử dụng rgba() (như bg-black/50 đã làm).
*/
      .pulsing-gradient-aura {
  /* absolute */
  position: absolute;
  
  /* -inset-3 */
  top: -0.75rem;    /* -12px */
  bottom: -0.75rem; /* -12px */
  left: -0.75rem;   /* -12px */
  right: -0.75rem;  /* -12px */
  
  /* rounded-full */
  border-radius: 9999px; 
  
  /* bg-linear-to-r from-pink-400 via-purple-500 to-cyan-400 */
  background: linear-gradient(to right, #f472b6, #8b5cf6, #22d3ee);
  
  /* blur-xl */
  filter: blur(24px); 
  
  /* opacity-60 */
  opacity: 0.6;
  
  /* z-index */
  z-index: -1; /* Đảm bảo hiệu ứng nằm dưới nội dung chính */
  
  /* transition (để chuyển đổi opacity mượt mà) */
  transition: opacity 150ms ease-in-out;
  
  /* animate-border-spin */
  animation: border-spin 3s linear infinite; 
  
  /* delay-75 */
  animation-delay: 75ms; 
}

/* group-focus-within:opacity-90 (Sử dụng selector lồng nhau) */
/* Áp dụng cho phần tử mẹ có class 'group' và bên trong nó có phần tử đang focus */
.group:focus-within .pulsing-gradient-aura {
  opacity: 0.9;
}

/* Keyframes cho hiệu ứng border-spin (giả định) */
@keyframes border-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
      .gradient-border-effect {
  /* absolute */
  position: absolute;
  
  /* -inset-1.5 */
  top: -0.375rem;    /* -6px */
  bottom: -0.375rem; /* -6px */
  left: -0.375rem;   /* -6px */
  right: -0.375rem;  /* -6px */
  
  /* rounded-full */
  border-radius: 9999px; 
  
  /* bg-linear-to-r from-pink-500 via-purple-600 to-cyan-500 */
  background: linear-gradient(to right, #ec4899, #9333ea, #06b6d4);
  
  /* opacity-90 */
  opacity: 0.9;
  
  /* animate-border-spin (CSS Tùy chỉnh: Tạo keyframes và áp dụng) */
  animation: border-spin 3s linear infinite; 
  z-index: -1; /* Thường được dùng để đặt lớp này dưới nội dung chính */
}

/* group-focus-within:opacity-100 (Sử dụng selector lồng nhau) */
/* Áp dụng cho phần tử mẹ có class 'group' và bên trong nó có phần tử đang focus */
.group:focus-within .gradient-border-effect,
.gradient-border-effect:focus { /* Chỉ sử dụng focus trực tiếp nếu không phải group */
  opacity: 1;
}

/* Keyframes cho hiệu ứng border-spin (giả định) */
@keyframes border-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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

      .circular-icon-button {
  /* p-4 */
  padding: 1rem; /* 16px */
  
  /* rounded-full */
  border-radius: 9999px; 
  
  /* bg-white/30 */
  background-color: rgba(255, 255, 255, 0.3); 
  
  /* transition và transform */
  transition: all 150ms ease-in-out; /* Giá trị mặc định cho transition */
}

/* md:p-5 */
@media (min-width: 768px) {
  .circular-icon-button {
    padding: 1.25rem; /* 20px */
  }
}

/* hover:bg-pink-200, hover:scale-105 */
.circular-icon-button:hover {
  background-color: #fecaca; /* pink-200 */
  transform: scale(1.05);
}

/* disabled:opacity-50 */
.circular-icon-button:disabled {
  opacity: 0.5;
}
      .button-icon-effect {
  /* bg-white/90 */
  background-color: rgba(255, 255, 255, 0.9);
  
  /* w-6 */
  width: 1.5rem; /* 24px */
  
  /* h-6 */
  height: 1.5rem; /* 24px */
  
  /* transition (Thêm vào để hiệu ứng scale mượt mà) */
  transition: transform 150ms ease-in-out; 
}

/* md:w-8 và md:h-8 */
@media (min-width: 768px) {
  .button-icon-effect {
    width: 2rem; /* 32px */
    height: 2rem; /* 32px */
  }
}

/* hover:scale-110 */
.button-icon-effect:hover {
  transform: scale(1.1);
}
      .custom-element {
  /* bg-pink-400 */
  background-color: #f472b6; 
  
  /* text-white */
  color: #ffffff; 
  
  /* px-4 */
  padding-left: 1rem;  /* 16px */
  padding-right: 1rem; /* 16px */
  
  /* h-10 */
  height: 2.5rem; /* 40px */
  
  /* font-bold */
  font-weight: 700; 
  
  /* shadow-lg */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1); 
}

/* md:h-12 */
@media (min-width: 768px) {
  .custom-element {
    height: 3rem; /* 48px */
  }
}

      .custom-button {
  /* p-4 */
  padding: 1rem; 
  
  /* rounded-full */
  border-radius: 9999px; 
  
  /* bg-white/30 */
  background-color: rgba(255, 255, 255, 0.3); 
  
  /* transition */
  transition: all 150ms ease-in-out; /* Giá trị mặc định cho transition */
  
  /* transform */
  /* Chỉ là một lớp đánh dấu, không thêm thuộc tính CSS riêng biệt */
}
  .button {
  /* px-8 py-4 -> padding: 1rem top/bottom, 2rem left/right */
  padding: 1rem 2rem;
  /* bg-white */
  background-color: #ffffff;
  /* backdrop-blur-xl approximation */
  backdrop-filter: blur(8px);
  /* rounded-full */
  border-radius: 9999px;
  /* text-black font-bold */
  color: #000000;
  font-weight: 700;
  /* smooth hover */
  transition: background-color 150ms ease, transform 150ms ease;
}
.button:hover {
  /* hover:bg-white/60 */
  background-color: rgba(255,255,255,0.6);
}

/* md:p-5 */
@media (min-width: 768px) {
  .custom-button {
    padding: 1.25rem;
  }
}

/* hover:bg-pink-200, hover:scale-105 */
.custom-button:hover {
  background-color: #fecaca; /* pink-200 */
  transform: scale(1.05);
}

/* disabled:opacity-50 */
.custom-button:disabled {
  opacity: 0.5;
  /* Thêm disabled:pointer-events-none nếu bạn muốn chặn click */
}
      @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
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
  `}</style>
    </div>
  );
}
