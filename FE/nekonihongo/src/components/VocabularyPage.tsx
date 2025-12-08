// VocabularyPage.tsx
import { useState, useMemo } from "react";
import { Search, Volume2, ChevronLeft, ChevronRight } from "lucide-react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Background } from "./Background";
import {
  vocabularyLessons,
  type Lesson,
  type Word,
} from "../data/vocabularyLessons";
interface VocabularyPageProps {
  onNavigate: (page: string) => void;
}

export function VocabularyPage({ onNavigate }: VocabularyPageProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lessonPage, setLessonPage] = useState(1);
  const [wordPage, setWordPage] = useState(1);
  const LESSONS_PER_PAGE = 12;
  const WORDS_PER_PAGE = 12;

  // Tìm kiếm
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: { word: Word; lessonId: number }[] = [];
    vocabularyLessons.forEach((lesson) => {
      lesson.words.forEach((word) => {
        if (
          word.japanese.includes(query) ||
          word.kanji.toLowerCase().includes(query) ||
          word.vietnamese.toLowerCase().includes(query)
        ) {
          results.push({ word, lessonId: lesson.id });
        }
      });
    });
    return results.slice(0, 20);
  }, [searchQuery]);

  // Phân trang bài học
  const totalLessonPages = Math.ceil(
    vocabularyLessons.length / LESSONS_PER_PAGE
  );
  const currentLessons = vocabularyLessons.slice(
    (lessonPage - 1) * LESSONS_PER_PAGE,
    lessonPage * LESSONS_PER_PAGE
  );

  // Phân trang từ vựng trong bài
  const currentWords = selectedLesson
    ? selectedLesson.words.slice(
        (wordPage - 1) * WORDS_PER_PAGE,
        wordPage * WORDS_PER_PAGE
      )
    : [];
  const totalWordPages = selectedLesson
    ? Math.ceil(selectedLesson.words.length / WORDS_PER_PAGE)
    : 0;

  return (
    <div className="min-h-screen">
      <Navigation currentPage="vocabulary" onNavigate={onNavigate} />
      <Background />

      <main className="relative z-10 container mx-auto px-4 py-12">
        {/* Header + Search */}
        <div className="text-center mb-12">
          <h1 className="relative z-10 mb-12 md:mb-16">
            {/* KHUNG ĐEN MỜ + VIỀN NEON + TRONG SUỐT CÓ THỂ ĐIỀU CHỈNH */}
            <div className="absolute inset-0 -z-10 rounded-3xl" />
            {/* CHỮ CHÍNH – ĐEN ĐẬM + GLOW TRẮNG */}
            <span className="hero-section-title">Từ Vựng Tiếng Nhật</span>
          </h1>
          {/* THANH TÌM KIẾM SIÊU ĐỈNH – VIỀN NỔI BẬT + TEXT CĂN GIỮA */}
          <div className="max-w-4xl mx-auto">
            <div className="relative group ">
              {/* VIỀN NEON CHẠY VÒNG QUANH – SIÊU SÁNG, SIÊU ĐẸP */}
              <div className="gradient-border-effect" />

              {/* VIỀN NEON THỨ 2 – TĂNG ĐỘ DÀY + SÁNG */}
              <div className="pulsing-gradient-aura" />

              {/* Thanh input chính – nền trắng mờ, viền sáng, bóng đẹp */}
              <div className="glass-effect-container">
                {/* ICON TÌM KIẾM SIÊU NỔI */}
                <div className="absolute left-8 top-1/2 -translate-y-1/2 pointer-events-none z-20">
                  <Search
                    className="absolute left-8 top-1/2 -translate-y-1/2 
                         w-12 h-12 text-white drop-shadow-neon 
                          z-20"
                    strokeWidth={5}
                  />
                </div>

                {/* INPUT – TEXT CĂN GIỮA HOÀN HẢO */}
                <input
                  type="text"
                  placeholder="Tìm từ vựng... (猫, neko, mèo, bài 10...)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedLesson(null);
                  }}
                  className="
          w-full py-8 pl-28 pr-10 
          text-3xl font-black text-white 
          bg-transparent text-center 
          placeholder:text-white/70 
          placeholder:font-bold 
          focus:outline-none 
        "
                />
              </div>
            </div>
            {/* Kết quả tìm kiếm – CARD SIÊU TO */}
            {searchResults.length > 0 && (
              <div className="mt-10 max-w-4xl mx-auto space-y-4">
                <p className="text-center text-white font-bold text-xl mb-6 animate-pulse">
                  Tìm thấy {searchResults.length} kết quả
                </p>
                {searchResults.map(({ word, lessonId }, idx) => (
                  <div
                    key={idx}
                    className="group relative bg-white/80 backdrop-blur-xl 
                   border border-white/30 hover:border-pink-400 
                   rounded-2xl p-6 
                   hover:bg-white/20 hover:scale-[1.02] 
                   transition-all duration-400 
                   shadow-xl hover:shadow-2xl hover:shadow-pink-500/30"
                  >
                    <div
                      className="absolute inset-0 rounded-2xl bg-linear-to-r from-pink-500 via-purple-500 to-cyan-500 
                        opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10"
                    />
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1 text-left">
                        <p className="text-4xl font-black text-black drop-shadow-2xl text-glow-rainbow">
                          {word.japanese}
                        </p>
                        <p className="text-xl text-cyan-300 mt-1 text-glow-rainbow ">
                          {word.kanji}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-black drop-shadow-lg text-glow-rainbow ">
                          {word.vietnamese}
                        </p>
                        <p className="text-lg text-pink-300 mt-2 text-glow-rainbow ">
                          Bài {lessonId}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Danh sách bài học hoặc từ vựng */}
        {!selectedLesson ? (
          <>
            {/* Danh sách bài học + phân trang */}
            <div className="max-w-7xl mx-auto ">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-4 gap-8 mb-16 animate-fade-in">
                {currentLessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setWordPage(1);
                      setSearchQuery("");
                    }}
                    className="group relative bg-white/80 rounded-[32px] p-8 hover:scale-105 transition-all duration-500 overflow-hidden"
                  >
                    <div
                      className="text-4xl animate-pulse-soft"
                      style={{
                        textShadow: `
                          0 4px 10px rgba(255, 255, 255, 0.8),
                          0 0 20px rgba(255, 255, 255, 0.9),
                          0 0 40px rgba(255, 255, 255, 0.7),
                          0 0 60px rgba(255, 255, 255, 0.5)
                        `,
                      }}
                    >
                      {lesson.icon}
                    </div>
                    <div className="text-center py-6">
                      <p className="hero-text-glow text-white text-2xl">
                        Bài {lesson.id}
                      </p>
                      <p className="hero-text-glow text-white mt-2 px-4 line-clamp-2">
                        {lesson.title}
                      </p>
                    </div>
                  </button>
                  // </div>
                ))}
              </div>

              {/* Phân trang bài học */}
              <div className="flex justify-center items-center gap-8 mt-12">
                <button
                  onClick={() => setLessonPage((p) => Math.max(1, p - 1))}
                  disabled={lessonPage === 1}
                  className="circular-shadow-button"
                >
                  <ChevronLeft className="w-10 h-10 self-center " />
                </button>
                <span className="text-2xl hero-text-glow text-white font-bold">
                  Trang {lessonPage} / {totalLessonPages}
                </span>
                <button
                  onClick={() =>
                    setLessonPage((p) => Math.min(totalLessonPages, p + 1))
                  }
                  disabled={lessonPage === totalLessonPages}
                  className="circular-shadow-button"
                >
                  <ChevronRight className="w-10 h-10 self-center" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Trong bài học – từ vựng + phân trang */
          <div className="max-w-7xl mx-auto">
            <div className="flex  items-center justify-right mb-10">
              <div className="w-full  flex flex-col items-center gap-4">
                <h2 className=" text-3xl hero-text-glow text-white">
                  {selectedLesson.icon} {selectedLesson.title}
                </h2>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="button"
                  style={{
                    textShadow: `0 4px 10px rgba(0, 0, 0, 0.8),
        0 0 20px rgba(0, 0, 0, 0.9),
        0 0 40px rgba(0, 0, 0, 0.7),
        0 0 60px rgba(0, 0, 0, 0.5)
      `,
                  }}
                >
                  ← Tất cả bài học
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-4">
              {currentWords.map((word, idx) => (
                <div
                  key={idx}
                  className="bg-white backdrop-blur-xl rounded-3xl p-8 border-2 border-white/40 hover:border-pink-400 hover:bg-white/25 hover:scale-105 transition-all duration-400 shadow-xl rounded-[32px]"
                >
                  <div className="text-center space-y-4">
                    <p className="text-5xl font-black text-black">
                      {word.japanese}
                    </p>
                    <p className="text-4xl text-cyan-200">{word.kanji}</p>
                    <p className="text-3xl text-black font-medium">
                      {word.vietnamese}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Phân trang từ vựng */}
            {totalWordPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-16">
                <button
                  onClick={() => setWordPage((p) => Math.max(1, p - 1))}
                  disabled={wordPage === 1}
                  className="custom-button"
                  aria-label="Previous words page"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <div className="flex gap-3 items-center">
                  {Array.from({ length: totalWordPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setWordPage(i + 1)}
                      aria-label={`Go to page ${i + 1}`}
                      className={`rounded-full transition-all duration-200 flex items-center justify-center ${
                        wordPage === i + 1
                          ? "custom-element"
                          : ".button-icon-effect"
                      }`}
                    >
                      {wordPage === i + 1 ? i + 1 : ""}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() =>
                    setWordPage((p) => Math.min(totalWordPages, p + 1))
                  }
                  disabled={wordPage === totalWordPages}
                  className="circular-icon-button"
                  aria-label="Next words page"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      <div className="fixed bottom-10 right-10 pointer-events-none z-50 hidden lg:block">
        <img
          src="https://i.pinimg.com/1200x/8c/98/00/8c9800bb4841e7daa0a3db5f7db8a4b7.jpg"
          alt="Flying Neko"
          className="w-40 h-40 
               sm:w-24 sm:h-24 
               md:w-28 md:h-28 
               lg:w-32 lg:h-32 
               xl:w-36 xl:h-36 
               rounded-full object-cover 
               shadow-2xl 
               animate-fly 
               drop-shadow-2xl"
          style={{
            filter: "drop-shadow(0 10px 20px rgba(255, 182, 233, 0.4))",
          }}
        />
      </div>

      <Footer />

      <style>{`
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
