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
    <div className="min-h-screen bg-gradient-to-br from-[#FFF6E9] via-[#D8C8FF]/20 to-[#C7FFF1]/30 relative">
      <Background />
      <Navigation currentPage="grammar" onNavigate={onNavigate} />

      <main className="container mx-auto px-4 py-12 relative z-10">
        {/* Tiêu đề */}
        <div className="text-center mb-12">
          <h1
            className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl"
            style={{
              color: "white",
              textShadow: `
        -4px -4px 0 #000,
        4px -4px 0 #000,
        -4px 4px 0 #000,
        4px 4px 0 #000,
        -6px -6px 12px #000,
        6px 6px 12px #000
      `,
              WebkitTextStroke: "3px black",
              paintOrder: "stroke fill",
            }}
          >
            Ngữ Pháp Tiếng Nhật
          </h1>
          <p
            className="relative mt-6 text-2xl md:text-4xl font-bold 
               drop-shadow-2xl px-8 py-3 inline-block"
            style={{
              color: "white",
              textShadow: `
        0 0 15px rgba(0, 0, 0, 0.9),
        0 0 30px rgba(0, 0, 0, 0.8),
      `,
            }}
          >
            Học cùng mèo siêu dễ thương!
          </p>
        </div>

        {/* Danh sách 25 bài học */}
        {!selectedLesson && !searchQuery && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-7xl mx-auto mb-12">
              {currentLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setSelectedLesson(lesson.id);
                    setGrammarPage(1);
                    setWordPage(1);
                  }}
                  className="group relative w-56 h-56 rounded-3xl bg-white/80 backdrop-blur-xl border-4 border-purple-300 hover:border-pink-500 hover:scale-110 transition-all duration-500 shadow-2xl flex flex-col items-center justify-center gap-4"
                >
                  <div className="text-6xl group-hover:animate-bounce">
                    {lesson.icon}
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-purple-700">
                      Bài {lesson.id}
                    </p>
                    <p className="text-sm text-gray-700 mt-2 px-4 line-clamp-2">
                      {lesson.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Phân trang bài học */}
            <div className="flex justify-center items-center gap-8 mt-12">
              <button
                onClick={() => setLessonPage((p) => Math.max(1, p - 1))}
                disabled={lessonPage === 1}
                className="p-4 rounded-full bg-white/80 disabled:opacity-50 hover:bg-pink-200 transition"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
              <span className="text-2xl font-bold text-purple-700">
                Trang {lessonPage} / {totalLessonPages}
              </span>
              <button
                onClick={() =>
                  setLessonPage((p) => Math.min(totalLessonPages, p + 1))
                }
                disabled={lessonPage === totalLessonPages}
                className="p-4 rounded-full bg-white/80 disabled:opacity-50 hover:bg-pink-200 transition"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </div>
          </>
        )}

        {/* Nội dung bài học đã chọn */}
        {selectedLesson && currentLessonData && (
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => setSelectedLesson(null)}
              className="px-8 py-3 bg-white/30 backdrop-blur-md rounded-full text-white font-bold hover:bg-white/50 transition"
            >
              ← Tất cả bài học
            </button>
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
                  <div
                    key={i}
                    className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-4 border-purple-200 
                 hover:border-pink-400 hover:scale-[1.02] hover:shadow-pink-500/30 
                 transition-all duration-500 group"
                  >
                    {/* Icon mèo dễ thương + tiêu đề */}
                    <div className="flex items-center gap-4 mb-6">
                      <h4 className="text-3xl font-black text-purple-700 tracking-tight">
                        {g.title}
                      </h4>
                    </div>

                    {/* Cấu trúc */}
                    <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6 mb-6 shadow-md">
                      <p className="text-sm font-bold text-pink-700 mb-2">
                        CẤU TRÚC
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {g.structure}
                      </p>
                    </div>

                    {/* Ý nghĩa */}
                    <div className="bg-gradient-to-r from-purple-100 to-cyan-100 rounded-2xl p-6 mb-8 shadow-md">
                      <p className="text-sm font-bold text-purple-700 mb-2">
                        Ý NGHĨA
                      </p>
                      <p className="text-xl text-gray-800 leading-relaxed">
                        {g.meaning}
                      </p>
                    </div>

                    {/* Ví dụ – đẹp như flashcard */}
                    <div className="space-y-5">
                      <p className="text-lg font-bold text-gray-700 flex items-center gap-2">
                        <span>Ví dụ</span>
                        <span className="text-2xl">😺</span>
                      </p>
                      {g.examples.map((ex, j) => (
                        <div
                          key={j}
                          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-pink-200 
                       hover:border-pink-500 hover:shadow-xl hover:-translate-y-1 
                       transition-all duration-300"
                        >
                          <p className="text-3xl font-black text-gray-800 mb-3 leading-relaxed">
                            {ex.japanese}
                          </p>
                          <p className="text-xl text-gray-600 flex items-center gap-3">
                            <span className="text-2xl">😺</span>
                            <span className="font-medium">{ex.vietnamese}</span>
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Trang trí nhỏ xinh */}
                    <div className="flex justify-center gap-4 mt-8 pt-4 border-t border-purple-100">
                      <span className="text-3xl animate-wiggle">😺</span>
                      <span className="text-3xl">😺</span>
                      <span className="text-3xl animate-wiggle">😺</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Phân trang ngữ pháp */}
              {currentLessonData.grammar.length > GRAMMAR_PER_PAGE && (
                <div className="flex justify-center gap-6 mt-8">
                  <button
                    onClick={() => setGrammarPage((p) => Math.max(1, p - 1))}
                    disabled={grammarPage === 1}
                    className="px-6 py-3 bg-purple-500 text-white rounded-full disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-xl font-bold self-center">
                    {grammarPage} /{" "}
                    {Math.ceil(
                      currentLessonData.grammar.length / GRAMMAR_PER_PAGE
                    )}
                  </span>
                  <button
                    onClick={() => setGrammarPage((p) => p + 1)}
                    disabled={
                      grammarPage * GRAMMAR_PER_PAGE >=
                      currentLessonData.grammar.length
                    }
                    className="px-6 py-3 bg-purple-500 text-white rounded-full disabled:opacity-50"
                  >
                    Next
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
    </div>
  );
}
