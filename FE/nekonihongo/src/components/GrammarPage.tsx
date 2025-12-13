// src/pages/GrammarPage.tsx
import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Background } from "./Background";
import { NekoLoading } from "../components/NekoLoading";
import api from "../api/auth"; // axios instance có token

const LESSONS_PER_PAGE = 5;
const GRAMMAR_PER_PAGE = 10;

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

  useEffect(() => {
    const fetchGrammarLessons = async () => {
      console.log("🐱 Bắt đầu tải danh sách bài học ngữ pháp... Meow!");

      try {
        console.log("📡 Đang gọi API: GET /grammar/lessons"); // log URL frontend gọi

        const res = await api.get("/grammar/lessons"); // <-- ĐÃ FIX: XÓA "/api" ĐẦU

        console.log("✅ Nhận phản hồi từ server:", res.status, res.statusText);
        console.log("📦 Response data:", res.data);

        const serverLessons = res.data.data || [];

        console.log(
          "🎉 Tải ngữ pháp thành công từ server!",
          serverLessons.length,
          "bài học"
        );

        await new Promise((resolve) => setTimeout(resolve, 1500));

        setLessons(serverLessons);
        setError("");

        console.log("✔️ Đã cập nhật state lessons với dữ liệu từ server");
      } catch (err: any) {
        console.error("❌ Lỗi khi tải ngữ pháp:", err);

        if (err.response) {
          console.error("Status:", err.response.status);
          console.error("Response data:", err.response.data);
          console.error("Headers:", err.response.headers);

          if (err.response.status === 401) {
            console.warn(
              "🔒 401 – Token hết hạn hoặc không hợp lệ – chuyển về login"
            );
            alert(
              "Phiên đăng nhập hết hạn! Mèo đưa bạn về trang đăng nhập nhé"
            );

            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("nekoUser");

            onNavigate("login");
            return;
          }

          if (err.response.status === 404) {
            console.warn("🔍 404 – Endpoint không tồn tại");
            setError("Không tìm thấy API ngữ pháp. Kiểm tra backend!");
          }
        } else if (err.request) {
          console.error("🌐 Không nhận được phản hồi từ server", err.request);
          setError("Không thể kết nối đến server! Mèo đang cố gắng...");
        } else {
          console.error("🚨 Lỗi setup request:", err.message);
          setError("Lỗi không xác định khi tải dữ liệu");
        }
      } finally {
        console.log("⏳ Đang tắt loading sau 1.5 giây...");
        setTimeout(() => {
          setIsLoading(false);
          console.log("✅ Loading đã tắt");
        }, 1500);
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

  // HIỆN LOADING SIÊU ĐẸP
  if (isLoading) {
    return (
      <NekoLoading message="Mèo đang chuẩn bị bài học ngữ pháp cho bạn..." />
    );
  }

  // LỖI KẾT NỐI
  if (error && lessons.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
        <div className="text-center text-white">
          <div className="text-9xl animate-bounce">Meow</div>
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
        {/* Tiêu đề */}
        <div className="text-center mb-12">
          <h1 className="hero-title-style hero-text-glow">
            Ngữ Pháp Tiếng Nhật
          </h1>
          <p className="pulsing-hero-caption">Học cùng mèo siêu dễ thương!</p>
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

            {/* Phân trang bài học */}
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {paginatedGrammar.map((g, i) => (
                  <div key={i} className="glassmorphism-hover-card">
                    <div className="flex items-center gap-4 mb-6">
                      <h4 className="large-purple-heading">{g.title}</h4>
                    </div>

                    <div className="subtle-gradient-panel">
                      <p className="pink-bold-label">Ý NGHĨA</p>
                      <p className="large-bold-text">{g.meaning}</p>
                    </div>

                    <div className="bg-purple-100/50 rounded-2xl p-8 mb-8">
                      <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-line">
                        {g.explanation}
                      </p>
                    </div>

                    <div className="space-y-5">
                      <p className="flex-heading-style">
                        <span>Ví dụ</span>
                        <span className="text-2xl">Meow</span>
                      </p>
                      {g.examples.map((ex, j) => (
                        <div key={j} className="interactive-white-card">
                          <p className="section-title-style">{ex.japanese}</p>
                          <p className="flex-text-style">
                            <span className="text-2xl">Meow</span>
                            <span className="font-medium">{ex.vietnamese}</span>
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="footer-flex-bar">
                      <span className="text-3xl animate-wiggle">Meow</span>
                      <span className="text-3xl">Meow</span>
                      <span className="text-3xl animate-wiggle">Meow</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Phân trang ngữ pháp */}
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
          </div>
        )}
      </main>

      {/* Mèo bay */}
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

      {/* TOÀN BỘ STYLE GIỮ NGUYÊN – SIÊU ĐẸP, SIÊU MÈO */}
      <style>{`
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
          font-size: 1.5rem;
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
          font-size: 0.875rem;
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
          font-size: 1.875rem;
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
