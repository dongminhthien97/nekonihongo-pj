// src/pages/GrammarPage.tsx
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Cat,
  ChevronDown,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Background } from "./Background";
import { NekoLoading } from "../components/NekoLoading";
import api from "../api/auth";

const LESSONS_PER_PAGE = 12;
const GRAMMAR_PER_PAGE = 3;

interface GrammarExample {
  japanese: string;
  vietnamese: string;
}

interface GrammarPoint {
  title: string;
  meaning: string;
  explanation: string;
  examples: GrammarExample[];
}

interface GrammarLesson {
  id: number;
  title: string;
  icon: string;
  grammar: GrammarPoint[];
}

export function GrammarPage({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const [lessons, setLessons] = useState<GrammarLesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [lessonPage, setLessonPage] = useState(1);
  const [grammarPage, setGrammarPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedExamples, setExpandedExamples] = useState<number[]>([]); // index của point đang mở ví dụ

  useEffect(() => {
    const fetchGrammarLessons = async () => {
      try {
        const res = await api.get("/grammar/lessons");
        const serverLessons = res.data.data || [];
        await new Promise((resolve) => setTimeout(resolve, 600));

        setLessons(serverLessons);
        setError("");
      } catch (err: any) {
        console.error("❌ Lỗi khi tải ngữ pháp:", err);

        if (err.response?.status === 401) {
          alert("Phiên đăng nhập hết hạn! Mèo đưa bạn về trang đăng nhập nhé");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("nekoUser");
          onNavigate("login");
          return;
        }

        setError("Không thể kết nối đến server! Mèo đang cố gắng...");
      } finally {
        setTimeout(() => setIsLoading(false), 600);
      }
    };

    fetchGrammarLessons();
  }, [onNavigate]);

  const totalLessonPages = Math.ceil(lessons.length / LESSONS_PER_PAGE);
  const currentLessons = lessons.slice(
    (lessonPage - 1) * LESSONS_PER_PAGE,
    lessonPage * LESSONS_PER_PAGE
  );

  const currentLessonData = selectedLesson
    ? lessons.find((l) => l.id === selectedLesson)
    : null;

  const paginatedGrammar =
    currentLessonData?.grammar.slice(
      (grammarPage - 1) * GRAMMAR_PER_PAGE,
      grammarPage * GRAMMAR_PER_PAGE
    ) || [];

  const toggleExample = (pointIndex: number) => {
    setExpandedExamples((prev) =>
      prev.includes(pointIndex)
        ? prev.filter((i) => i !== pointIndex)
        : [...prev, pointIndex]
    );
  };
  const [expandedSections, setExpandedSections] = useState<{
    [pointIndex: number]: {
      explanation?: boolean;
      examples?: boolean;
    };
  }>({});
  const toggleSection = (
    pointIndex: number,
    section: "explanation" | "examples"
  ) => {
    setExpandedSections((prev) => ({
      ...prev,
      [pointIndex]: {
        ...prev[pointIndex],
        [section]: !prev[pointIndex]?.[section],
      },
    }));
  };

  if (isLoading) {
    return (
      <NekoLoading message="Mèo đang chuẩn bị bài học ngữ pháp cho bạn..." />
    );
  }

  if (error && lessons.length === 0) {
    return (
      <div className="full-page-dark-gradient-center">
        <div className="text-center text-white">
          <Cat className="text-9xl animate-bounce" />
          <p className="text-4xl font-bold mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-10 py-5 bg-white/20 backdrop-blur-xl rounded-2xl hover:bg-white/30 transition-all text-2xl font-bold"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subtle-gradient-background-relative">
      <Background />
      <Navigation currentPage="grammar" onNavigate={onNavigate} />

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-12">
          <h1 className="hero-title-style hero-text-glow">
            Ngữ Pháp Tiếng Nhật
          </h1>
        </div>

        {/* Danh sách bài học */}
        {!selectedLesson && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-12">
              {currentLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setSelectedLesson(lesson.id);
                    setGrammarPage(1);
                  }}
                  className="interactive-blur-card"
                >
                  <Cat className="text-gray-800 animate-pulse-soft w-full h-full" />
                  <div className="text-center">
                    <p className="hero-text-glow text-white text-4xl">
                      Bài {lesson.id}
                    </p>
                    <p className="hero-text-glow text-2xl text-white mt-2 px-4 line-clamp-2">
                      {lesson.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {totalLessonPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-12">
                <button
                  onClick={() => setLessonPage((p) => Math.max(1, p - 1))}
                  disabled={lessonPage === 1}
                  className="custom-button"
                >
                  <ChevronLeft className="w-6 h-6 text-black" />
                </button>

                <div className="flex gap-3 items-center">
                  {Array.from({ length: totalLessonPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setLessonPage(i + 1)}
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
                >
                  <ChevronRight className="w-6 h-6 text-black" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Chi tiết bài học */}
        {selectedLesson && currentLessonData && (
          <div className="max-w-7xl mx-auto">
            <div className="w-full flex flex-col items-center gap-4 mb-12">
              <button
                onClick={() => setSelectedLesson(null)}
                className="glass-pill-button"
              >
                ← Tất cả bài học
              </button>
            </div>

            <h1 className="text-5xl hero-text-glow text-white text-center animate-fade-in mb-12">
              Bài {selectedLesson}: {currentLessonData.title}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-10">
              {paginatedGrammar.map((g, i) => {
                const pointIndex = (grammarPage - 1) * GRAMMAR_PER_PAGE + i;
                const isExpanded = expandedExamples.includes(pointIndex);

                return (
                  <div key={i} className="glassmorphism-hover-card">
                    <h4 className="large-purple-heading text-center mb-6">
                      {g.title}
                    </h4>

                    <div className="subtle-gradient-panel mb-6">
                      <p className="pink-bold-label">Ý NGHĨA</p>
                      <p className="large-bold-text">{g.meaning}</p>
                    </div>

                    {/* Giải thích – có toggle ẩn/hiện */}
                    <button
                      onClick={() => toggleSection(pointIndex, "explanation")}
                      className="interactive-gradient-row-spaced"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="icon-indigo-standard" />
                        <span className="purple-heading-bold">
                          Giải thích chi tiết
                        </span>
                      </div>
                      <ChevronDown
                        className={`icon-purple-transition ${
                          expandedSections[pointIndex]?.explanation
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {expandedSections[pointIndex]?.explanation && (
                      <div className="subtle-purple-card animate-fade-in mb-8">
                        <p className="preformatted-text-large whitespace-pre-line">
                          {g.explanation}
                        </p>
                      </div>
                    )}

                    {/* Nút toggle ví dụ */}
                    <button
                      onClick={() => toggleExample(pointIndex)}
                      className="gradient-interactive-row"
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="icon-yellow-highlight" />
                        <span className="purple-heading-bold">Ví dụ</span>
                      </div>
                      <ChevronDown
                        className={`icon-purple-transition ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Ví dụ – chỉ hiện khi expanded */}
                    {isExpanded && (
                      <div className="space-y-6 animate-fade-in">
                        {g.examples.map((ex, j) => (
                          <div key={j} className="interactive-white-card">
                            <div
                              className="section-title-style"
                              dangerouslySetInnerHTML={{ __html: ex.japanese }}
                            />
                            <div
                              className="flex-text-style font-medium"
                              dangerouslySetInnerHTML={{
                                __html: ex.vietnamese,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="footer-flex-bar">
                      <span className="wiggle-title">🐾</span>
                      <span className="wiggle-title">🐾</span>
                      <span className="wiggle-title">🐾</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Phân trang ngữ pháp – ĐỒNG BỘ STYLE HOÀN TOÀN với phân trang bài học */}
            {currentLessonData.grammar.length > GRAMMAR_PER_PAGE && (
              <div className="flex justify-center items-center gap-6 mt-16">
                <button
                  onClick={() => setGrammarPage((p) => Math.max(1, p - 1))}
                  disabled={grammarPage === 1}
                  className="custom-button"
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
                >
                  <ChevronRight className="w-6 h-6 text-black" />
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
          className="w-40 h-40 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 rounded-full object-cover shadow-2xl animate-fly drop-shadow-2xl"
          style={{
            filter: "drop-shadow(0 10px 20px rgba(255, 182, 233, 0.4))",
          }}
        />
      </div>

      <Footer />

      <style>{`

      .icon-yellow-highlight {
  /* w-6 h-6 */
  width: 1.5rem;
  height: 1.5rem;

  /* text-yellow-500 */
  color: #eab308;
}
      .icon-indigo-standard {
  /* w-6 h-6 */
  width: 1.5rem;
  height: 1.5rem;

  /* text-indigo-500 */
  color: #6366f1;
}
      .icon-purple-transition {
  /* w-8 h-8 */
  width: 2rem;
  height: 2rem;

  /* text-purple-600 */
  color: #9333ea;

  /* transition-transform */
  /* Tailwind mặc định dùng duration 150ms và ease-in-out cho transition */
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Thường đi kèm với hover để thấy được hiệu ứng transition */
.icon-purple-transition:hover {
  transform: scale(1.1); /* Ví dụ: phóng lớn nhẹ khi di chuột */
}
      .interactive-gradient-row-spaced {
  /* w-full */
  width: 100%;
  
  /* flex items-center justify-between */
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  /* py-4 px-6 */
  padding: 1rem 1.5rem;
  
  /* bg-gradient-to-r from-pink-100 to-purple-100 */
  background-image: linear-gradient(to right, #fce7f6, #ede9fe);
  
  /* rounded-2xl */
  border-radius: 1rem;
  
  /* transition-all */
  transition: all 150ms ease-in-out;
  
  /* mb-6 (Phần bổ sung mới) */
  margin-bottom: 1.5rem;
  
  /* Đảm bảo con trỏ thay đổi khi di chuột vào */
  cursor: pointer;
  border: none;
}

/* Hiệu ứng tương tác khi hover */
.interactive-gradient-row-spaced:hover {
  /* hover:from-pink-200 hover:to-purple-200 */
  background-image: linear-gradient(to right, #fbcfe8, #ddd6fe);
  transform: translateY(-2px); /* Thêm hiệu ứng nổi nhẹ */
}
      .purple-heading-bold {
  /* text-2xl */
  font-size: 1.5rem;
  line-height: 2rem;
  
  /* font-bold */
  font-weight: 700;
  
  /* text-purple-700 */
  color: #7e22ce;
}
      @keyframes wiggle {
  /* Bắt đầu và kết thúc hơi nghiêng về bên trái */
  0%, 100% {
    transform: rotate(-3deg);
  }
  /* Điểm giữa nghiêng về bên phải */
  50% {
    transform: rotate(3deg);
  }
}

.wiggle-title {
  font-size: 2.25rem;
  
  /* animate-wiggle: Lặp lại vô hạn trong 1s */
  animation: wiggle 1s ease-in-out infinite;
}
      .full-page-dark-gradient-center {
  /* min-h-screen */
  min-height: 100vh;
  
  /* flex items-center justify-center */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* bg-gradient-to-br from-purple-900 to-pink-900 */
  background-image: linear-gradient(to bottom right, #581c87, #831843);
}
      .subtle-purple-card {
  /* bg-purple-100/50 */
  background-color: rgba(243, 232, 255, 0.5); 
  
  /* rounded-2xl */
  border-radius: 1rem; 
  
  /* p-8 */
  padding: 2rem; 
  
  /* mb-8 */
  margin-bottom: 2rem;
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
      .gradient-interactive-row {
  /* w-full */
  width: 100%;
  
  /* flex items-center justify-between */
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  /* py-4 px-6 */
  padding-top: 1rem;
  padding-bottom: 1rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  
  /* bg-gradient-to-r from-pink-100 to-purple-100 */
  background-image: linear-gradient(to right, #fce7f6, #ede9fe);
  
  /* rounded-2xl */
  border-radius: 1rem;
  
  /* transition-all */
  transition: all 150ms ease-in-out;
  
  /* mb-6 */
  margin-bottom: 1.5rem;
}

/* Hiệu ứng tương tác */
.gradient-interactive-row:hover {
  /* hover:from-pink-200 hover:to-purple-200 */
  background-image: linear-gradient(to right, #fbcfe8, #ddd6fe);
}
      .preformatted-text-large {
  font-size: 1.875rem;
  color: #1f2937;
  line-height: 1.625; /* leading-relaxed (Thường là 1.625 hoặc 1.5) */
  white-space: pre-line; /* Giữ nguyên ngắt dòng, bỏ qua khoảng trắng thừa */
}
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
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

.full-bounce-pink-element {
  position: relative;
  width: 100%;
  height: 100%;
  
  /* text-pink-500 */
  color: #ec4899; 
  
  /* animate-bounce */
  animation: bounce 1s infinite;
  
  /* drop-shadow-2xl */
  filter: drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15)); 
}
        /* TẤT CẢ STYLE CỦA BẠN ĐƯỢC GIỮ NGUYÊN 100% */
        .footer-flex-bar {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #f3e8ff;
        }
        .flex-text-style {
          font-size: 1.25rem;
          line-height: 1.75rem;
          color: #4b5563;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .section-title-style {
          font-size: 1.875rem;
          font-weight: 900;
          color: #1f2937;
          margin-bottom: 0.75rem;
          line-height: 1.625;
        }
        .interactive-white-card {
          background-color: #ffffff;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -4px rgba(0, 0, 0, 0.1);
          border: 2px solid #fbcfe8;
          transition: all 300ms ease-in-out;
        }
        .interactive-white-card:hover {
          border-color: #ec4899;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 8px 10px -6px rgba(0, 0, 0, 0.1);
          transform: translateY(-0.25rem);
        }
        .flex-heading-style {
          font-size: 1.125rem;
          line-height: 1.75rem;
          font-weight: 700;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .large-bold-text {
          font-size: 2rem;
          line-height: 2rem;
          font-weight: 700;
          color: #1f2937;
        }
        .subtle-gradient-panel-cyan {
          background-image: linear-gradient(to right, #f3e8ff, #cffafe);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -2px rgba(0, 0, 0, 0.1);
        }
        .pink-bold-label {
          font-size: 1.45rem;
          line-height: 1.25rem;
          font-weight: 700;
          color: #be185d;
          margin-bottom: 0.5rem;
        }
        .subtle-gradient-panel {
          background-image: linear-gradient(to right, #fce7f3, #f3e8ff);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -2px rgba(0, 0, 0, 0.1);
        }
        .large-purple-heading {
          font-size: 2.875rem;
          line-height: 2.25rem;
          font-weight: 900;
          color: #6d28d9;
          letter-spacing: -0.025em;
        }
        .glassmorphism-hover-card {
          background-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 2rem;
          padding: 2rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 4px solid #e9d5ff;
          transition: all 500ms ease-in-out;
        }
        .glassmorphism-hover-card:hover {
          border-color: #f472b6;
          transform: scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 10px 15px -3px rgba(236, 72, 153, 0.3),
            0 4px 6px -4px rgba(236, 72, 153, 0.3);
        }
        .glass-pill-button {
          padding: 1rem 2rem;
          background-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 9999px;
          color: #000000;
          font-weight: 700;
          transition: background-color 300ms ease-in-out;
        }
        .glass-pill-button:hover {
          background-color: rgba(255, 255, 255, 0.6);
        }
        .interactive-blur-card {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 2rem;
          background-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border: 4px solid #d8b4fe;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          transition: all 500ms ease-in-out;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }
        .interactive-blur-card:hover {
          border-color: #ec4899;
          transform: scale(1.1);
        }
        .pulsing-hero-caption {
          position: relative;
          display: inline-block;
          color: #ffffff;
          margin-top: 1.5rem;
          padding-left: 2rem;
          padding-right: 2rem;
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
          font-size: 1.5rem;
          line-height: 2rem;
          filter: drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15));
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.6),
            0 0 15px rgba(255, 255, 255, 0.4);
          animation: pulse-soft 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @media (min-width: 768px) {
          .pulsing-hero-caption {
            font-size: 2.25rem;
            line-height: 2.5rem;
          }
        }
        .hero-title-style {
          position: relative;
          display: block;
          padding-left: 2.5rem;
          padding-right: 2.5rem;
          padding-top: 2rem;
          padding-bottom: 2rem;
          font-size: 3.75rem;
          line-height: 1;
          font-weight: 900;
          letter-spacing: 0.05em;
          color: #ffffff;
          filter: drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15));
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.5),
            0 0 20px rgba(255, 255, 255, 0.3);
          transform: translateY(-0.75rem);
          animation: pulse-soft 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @media (min-width: 768px) {
          .hero-title-style {
            padding-left: 3.5rem;
            padding-right: 3.5rem;
            padding-top: 2.5rem;
            padding-bottom: 2.5rem;
            font-size: 4.5rem;
            transform: translateY(-1rem);
          }
        }
        @media (min-width: 1024px) {
          .hero-title-style {
            padding-left: 5rem;
            padding-right: 5rem;
            padding-top: 3rem;
            padding-bottom: 3rem;
            font-size: 8rem;
            transform: translateY(-1.25rem);
          }
        }
        .subtle-gradient-background-relative {
          min-height: 100vh;
          position: relative;
          background-image: linear-gradient(
            to bottom right,
            #fff6e9,
            rgba(216, 200, 255, 0.2),
            rgba(199, 255, 241, 0.3)
          );
          background-attachment: fixed;
        }
        @keyframes pulse-soft {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
        .hero-text-glow {
          text-shadow: 0 0 20px #ff69b4, 0 0 40px #a020f0, 0 0 60px #00ffff,
            0 0 80px #ff69b4, 0 0 100px #a020f0, 0 4px 20px rgba(0, 0, 0, 0.9);
          filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.8));
        }
        .custom-button {
          padding: 1rem 1.25rem;
          border-radius: 9999px;
          background-color: rgba(255, 255, 255, 0.9);
          transition: all 150ms ease-in-out;
        }
        .custom-button:hover {
          background-color: #fecaca;
          transform: scale(1.03);
        }
        .custom-button:disabled {
          opacity: 0.5;
        }
        .button-icon-effect {
          background-color: rgba(255, 255, 255, 0.9);
          width: 1.5rem;
          height: 1.5rem;
          transition: transform 150ms ease-in-out;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        @media (min-width: 768px) {
          .button-icon-effect {
            width: 2rem;
            height: 2rem;
          }
        }
        .button-icon-effect:hover {
          transform: scale(1.1);
        }
        .custom-element {
          background-color: #f472b6;
          color: #fff;
          padding: 0 1rem;
          height: 2.5rem;
          font-weight: 700;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -4px rgba(0, 0, 0, 0.1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        @media (min-width: 768px) {
          .custom-element {
            height: 3rem;
          }
        }
        .circular-icon-button {
          padding: 0.75rem;
          border-radius: 9999px;
          background-color: rgba(255, 255, 255, 0.3);
          transition: all 150ms ease-in-out;
        }
        .circular-icon-button:hover {
          background-color: #fecaca;
          transform: scale(1.05);
        }
        .circular-icon-button:disabled {
          opacity: 0.5;
        }
          
      `}</style>
    </div>
  );
}
