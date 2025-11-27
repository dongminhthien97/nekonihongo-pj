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
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const LESSONS_PER_PAGE = 12;
  const WORDS_PER_PAGE = 10;

  // Tìm kiếm
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: { word: Word; lessonId: number }[] = [];
    vocabularyLessons.forEach((lesson) => {
      lesson.words.forEach((word) => {
        if (
          word.japanese.includes(query) ||
          word.romaji.toLowerCase().includes(query) ||
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
            <span
              className="relative block 
      px-10 md:px-14 lg:px-20        /* ← chỉnh lề ngang */
      py-8 md:py-10 lg:py-12         /* ← chỉnh chiều cao khung */
      text-6xl sm:text-6xl md:text-7xl lg:text-10xl 
      font-black 
      tracking-wider                 /* ← khoảng cách chữ, xóa nếu không thích */
      text-white 
      drop-shadow-2xl
      -translate-y-3 md:-translate-y-4 lg:-translate-y-5
    "
              style={{
                textShadow: `
        0 4px 10px rgba(0, 0, 0, 0.8),
        0 0 20px rgba(0, 0, 0, 0.9),
        0 0 40px rgba(0, 0, 0, 0.7),
        0 0 60px rgba(0, 0, 0, 0.5)
      `,
              }}
            >
              Từ Vựng Tiếng Nhật
            </span>
          </h1>
          {/* THANH TÌM KIẾM SIÊU ĐỈNH – VIỀN NỔI BẬT + TEXT CĂN GIỮA */}
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              {/* VIỀN NEON CHẠY VÒNG QUANH – SIÊU SÁNG, SIÊU ĐẸP */}
              <div
                className="absolute -inset-1.5 rounded-full 
                    bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 
                    opacity-90 group-focus-within:opacity-100
                    animate-border-spin"
              />

              {/* VIỀN NEON THỨ 2 – TĂNG ĐỘ DÀY + SÁNG */}
              <div
                className="absolute -inset-3 rounded-full 
                    bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 
                    blur-xl opacity-60 group-focus-within:opacity-90 
                    animate-border-spin delay-75"
              />

              {/* Thanh input chính – nền trắng mờ, viền sáng, bóng đẹp */}
              <div
                className="relative bg-black/50 backdrop-blur-2xl rounded-full 
                    border-4 border-white/40 shadow-2xl 
                    ring-8 ring-white/10 overflow-hidden"
              >
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
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 
                        opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10"
                    />
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1 text-left">
                        <p className="text-4xl font-black text-black drop-shadow-2xl text-glow-rainbow">
                          {word.japanese}
                        </p>
                        <p className="text-xl text-cyan-300 mt-1 text-glow-rainbow ">
                          {word.romaji}
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
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-4 gap-8 mb-16">
                {currentLessons.map((lesson) => (
                  // <div className="w-full bg-white/70 flex flex-col items-center gap-4 overflow-hidden">
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setWordPage(1);
                      setSearchQuery("");
                    }}
                    className="group font-black text-black relative overflow-hidden rounded-3xl 
           bg-white/80 backdrop-blur-xl border-4 border-white/50 hover:border-pink-300 
           hover:scale-110 hover:shadow-2xl hover:shadow-pink-500/40 transition-all 
           duration-500 

           /* KÍCH THƯỚC CỐ ĐỊNH – ĐỀU TẮM TẮP TRÊN MỌI MÀN HÌNH */
           w-[24rem] h-[12rem]        /* 384px x 192px – cố định tuyệt đối */
           
           /* CĂN GIỮA NỘI DUNG – TEXT GỌN GÀNG TRONG KHUNG */
           flex flex-col items-center justify-center gap-4 px-6 shadow-xl"
                  >
                    <div
                      className="text-4xl "
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
                      <p className="text-xl drop-shadow-lg">Bài {lesson.id}</p>
                      <p className="text-xl text-black mt-2 line-clamp-2">
                        {lesson.title}
                      </p>
                    </div>
                  </button>
                  // </div>
                ))}
              </div>

              {/* Phân trang bài học */}
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => setLessonPage((p) => Math.max(1, p - 1))}
                  disabled={lessonPage === 1}
                  className="p-4 rounded-full bg-white/80 disabled:opacity-50"
                >
                  <ChevronLeft className="w-8 h-8 text-white" />
                </button>
                <span className="text-2xl text-white font-bold">
                  {lessonPage} / {totalLessonPages}
                </span>
                <button
                  onClick={() =>
                    setLessonPage((p) => Math.min(totalLessonPages, p + 1))
                  }
                  disabled={lessonPage === totalLessonPages}
                  className="p-4 rounded-full bg-white/80 disabled:opacity-50"
                >
                  <ChevronRight className="w-8 h-8 text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Trong bài học – từ vựng + phân trang */
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-right mb-10">
              <div className="w-full bg-white/70 flex flex-col items-center gap-4 overflow-hidden">
                <h2 className="text-3xl font-bold text-white drop-shadow-2xl text-glow-rainbow">
                  {selectedLesson.icon} {selectedLesson.title}
                </h2>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="px-8 py-4 bg-white/80 backdrop-blur-xl rounded-full text-black font-bold hover:bg-white/60
                "
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
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-4">
              {currentWords.map((word, idx) => (
                <div
                  key={idx}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/40 hover:border-pink-400 hover:bg-white/25 hover:scale-105 transition-all duration-400 shadow-xl"
                >
                  <div className="text-center space-y-4">
                    <p className="text-5xl font-black text-black">
                      {word.japanese}
                    </p>
                    <p className="text-xl text-cyan-200">{word.romaji}</p>
                    <p className="text-2xl text-black font-medium">
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
                  className="p-5 rounded-full bg-white/30 disabled:opacity-50"
                >
                  <ChevronLeft className="w-10 h-10 text-white" />
                </button>
                <div className="flex gap-3">
                  {Array.from({ length: totalWordPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setWordPage(i + 1)}
                      className={`w-4 h-4 rounded-full transition-all ${
                        wordPage === i + 1 ? "bg-pink-400 w-12" : "bg-white/70"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() =>
                    setWordPage((p) => Math.min(totalWordPages, p + 1))
                  }
                  disabled={wordPage === totalWordPages}
                  className="p-5 rounded-full bg-white/30 disabled:opacity-50"
                >
                  <ChevronRight className="w-10 h-10 text-white" />
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
  `}</style>
    </div>
  );
}
