import { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Background } from "./Background";
import { kanjiLessons } from "../data/kanjiLessons";

const LESSONS_PER_PAGE = 5;
const KANJI_PER_PAGE = 10;

export function KanjiPage({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [lessonPage, setLessonPage] = useState(1);
  const [kanjiPage, setKanjiPage] = useState(1);

  const totalLessonPages = Math.ceil(kanjiLessons.length / LESSONS_PER_PAGE);
  const currentLessons = kanjiLessons.slice(
    (lessonPage - 1) * LESSONS_PER_PAGE,
    lessonPage * LESSONS_PER_PAGE
  );

  const currentLesson = selectedLesson
    ? kanjiLessons.find((l) => l.id === selectedLesson)
    : null;

  const paginatedKanji =
    currentLesson?.kanjiList.slice(
      (kanjiPage - 1) * KANJI_PER_PAGE,
      kanjiPage * KANJI_PER_PAGE
    ) || [];

  const totalKanjiPages = currentLesson
    ? Math.ceil(currentLesson.kanjiList.length / KANJI_PER_PAGE)
    : 0;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Background />
      <Navigation currentPage="kanji" onNavigate={onNavigate} />

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-20 md:mb-28">
          {/* TIÊU ĐỀ CHÍNH – GRADIENT + VIỀN TRẮNG ĐEN SIÊU NỔI */}
          <h1
            className="text-7xl md:text-9xl font-black mb-8"
            style={{
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextStroke: "4px white", // VIỀN TRẮNG ĐẬM
              paintOrder: "stroke fill",
              textShadow: `
        0 0 20px rgba(255,255,255,0.9),
        -6px -6px 0 #ffffffff,
        6px -6px 0 #000000ff,
        -6px 6px 0 #000,
        6px 6px 0 #000,
        0 8px 20px rgba(0,0,0,0.8)
      `,
            }}
          >
            Học Chữ Kanji
          </h1>

          {/* DÒNG PHỤ – ĐEN ĐẬM + VIỀN TRẮNG SIÊU RÕ */}
          <div className="relative mt-8 md:mt-12 lg:mt-16">
            {" "}
            {/* ← TÙY CHỈNH KHOẢNG CÁCH TỪ TIÊU ĐỀ CHÍNH */}
            <p
              className="text-3xl md:text-4xl lg:text-5xl font-black text-center leading-tight"
              style={{
                color: "#ffffffff",

                /* ==== TÙY CHỈNH VỊ TRÍ ==== */
                marginTop: "2rem", // ← Tăng/giảm để đẩy lên/xuống
                marginBottom: "4rem", // ← Khoảng cách xuống phần tiếp theo

                /* ==== TÙY CHỈNH ĐỘ DÀY VIỀN TRẮNG ==== */
                textShadow: `
        0 0 12px #000000ff,          // độ sáng viền (tăng = sáng hơn)
        -4px -4px 0 #000000ff,       // viền dày hơn (tăng số = dày hơn)
        4px -4px 0 #000000ff,
        -4px 4px 0 #000000ff,
        4px 4px 0 #000000ff,
      `,

                /* ==== TÙY CHỈNH THÊM HIỆU ỨNG (bỏ comment nếu muốn) ==== */
                // animation: "bounce 3s ease-in-out infinite",
                // transform: "translateY(-10px)",  // đẩy lên thêm nếu cần
              }}
            >
              Cùng mèo học từng nét một nào!😺😺😺😺
            </p>
          </div>
        </div>

        {/* NẾU CHƯA CHỌN BÀI HỌC → HIỂN THỊ 25 BUTTON */}
        {!selectedLesson && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-16">
              {currentLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setSelectedLesson(lesson.id);
                    setKanjiPage(1);
                  }}
                  className="group relative bg-white/80 rounded-3xl p-10 shadow-2xl border-4 border-white 
                             hover:border-pink-400 hover:scale-110 hover:shadow-pink-500/50 
                             transition-all duration-500 flex flex-col items-center gap-6"
                >
                  <div className="text-5xl group-hover:animate-bounce">
                    {lesson.icon}
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-black text-gray-800">
                      Bài {lesson.id}
                    </p>
                    <p className="text-lg text-gray-600 mt-2">{lesson.title}</p>
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-4xl animate-bounce">Paw</span>
                  </div>
                </button>
              ))}
            </div>

            {/* PHÂN TRANG BÀI HỌC */}
            <div className="flex justify-center items-center gap-8 mt-12">
              <button
                onClick={() => setLessonPage((p) => Math.max(1, p - 1))}
                disabled={lessonPage === 1}
                className="p-4 rounded-full bg-white shadow-xl disabled:opacity-50 hover:bg-pink-100 transition"
              >
                <ChevronLeft className="w-10 h-10 text-purple-600" />
              </button>
              <span className="text-3xl font-bold text-purple-700">
                Trang {lessonPage} / {totalLessonPages}
              </span>
              <button
                onClick={() =>
                  setLessonPage((p) => Math.min(totalLessonPages, p + 1))
                }
                disabled={lessonPage === totalLessonPages}
                className="p-4 rounded-full bg-white shadow-xl disabled:opacity-50 hover:bg-pink-100 transition"
              >
                <ChevronRight className="w-10 h-10 text-purple-600" />
              </button>
            </div>
          </>
        )}

        {/* NẾU ĐÃ CHỌN BÀI HỌC → HIỂN THỊ KANJI CHIA 4 CỘT */}
        {selectedLesson && currentLesson && (
          <div className="max-w-7xl mx-auto">
            {/* HEADER BÀI HỌC – ĐƯỢC ĐƯA LÊN CAO, THOÁNG ĐÃNG, ĐẸP LUNG LINH */}
            <div className="text-center mb-24 md:mb-32 lg:mb-40">
              {/* Nút Back – nhỏ nhắn, dễ thương */}
              <button
                onClick={() => setSelectedLesson(null)}
                className="mb-10 px-10 py-4 bg-white/80 backdrop-blur-xl rounded-full 
               text-purple-700 font-bold text-2xl 
               hover:bg-pink-100 hover:scale-105 
               transition-all duration-300 shadow-2xl 
               border-4 border-white/50"
              >
                ← Quay lại danh sách bài
              </button>

              {/* Tiêu đề bài học – TO ĐÙNG, NEON, CĂN GIỮA */}
              <h2
                className="text-7xl md:text-9xl lg:text-10xl font-black text-transparent bg-clip-text 
                 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 
                 drop-shadow-2xl leading-tight"
              >
                Bài {selectedLesson}: {currentLesson.title}
              </h2>

              {/* Trang trí mèo + hoa bay nhẹ */}
              <div className="flex justify-center gap-8 mt-10 text-6xl">
                <span className="animate-bounce">😺</span>
                <span className="animate-bounce delay-200">😺</span>
                <span className="animate-bounce delay-400">😺</span>
              </div>
            </div>

            {/* GRID 4 CỘT KANJI – ĐÃ CÓ TỪ VỰNG BÊN DƯỚI */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-16">
              {paginatedKanji.map((k, i) => (
                <div
                  key={i}
                  className="group bg-white/80 rounded-3xl p-8 shadow-2xl border-4 border-white 
                 hover:border-pink-400 hover:scale-105 hover:-translate-y-4 
                 transition-all duration-500 cursor-pointer text-center relative overflow-hidden"
                >
                  {/* Chữ Kanji + số nét */}
                  <div className="mb-6">
                    <div className="text-5xl font-black text-gray-800 group-hover:text-purple-600 transition-colors">
                      {k.kanji}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {k.strokes} nét
                    </p>
                    <p className="text-2xl font-bold text-pink-600 mt-3">
                      {k.meaning}
                    </p>
                  </div>

                  {/* Âm On/Kun */}
                  <div className="text-xs space-y-1 text-gray-600 mb-6">
                    <p>
                      <span className="font-bold text-purple-600">Âm On:</span>{" "}
                      {k.on}
                    </p>
                    {k.kun && (
                      <p>
                        <span className="font-bold text-pink-600">Âm Kun:</span>{" "}
                        {k.kun}
                      </p>
                    )}
                  </div>

                  {/* TỪ VỰNG MẪU – HIỂN THỊ ĐẸP NHƯ FLASHCARD */}
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-gray-700 flex items-center justify-center gap-2">
                      <span>Từ ghép phổ biến</span>
                      <span>😺</span>
                    </p>
                    {k.compounds.map((c, j) => (
                      <div
                        key={j}
                        className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 
                       border border-pink-200 hover:border-pink-500 
                       hover:shadow-md transition-all duration-300"
                      >
                        <p className="text-xl font-black text-purple-700">
                          {c.word}
                        </p>
                        <p className="text-sm text-gray-600">{c.reading}</p>
                        <p className="text-sm font-medium text-gray-800 mt-1">
                          → {c.meaning}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Dấu chân mèo khi hover */}
                  <div className="absolute -top-4 -right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-6xl animate-bounce">Paw</span>
                  </div>
                </div>
              ))}
            </div>

            {/* PHÂN TRANG KANJI */}
            {totalKanjiPages > 1 && (
              <div className="flex justify-center items-center gap-8">
                <button
                  onClick={() => setKanjiPage((p) => Math.max(1, p - 1))}
                  disabled={kanjiPage === 1}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold disabled:opacity-50 hover:scale-105 transition"
                >
                  Trước
                </button>
                <span className="text-2xl font-bold text-purple-700">
                  Trang {kanjiPage} / {totalKanjiPages}
                </span>
                <button
                  onClick={() => setKanjiPage((p) => p + 1)}
                  disabled={kanjiPage === totalKanjiPages}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-bold disabled:opacity-50 hover:scale-105 transition"
                >
                  Tiếp
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
