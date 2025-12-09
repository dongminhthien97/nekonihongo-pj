import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { grammarLessons } from "../data/grammarLessons";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Background } from "./Background";

const LESSONS_PER_PAGE = 5;
const GRAMMAR_PER_PAGE = 10;
const WORDS_PER_PAGE = 10;

export function GrammarPage({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [lessonPage, setLessonPage] = useState(1);
  const [grammarPage, setGrammarPage] = useState(1);
  const [wordPage, setWordPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const totalLessonPages = Math.ceil(grammarLessons.length / LESSONS_PER_PAGE);
  const currentLessons = grammarLessons.slice(
    (lessonPage - 1) * LESSONS_PER_PAGE,
    lessonPage * LESSONS_PER_PAGE
  );

  const currentLessonData = selectedLesson
    ? grammarLessons.find((l) => l.id === selectedLesson)
    : null;

  const paginatedGrammar =
    currentLessonData?.grammar.slice(
      (grammarPage - 1) * GRAMMAR_PER_PAGE,
      grammarPage * GRAMMAR_PER_PAGE
    ) || [];

  const paginatedWords =
    currentLessonData?.vocabulary.slice(
      (wordPage - 1) * WORDS_PER_PAGE,
      wordPage * WORDS_PER_PAGE
    ) || [];

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return grammarLessons.flatMap((lesson) =>
      lesson.vocabulary
        .filter(
          (w) =>
            w.japanese.includes(query) ||
            w.romaji.toLowerCase().includes(query) ||
            w.vietnamese.toLowerCase().includes(query)
        )
        .map((word) => ({ word, lessonId: lesson.id }))
    );
  }, [searchQuery]);

  return (
    <div className="subtle-gradient-background-relative">
      <Background />
      <Navigation currentPage="grammar" onNavigate={onNavigate} />

      <main className="container mx-auto px-4 py-12 relative z-10">
        {/* Tiêu đề */}
        <div className="text-center mb-12">
          <h1 className="hero-title-style hero-text-glow">
            Ngữ Pháp Tiếng Nhật
          </h1>
          <p className="pulsing-hero-caption">Học cùng mèo siêu dễ thương!</p>
        </div>

        {/* Danh sách 25 bài học */}
        {!selectedLesson && !searchQuery && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-12 ">
              {currentLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setSelectedLesson(lesson.id);
                    setGrammarPage(1);
                    setWordPage(1);
                  }}
                  className="interactive-blur-card"
                >
                  <div className="text-4xl animate-pulse-soft">
                    {lesson.icon}
                  </div>
                  <div className="text-center">
                    <p className="hero-text-glow text-white text-2xl">
                      Bài {lesson.id}
                    </p>
                    <p className="hero-text-glow text-white mt-2 px-4 line-clamp-2">
                      {lesson.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Phân trang bài học (tương tự VocabularyPage) */}
            {totalLessonPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-12">
                <button
                  onClick={() => setLessonPage((p) => Math.max(1, p - 1))}
                  disabled={lessonPage === 1}
                  className="custom-button"
                  aria-label="Previous lessons page"
                >
                  <ChevronLeft className="w-6 h-6 text-black" />
                </button>

                <div className="flex gap-3 items-center">
                  {Array.from({ length: totalLessonPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setLessonPage(i + 1)}
                      aria-label={`Go to lesson page ${i + 1}`}
                      className={`rounded-full transition-all duration-200 flex items-center justify-center ${
                        lessonPage === i + 1
                          ? "custom-element"
                          : "button-icon-effect"
                      }`}
                    >
                      {lessonPage === i + 1 ? i + 1 : ""}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setLessonPage((p) => Math.min(totalLessonPages, p + 1))
                  }
                  disabled={lessonPage === totalLessonPages}
                  className="circular-icon-button"
                  aria-label="Next lessons page"
                >
                  <ChevronRight className="w-6 h-6 text-black" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Nội dung bài học đã chọn */}
        {selectedLesson && currentLessonData && (
          <div className="max-w-7xl mx-auto">
            <div className="w-full flex flex-col items-center gap-4">
              <button
                onClick={() => setSelectedLesson(null)}
                className="glass-pill-button"
                style={{
                  textShadow: `
        0 4px 10px rgba(0, 0, 0, 0.8),
        0 0 20px rgba(0, 0, 0, 0.9),
        0 0 40px rgba(0, 0, 0, 0.7),
        0 0 60px rgba(0, 0, 0, 0.5)
      `,
                }}
              >
                ← Tất cả bài học
              </button>
            </div>
            <h1
              className="text-5xl font-black text-center mb-12 text-white"
              style={{
                textShadow: `
        0 4px 10px rgba(0, 0, 0, 0.8),
        0 0 20px rgba(0, 0, 0, 0.9),
        0 0 40px rgba(0, 0, 0, 0.7),
        0 0 60px rgba(0, 0, 0, 0.5)
      `,
              }}
            >
              Bài {selectedLesson}: {currentLessonData.title}
            </h1>

            {/* Ngữ pháp */}
            <div className="mb-16">
              <h3
                className="text-4xl font-bold text-white mb-8 text-center"
                style={{
                  textShadow: `
        0 4px 10px rgba(0, 0, 0, 0.8),
        0 0 20px rgba(0, 0, 0, 0.9),
        0 0 40px rgba(0, 0, 0, 0.7),
        0 0 60px rgba(0, 0, 0, 0.5)
      `,
                }}
              >
                Ngữ pháp
              </h3>
              {/* CHIA 2 CỘT – MỖI CỘT 1 NGỮ PHÁP – ĐẸP NHƯ SÁCH GIÁO KHOA NHẬT BẢN */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {paginatedGrammar.map((g, i) => (
                  <div key={i} className="glassmorphism-hover-card">
                    {/* Icon mèo dễ thương + tiêu đề */}
                    <div className="flex items-center gap-4 mb-6">
                      <h4 className="large-purple-heading">{g.title}</h4>
                    </div>

                    {/* Cấu trúc */}
                    <div className="subtle-gradient-panel">
                      <p className="pink-bold-label">CẤU TRÚC</p>
                      <p className="large-bold-text">{g.structure}</p>
                    </div>

                    {/* Ý nghĩa */}
                    <div className="subtle-gradient-panel-cyan">
                      <p className="pink-bold-label">Ý NGHĨA</p>
                      <p className="large-bold-text">{g.meaning}</p>
                    </div>

                    {/* Ví dụ – đẹp như flashcard */}
                    <div className="space-y-5">
                      <p className="flex-heading-style">
                        <span>Ví dụ</span>
                        <span className="text-2xl">😺</span>
                      </p>
                      {g.examples.map((ex, j) => (
                        <div key={j} className="interactive-white-card">
                          <p className="section-title-style">{ex.japanese}</p>
                          <p className="flex-text-style">
                            <span className="text-2xl">😺</span>
                            <span className="font-medium">{ex.vietnamese}</span>
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Trang trí nhỏ xinh */}
                    <div className="footer-flex-bar">
                      <span className="text-3xl animate-wiggle">😺</span>
                      <span className="text-3xl">😺</span>
                      <span className="text-3xl animate-wiggle">😺</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Phân trang ngữ pháp (đồng bộ style) */}
              {currentLessonData.grammar.length > GRAMMAR_PER_PAGE && (
                <div className="flex justify-center items-center gap-6 mt-16">
                  <button
                    onClick={() => setGrammarPage((p) => Math.max(1, p - 1))}
                    disabled={grammarPage === 1}
                    className="custom-button"
                    aria-label="Previous grammar page"
                  >
                    <ChevronLeft className="w-6 h-6 text-black" />
                  </button>

                  <div className="flex gap-3 items-center">
                    {Array.from(
                      {
                        length: Math.ceil(
                          currentLessonData.grammar.length / GRAMMAR_PER_PAGE
                        ),
                      },
                      (_, i) => (
                        <button
                          key={i}
                          onClick={() => setGrammarPage(i + 1)}
                          aria-label={`Go to grammar page ${i + 1}`}
                          className={`rounded-full transition-all duration-200 flex items-center justify-center ${
                            grammarPage === i + 1
                              ? "custom-element"
                              : "button-icon-effect"
                          }`}
                        >
                          {grammarPage === i + 1 ? i + 1 : ""}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setGrammarPage((p) =>
                        Math.min(
                          p + 1,
                          Math.ceil(
                            currentLessonData.grammar.length / GRAMMAR_PER_PAGE
                          )
                        )
                      )
                    }
                    disabled={
                      grammarPage * GRAMMAR_PER_PAGE >=
                      currentLessonData.grammar.length
                    }
                    className="circular-icon-button"
                    aria-label="Next grammar page"
                  >
                    <ChevronRight className="w-6 h-6 text-black" />
                  </button>
                </div>
              )}
            </div>
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
      .footer-flex-bar {
  /* flex */
  display: flex;
  
  /* justify-center */
  justify-content: center; /* Căn giữa ngang các item con */
  
  /* gap-4 */
  gap: 1rem; /* 16px - Khoảng cách giữa các item con */
  
  /* mt-8 */
  margin-top: 2rem; /* 32px - Margin trên */
  
  /* pt-4 */
  padding-top: 1rem; /* 16px - Padding trên */
  
  /* border-t border-purple-100 */
  border-top-width: 1px;
  border-top-style: solid;
  border-top-color: #f3e8ff; /* Purple-100 */
}
      .flex-text-style {
  /* text-xl */
  font-size: 1.25rem; /* 20px */
  line-height: 1.75rem; /* 28px */
  
  /* text-gray-600 */
  color: #4b5563; 
  
  /* flex */
  display: flex;
  
  /* items-center */
  align-items: center; /* Căn giữa dọc các item con (ví dụ: text và icon) */
  
  /* gap-3 */
  gap: 0.75rem; /* 12px - Khoảng cách giữa các item con */
}
      .section-title-style {
  /* text-3xl */
  font-size: 1.875rem; /* 30px */
  
  /* font-black */
  font-weight: 900; 
  
  /* text-gray-800 */
  color: #1f2937; 
  
  /* mb-3 */
  margin-bottom: 0.75rem; /* 12px */
  
  /* leading-relaxed */
  line-height: 1.625; /* Khoảng cách dòng rộng rãi */
}
      .interactive-white-card {
  /* bg-white */
  background-color: #ffffff;
  
  /* rounded-2xl */
  border-radius: 1rem; /* 16px */
  
  /* p-6 */
  padding: 1.5rem; /* 24px */
  
  /* shadow-lg */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1); 
  
  /* border-2 border-pink-200 */
  border-width: 2px;
  border-style: solid;
  border-color: #fbcfe8; /* Pink-200 */
  
  /* transition-all duration-300 */
  transition: all 300ms ease-in-out; 
}

/* Các hiệu ứng hover */
.interactive-white-card:hover {
  /* hover:border-pink-500 */
  border-color: #ec4899; /* Pink-500 */
  
  /* hover:shadow-xl */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  
  /* hover:-translate-y-1 */
  transform: translateY(-0.25rem); /* -4px (Nâng nhẹ lên) */
}
      .flex-heading-style {
  /* text-lg */
  font-size: 1.125rem; /* 18px */
  line-height: 1.75rem; /* 28px */
  
  /* font-bold */
  font-weight: 700; 
  
  /* text-gray-700 */
  color: #374151; 
  
  /* flex */
  display: flex;
  
  /* items-center */
  align-items: center; /* Căn giữa dọc các item con (ví dụ: text và icon) */
  
  /* gap-2 */
  gap: 0.5rem; /* 8px - Khoảng cách giữa các item con */
}
      
      .large-bold-text {
  /* text-2xl */
  font-size: 1.5rem; /* 24px */
  line-height: 2rem; /* 32px */
  
  /* font-bold */
  font-weight: 700; 
  
  /* text-gray-800 */
  color: #1f2937; 
}
      .subtle-gradient-panel-cyan {
  /* bg-linear-to-r from-purple-100 to-cyan-100 */
  background-image: linear-gradient(to right, #f3e8ff, #cffafe);
  /* Purple-100: #f3e8ff, Cyan-100: #cffafe */
  
  /* rounded-2xl */
  border-radius: 1rem; /* 16px */
  
  /* p-6 */
  padding: 1.5rem; /* 24px */
  
  /* mb-8 */
  margin-bottom: 2rem; /* 32px */
  
  /* shadow-md */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); 
}
      .pink-bold-label {
  /* text-sm */
  font-size: 0.875rem; /* 14px */
  line-height: 1.25rem; /* 20px */
  
  /* font-bold */
  font-weight: 700; 
  
  /* text-pink-700 */
  color: #be185d; 
  
  /* mb-2 */
  margin-bottom: 0.5rem; /* 8px */
}
      .subtle-gradient-panel {
  /* bg-linear-to-r from-pink-100 to-purple-100 */
  background-image: linear-gradient(to right, #fce7f3, #f3e8ff);
  /* Pink-100: #fce7f3, Purple-100: #f3e8ff */
  
  /* rounded-2xl */
  border-radius: 1rem; /* 16px */
  
  /* p-6 */
  padding: 1.5rem; /* 24px */
  
  /* mb-6 */
  margin-bottom: 1.5rem; /* 24px */
  
  /* shadow-md */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); 
}
      .large-purple-heading {
  /* text-3xl */
  font-size: 1.875rem; /* 30px */
  line-height: 2.25rem; /* 36px */
  
  /* font-black */
  font-weight: 900; 
  
  /* text-purple-700 */
  color: #6d28d9; 
  
  /* tracking-tight */
  letter-spacing: -0.025em; /* Khoảng cách chữ hẹp */
}
      .glassmorphism-hover-card {
  /* group */
  /* Lớp đánh dấu cho phần tử cha, không có thuộc tính CSS trực tiếp. */
  
  /* bg-white/80 */
  background-color: rgba(255, 255, 255, 0.8); /* Nền trắng mờ 80% */
  
  /* backdrop-blur-xl */
  backdrop-filter: blur(20px); 
  
  /* rounded-[32px] */
  border-radius: 2rem; /* 32px */
  
  /* p-8 */
  padding: 2rem; /* 32px */
  
  /* shadow-2xl */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  /* border-4 border-purple-200 */
  border-width: 4px;
  border-style: solid;
  border-color: #e9d5ff; /* Purple-200 */
  
  /* transition-all duration-500 */
  transition: all 500ms ease-in-out; 
}

/* Các hiệu ứng hover */
.glassmorphism-hover-card:hover {
  /* hover:border-pink-400 */
  border-color: #f472b6; /* Pink-400 */
  
  /* hover:scale-[1.02] */
  transform: scale(1.02); /* Phóng to 2% */
  
  /* hover:shadow-pink-500/30 */
  /* Thay đổi box-shadow sang màu hồng 500 (#ec4899) với độ mờ 30% */
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25), /* Giữ bóng đổ đen ban đầu */
    0 10px 15px -3px rgba(236, 72, 153, 0.3), 0 4px 6px -4px rgba(236, 72, 153, 0.3); /* Thêm bóng đổ hồng */
}
      .glass-pill-button {
  /* px-8 py-4 */
  padding: 1rem 2rem; /* 1rem top/bottom (py-4), 2rem left/right (px-8) */
  
  /* bg-white/80 */
  background-color: rgba(255, 255, 255, 0.8); /* Nền trắng mờ 80% */
  
  /* backdrop-blur-xl */
  backdrop-filter: blur(20px); /* Làm mờ nền phía sau */
  
  /* rounded-full */
  border-radius: 9999px; 
  
  /* text-black */
  color: #000000; 
  
  /* font-bold */
  font-weight: 700; 
  
  /* transition (Thêm vào để hiệu ứng hover mượt mà) */
  transition: background-color 300ms ease-in-out; 
}

/* Các hiệu ứng hover */
.glass-pill-button:hover {
  /* hover:bg-white/60 */
  background-color: rgba(255, 255, 255, 0.6); /* Nền trắng mờ 60% (trong suốt hơn) */
}
      .interactive-blur-card {
  /* group */
  /* Lớp đánh dấu cho phần tử cha, không có thuộc tính CSS trực tiếp. */
  
  /* relative */
  position: relative;
  
  /* w-56 h-56 */
  width: 100%;  /* 224px */
  height: 100%; /* 224px */
  
  /* rounded-[32px] */
  border-radius: 2rem; /* 32px */
  
  /* bg-white/80 */
  background-color: rgba(255, 255, 255, 0.8); /* Nền trắng mờ 80% */
  
  /* backdrop-blur-xl */
  backdrop-filter: blur(20px); 
  
  /* border-4 border-purple-300 */
  border-width: 4px;
  border-style: solid;
  border-color: #d8b4fe; /* Purple-300 */
  
  /* shadow-2xl */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  /* transition-all duration-500 */
  transition: all 500ms ease-in-out; 
  
  /* flex flex-col */
  display: flex;
  flex-direction: column;
  
  /* items-center */
  align-items: center; /* Căn giữa ngang nội dung */
  
  /* justify-center */
  justify-content: center; /* Căn giữa dọc nội dung */
  
  /* gap-4 */
  gap: 1rem; /* 16px - Khoảng cách giữa các item con */
}

/* Các hiệu ứng hover */
.interactive-blur-card:hover {
  /* hover:border-pink-500 */
  border-color: #ec4899; /* Pink-500 */
  
  /* hover:scale-110 */
  transform: scale(1.1);
}
      .pulsing-hero-caption {
  /* relative */
  position: relative;
  
  /* inline-block */
  display: inline-block; /* Quan trọng để px/py và width hoạt động */
  
  /* text-white */
  color: #ffffff;
  
  /* mt-6 */
  margin-top: 1.5rem; /* 24px */
  
  /* px-8, py-3 */
  padding-left: 2rem;  /* 32px */
  padding-right: 2rem; /* 32px */
  padding-top: 0.75rem;    /* 12px */
  padding-bottom: 0.75rem; /* 12px */

  /* text-2xl (Giá trị mặc định cho màn hình nhỏ) */
  font-size: 1.5rem; /* 24px */
  line-height: 2rem; /* 32px */
  
  /* drop-shadow-2xl (Sử dụng filter để mô phỏng drop-shadow) */
  filter: drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15));

  /* hero-text-glow (CSS Tùy chỉnh: Tạo hiệu ứng phát sáng cho chữ) */
  text-shadow: 
    0 0 8px rgba(255, 255, 255, 0.6), /* Bóng trắng mờ */
    0 0 15px rgba(255, 255, 255, 0.4); 

  /* animate-pulse-soft */
  animation: pulse-soft 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Keyframes cho hiệu ứng pulse-soft (nhấp nháy nhẹ) */
@keyframes pulse-soft {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
}

/* --- Responsive CSS cho màn hình MD (min-width: 768px) --- */
@media (min-width: 768px) {
  .pulsing-hero-caption {
    /* md:text-4xl */
    font-size: 2.25rem; /* 36px */
    line-height: 2.5rem; /* 40px */
  }
}
      .hero-title-style {
  /* relative */
  position: relative;
  
  /* block */
  display: block;
  
  /* padding (px-10, py-8) */
  padding-left: 2.5rem;  /* 40px */
  padding-right: 2.5rem; /* 40px */
  padding-top: 2rem;     /* 32px */
  padding-bottom: 2rem;  /* 32px */

  /* text-6xl (Giá trị mặc định cho màn hình nhỏ) */
  font-size: 3.75rem; /* 60px */
  line-height: 1; 

  /* font-black */
  font-weight: 900; 
  
  /* tracking-wider */
  letter-spacing: 0.05em; 
  
  /* text-white */
  color: #ffffff;
  
  /* drop-shadow-2xl (Sử dụng filter để mô phỏng drop-shadow) */
  filter: drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15));

  /* hero-text-glow (CSS Tùy chỉnh: Tạo hiệu ứng phát sáng cho chữ) */
  text-shadow: 
    0 0 10px rgba(255, 255, 255, 0.5), /* Bóng trắng mờ */
    0 0 20px rgba(255, 255, 255, 0.3); 

  /* -translate-y-3 (Giá trị mặc định) */
  transform: translateY(-0.75rem); /* -12px */
  
  /* animate-pulse-soft */
  animation: pulse-soft 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Keyframes cho hiệu ứng pulse-soft (nhấp nháy nhẹ) */
@keyframes pulse-soft {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
}

/* --- Responsive CSS cho màn hình MD (min-width: 768px) --- */
@media (min-width: 768px) {
  .hero-title-style {
    /* md:px-14, md:py-10 */
    padding-left: 3.5rem;  /* 56px */
    padding-right: 3.5rem; /* 56px */
    padding-top: 2.5rem;   /* 40px */
    padding-bottom: 2.5rem;/* 40px */

    /* md:text-7xl */
    font-size: 4.5rem; /* 72px */

    /* md:-translate-y-4 */
    transform: translateY(-1rem); /* -16px */
  }
}

/* --- Responsive CSS cho màn hình LG (min-width: 1024px) --- */
@media (min-width: 1024px) {
  .hero-title-style {
    /* lg:px-20, lg:py-12 */
    padding-left: 5rem;  /* 80px */
    padding-right: 5rem; /* 80px */
    padding-top: 3rem;   /* 48px */
    padding-bottom: 3rem;/* 48px */
    
    /* lg:text-10xl (Giả định giá trị tùy chỉnh rất lớn, ví dụ 8rem/128px) */
    /* Tailwind mặc định không có text-10xl, tôi dùng giá trị hợp lý */
    font-size: 8rem; /* 128px */
    
    /* lg:-translate-y-5 */
    transform: translateY(-1.25rem); /* -20px */
  }
}
      .subtle-gradient-background-relative {
  /* min-h-screen */
  min-height: 100vh; /* Chiều cao tối thiểu bằng chiều cao của viewport */
  
  /* relative */
  position: relative; /* Cho phép các phần tử con dùng absolute dựa trên phần tử này */
  
  /* bg-linear-to-br from-[#FFF6E9] via-[#D8C8FF]/20 to-[#C7FFF1]/30 */
  background-image: linear-gradient(to bottom right, 
    #FFF6E9, /* Màu Kem nhạt */
    rgba(216, 200, 255, 0.2), /* Màu Tím nhạt với độ mờ 20% */
    rgba(199, 255, 241, 0.3)  /* Màu Xanh ngọc nhạt với độ mờ 30% */
  );
  
  background-attachment: fixed; /* (Thường được thêm vào để gradient toàn màn hình mượt mà) */
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
    @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
    .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
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
          
      /* Pagination helper classes (copied from VocabularyPage for consistent styling) */
      .custom-button { padding: 1rem 1.25rem; border-radius: 9999px; background-color: rgba(255,255,255,0.9); transition: all 150ms ease-in-out; }
      .custom-button:hover { background-color: #fecaca; transform: scale(1.03); }
      .custom-button:disabled { opacity: 0.5; }

      .button-icon-effect { background-color: rgba(255,255,255,0.9); width: 1.5rem; height: 1.5rem; transition: transform 150ms ease-in-out; display:inline-flex; align-items:center; justify-content:center; }
      @media (min-width:768px){ .button-icon-effect { width:2rem; height:2rem; } }
      .button-icon-effect:hover { transform: scale(1.1); }

      .custom-element { background-color: #f472b6; color:#fff; padding: 0 1rem; height:2.5rem; font-weight:700; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1); display:inline-flex; align-items:center; justify-content:center; }
      @media (min-width:768px){ .custom-element { height:3rem; } }

      .circular-icon-button { padding: 0.75rem; border-radius:9999px; background-color: rgba(255,255,255,0.3); transition: all 150ms ease-in-out; }
      .circular-icon-button:hover { background-color: #fecaca; transform: scale(1.05); }
      .circular-icon-button:disabled { opacity: 0.5; }
  `}</style>
    </div>
  );
}
