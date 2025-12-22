import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Cat } from "lucide-react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Background } from "./Background";
import { KanjiDetailModal } from "./KanjiDetailModal";

interface Kanji {
  kanji: string;
  on: string;
  kun: string;
  hanViet: string;
  meaning: string;
  example: string;
  strokes: number;
  svgPaths?: string[]; // SVG paths cho từng nét
}

interface Lesson {
  id: number;
  title: string;
  icon: string;
  kanjis: Kanji[];
}

interface KanjiPageProps {
  onNavigate: (page: string) => void;
}

// DATA MẪU CÁC BÀI HỌC KANJI
const kanjiLessons: Lesson[] = [
  {
    id: 1,
    title: "Kanji cơ bản N5",
    icon: "🎌",
    kanjis: [
      {
        kanji: "日",
        on: "ニチ、ジツ",
        kun: "ひ、か",
        hanViet: "Nhật",
        meaning: "Mặt trời, ngày",
        example: "日本 (にほん) - Nhật Bản",
        strokes: 4,
      },
      {
        kanji: "本",
        on: "ホン",
        kun: "もと",
        hanViet: "Bản",
        meaning: "Sách, gốc, thật",
        example: "本当 (ほんとう) - Thật sự",
        strokes: 5,
      },
      {
        kanji: "人",
        on: "ジン、ニン",
        kun: "ひと",
        hanViet: "Nhân",
        meaning: "Người",
        example: "人間 (にんげん) - Con người",
        strokes: 2,
      },
      {
        kanji: "月",
        on: "ゲツ、ガツ",
        kun: "つき",
        hanViet: "Nguyệt",
        meaning: "Mặt trăng, tháng",
        example: "月曜日 (げつようび) - Thứ hai",
        strokes: 4,
      },
      {
        kanji: "火",
        on: "カ",
        kun: "ひ",
        hanViet: "Hỏa",
        meaning: "Lửa",
        example: "火曜日 (かようび) - Thứ ba",
        strokes: 4,
      },
      {
        kanji: "水",
        on: "スイ",
        kun: "みず",
        hanViet: "Thủy",
        meaning: "Nước",
        example: "水曜日 (すいようび) - Thứ tư",
        strokes: 4,
      },
      {
        kanji: "木",
        on: "モク、ボク",
        kun: "き",
        hanViet: "Mộc",
        meaning: "Cây",
        example: "木曜日 (もくようび) - Thứ năm",
        strokes: 4,
      },
      {
        kanji: "金",
        on: "キン、コン",
        kun: "かね",
        hanViet: "Kim",
        meaning: "Vàng, tiền",
        example: "金曜日 (きんようび) - Thứ sáu",
        strokes: 8,
      },
    ],
  },
  {
    id: 2,
    title: "Kanji về học tập",
    icon: "📚",
    kanjis: [
      {
        kanji: "学",
        on: "ガク",
        kun: "まな-ぶ",
        hanViet: "Học",
        meaning: "Học",
        example: "学校 (がっこう) - Trường học",
        strokes: 8,
      },
      {
        kanji: "校",
        on: "コウ",
        kun: "",
        hanViet: "Hiệu",
        meaning: "Trường học",
        example: "学校 (がっこう) - Trường học",
        strokes: 10,
      },
      {
        kanji: "先",
        on: "セン",
        kun: "さき",
        hanViet: "Tiên",
        meaning: "Trước, trước đây",
        example: "先生 (せんせい) - Giáo viên",
        strokes: 6,
      },
      {
        kanji: "生",
        on: "セイ、ショウ",
        kun: "い-きる、う-まれる",
        hanViet: "Sinh",
        meaning: "Sinh, sống",
        example: "学生 (がくせい) - Học sinh",
        strokes: 5,
      },
      {
        kanji: "語",
        on: "ゴ",
        kun: "かた-る",
        hanViet: "Ngữ",
        meaning: "Ngôn ngữ",
        example: "日本語 (にほんご) - Tiếng Nhật",
        strokes: 14,
      },
      {
        kanji: "文",
        on: "ブン、モン",
        kun: "ふみ",
        hanViet: "Văn",
        meaning: "Văn, chữ",
        example: "文化 (ぶんか) - Văn hóa",
        strokes: 4,
      },
      {
        kanji: "字",
        on: "ジ",
        kun: "あざ",
        hanViet: "Tự",
        meaning: "Chữ",
        example: "文字 (もじ) - Chữ viết",
        strokes: 6,
      },
      {
        kanji: "書",
        on: "ショ",
        kun: "か-く",
        hanViet: "Thư",
        meaning: "Viết",
        example: "図書館 (としょかん) - Thư viện",
        strokes: 10,
      },
    ],
  },
  {
    id: 3,
    title: "Kanji về động vật",
    icon: "🐱",
    kanjis: [
      {
        kanji: "猫",
        on: "ビョウ",
        kun: "ねこ",
        hanViet: "Miêu",
        meaning: "Mèo",
        example: "猫 (ねこ) - Con mèo",
        strokes: 11,
      },
      {
        kanji: "犬",
        on: "ケン",
        kun: "いぬ",
        hanViet: "Khuyển",
        meaning: "Chó",
        example: "犬 (いぬ) - Con chó",
        strokes: 4,
      },
      {
        kanji: "馬",
        on: "バ",
        kun: "うま",
        hanViet: "Mã",
        meaning: "Ngựa",
        example: "馬 (うま) - Con ngựa",
        strokes: 10,
      },
      {
        kanji: "鳥",
        on: "チョウ",
        kun: "とり",
        hanViet: "Điểu",
        meaning: "Chim",
        example: "鳥 (とり) - Con chim",
        strokes: 11,
      },
      {
        kanji: "魚",
        on: "ギョ",
        kun: "さかな",
        hanViet: "Ngư",
        meaning: "Cá",
        example: "魚 (さかな) - Con cá",
        strokes: 11,
      },
      {
        kanji: "虫",
        on: "チュウ",
        kun: "むし",
        hanViet: "Trùng",
        meaning: "Côn trùng",
        example: "虫 (むし) - Sâu bọ",
        strokes: 6,
      },
      {
        kanji: "牛",
        on: "ギュウ",
        kun: "うし",
        hanViet: "Ngưu",
        meaning: "Bò",
        example: "牛乳 (ぎゅうにゅう) - Sữa bò",
        strokes: 4,
      },
      {
        kanji: "豚",
        on: "トン",
        kun: "ぶた",
        hanViet: "Đồn",
        meaning: "Lợn",
        example: "豚肉 (ぶたにく) - Thịt lợn",
        strokes: 11,
      },
    ],
  },
  {
    id: 4,
    title: "Kanji về ẩm thực",
    icon: "🍜",
    kanjis: [
      {
        kanji: "食",
        on: "ショク",
        kun: "た-べる",
        hanViet: "Thực",
        meaning: "Ăn, thức ăn",
        example: "食事 (しょくじ) - Bữa ăn",
        strokes: 9,
      },
      {
        kanji: "飲",
        on: "イン",
        kun: "の-む",
        hanViet: "Ẩm",
        meaning: "Uống",
        example: "飲み物 (のみもの) - Đồ uống",
        strokes: 12,
      },
      {
        kanji: "茶",
        on: "チャ、サ",
        kun: "",
        hanViet: "Trà",
        meaning: "Trà",
        example: "お茶 (おちゃ) - Trà",
        strokes: 9,
      },
      {
        kanji: "米",
        on: "ベイ、マイ",
        kun: "こめ",
        hanViet: "Mễ",
        meaning: "Gạo",
        example: "米 (こめ) - Gạo",
        strokes: 6,
      },
      {
        kanji: "肉",
        on: "ニク",
        kun: "",
        hanViet: "Nhục",
        meaning: "Thịt",
        example: "肉 (にく) - Thịt",
        strokes: 6,
      },
      {
        kanji: "野",
        on: "ヤ",
        kun: "の",
        hanViet: "Dã",
        meaning: "Đồng hoang, rau",
        example: "野菜 (やさい) - Rau",
        strokes: 11,
      },
      {
        kanji: "菜",
        on: "サイ",
        kun: "な",
        hanViet: "Thái",
        meaning: "Rau",
        example: "野菜 (やさい) - Rau",
        strokes: 11,
      },
      {
        kanji: "味",
        on: "ミ",
        kun: "あじ",
        hanViet: "Vị",
        meaning: "Vị, mùi vị",
        example: "味 (あじ) - Vị",
        strokes: 8,
      },
    ],
  },
];

export function KanjiPage({ onNavigate }: KanjiPageProps) {
  const [lessons] = useState<Lesson[]>(kanjiLessons);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedKanji, setSelectedKanji] = useState<Kanji | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lessonPage, setLessonPage] = useState(1);
  const [kanjiPage, setKanjiPage] = useState(1);

  const LESSONS_PER_PAGE = 12;
  const KANJIS_PER_PAGE = 12;

  // TÌM KIẾM KANJI
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: { kanji: Kanji; lessonId: number }[] = [];

    lessons.forEach((lesson) => {
      lesson.kanjis.forEach((kanji) => {
        if (
          kanji.kanji.includes(query) ||
          kanji.on.toLowerCase().includes(query) ||
          kanji.kun.toLowerCase().includes(query) ||
          kanji.hanViet.toLowerCase().includes(query) ||
          kanji.meaning.toLowerCase().includes(query)
        ) {
          results.push({ kanji, lessonId: lesson.id });
        }
      });
    });
    return results.slice(0, 20);
  }, [searchQuery, lessons]);

  // Phân trang bài học
  const totalLessonPages = Math.ceil(lessons.length / LESSONS_PER_PAGE);
  const currentLessons = lessons.slice(
    (lessonPage - 1) * LESSONS_PER_PAGE,
    lessonPage * LESSONS_PER_PAGE
  );

  // Phân trang kanji
  const currentKanjis = selectedLesson
    ? selectedLesson.kanjis.slice(
        (kanjiPage - 1) * KANJIS_PER_PAGE,
        kanjiPage * KANJIS_PER_PAGE
      )
    : [];
  const totalKanjiPages = selectedLesson
    ? Math.ceil(selectedLesson.kanjis.length / KANJIS_PER_PAGE)
    : 0;

  return (
    <div className="min-h-screen">
      <Navigation currentPage="kanji" onNavigate={onNavigate} />
      <Background />

      <main className="relative z-10 container mx-auto px-4 py-12">
        {/* Header + Search */}
        <div className="text-center mb-12">
          <h1 className="relative z-10 mb-12 md:mb-16">
            <div className="absolute inset-0 -z-10 rounded-3xl" />
            <span className="hero-section-title hero-text-glow">
              Học Chữ Kanji
            </span>
          </h1>

          {/* THANH TÌM KIẾM */}
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              <div className="glass-effect-container animate-fade-in">
                <div className="element-overlay-positioned">
                  <Search className="icon-centered-left" strokeWidth={5} />
                </div>
                <input
                  type="text"
                  placeholder="Tìm Kanji... (猫, ねこ, mèo, bài 1...)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedLesson(null);
                  }}
                  className="transparent-search-input"
                />
              </div>
            </div>

            {/* Kết quả tìm kiếm */}
            {searchResults.length > 0 && (
              <div className="mt-10 max-w-4xl mx-auto space-y-4 animate-fade-in">
                <p className="pulsing-centered-text">
                  Tìm thấy {searchResults.length} kết quả
                </p>
                {searchResults.map(({ kanji, lessonId }, idx) => (
                  <div
                    key={idx}
                    className="glass-card-hover-effect cursor-pointer"
                    onClick={() => setSelectedKanji(kanji)}
                  >
                    <div className="full-gradient-hover-effect" />
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1 text-left">
                        <p className="rainbow-glow-title">{kanji.kanji}</p>
                        <p className="small-rainbow-glow">
                          {kanji.on} / {kanji.kun}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="white-rainbow-glow-bold">
                          {kanji.meaning}
                        </p>
                        <p className="small-white-rainbow-glow">
                          Bài {lessonId} • {kanji.strokes} nét
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Danh sách bài học hoặc kanji */}
        {!selectedLesson ? (
          <>
            {/* DANH SÁCH BÀI HỌC */}
            <div className="max-w-7xl mx-auto">
              <div
                key={lessonPage}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-4 gap-8 mb-16"
              >
                {currentLessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setKanjiPage(1);
                      setSearchQuery("");
                    }}
                    className="responsive-hover-card animate-fade-in"
                  >
                    <div className="text-gray-800 animate-pulse-soft">
                      <Cat className="relative w-full h-full" />
                    </div>
                    <div className="text-center py-6">
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
            </div>
          </>
        ) : (
          /* CHI TIẾT BÀI HỌC - DANH SÁCH KANJI */
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center mb-10">
              <div className="w-full flex flex-col items-center gap-4">
                <h2 className="text-3xl hero-text-glow text-white">
                  {selectedLesson.title}
                </h2>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="button"
                >
                  ← Tất cả bài học
                </button>
              </div>
            </div>

            {/* GRID KANJI - 4 CỘT */}
            <div
              key={`${selectedLesson?.id || "none"}-${kanjiPage}`}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-8 mt-4"
            >
              {currentKanjis.map((kanji, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedKanji(kanji)}
                  className="kanji-simple-card animate-fade-in"
                >
                  <p className="text-8xl text-black font-black">
                    {kanji.kanji}
                  </p>
                </button>
              ))}
            </div>

            {/* Phân trang kanji */}
            {totalKanjiPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-16">
                <button
                  onClick={() => setKanjiPage((p) => Math.max(1, p - 1))}
                  disabled={kanjiPage === 1}
                  className="custom-button"
                  aria-label="Previous kanji page"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <div className="flex gap-3 items-center">
                  {Array.from({ length: totalKanjiPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setKanjiPage(i + 1)}
                      aria-label={`Go to page ${i + 1}`}
                      className={`rounded-full transition-all duration-200 flex items-center justify-center ${
                        kanjiPage === i + 1
                          ? "custom-element"
                          : "button-icon-effect"
                      }`}
                    >
                      {kanjiPage === i + 1 ? i + 1 : ""}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() =>
                    setKanjiPage((p) => Math.min(totalKanjiPages, p + 1))
                  }
                  disabled={kanjiPage === totalKanjiPages}
                  className="circular-icon-button"
                  aria-label="Next kanji page"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

      {/* MODAL CHI TIẾT KANJI */}
      {selectedKanji && (
        <KanjiDetailModal
          kanji={selectedKanji}
          onClose={() => setSelectedKanji(null)}
        />
      )}

      <style>{`
        /* THẺ KANJI ĐƠN GIẢN - TRẮNG + CHỮ ĐEN */
        .kanji-simple-card {
          background-color: #ffffff;
          border-radius: 2rem;
          padding: 3rem 2rem;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 300ms ease-in-out;
          border: 2px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .kanji-simple-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
          border-color: rgba(255, 199, 234, 0.5);
        }

        .kanji-simple-card:active {
          transform: translateY(-2px);
        }

        .circular-gradient-hover-glow {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          border-radius: 9999px;
          background-image: linear-gradient(to right, 
            rgba(244, 114, 182, 0.3),
            rgba(168, 85, 247, 0.3)
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
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }

        .responsive-hover-card {
          position: relative;
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 2rem;
          padding: 2rem;
          transition: all 500ms ease-in-out;
          overflow: hidden;
        }

        .responsive-hover-card:hover {
          transform: scale(1.05);
        }

        .pulsing-centered-text {
          text-align: center;
          color: #ffffff;
          font-weight: 700;
          font-size: 1.25rem;
          line-height: 1.75rem;
          margin-bottom: 1.5rem;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .glassmorphism-card {
          background-color: #ffffff;
          border-radius: 2rem;
          padding: 2rem;
          border-width: 2px;
          border-color: rgba(255, 255, 255, 0.4);
          transition: all 400ms ease-in-out;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }

        .glassmorphism-card:hover {
          border-color: #f472b6;
          background-color: rgba(255, 255, 255, 0.80);
          transform: scale(1.05);
        }

        .small-white-rainbow-glow {
          font-size: 1.125rem;
          line-height: 1.75rem;
          color: #ffffff;
          margin-top: 0.5rem;
          text-shadow: 
            0 0 3px rgba(255, 255, 255, 0.9),
            0 0 8px rgba(255, 0, 150, 0.9),
            0 0 12px rgba(147, 51, 234, 0.9),
            0 0 16px rgba(6, 182, 212, 0.9);
        }

        .white-rainbow-glow-bold {
          font-size: 1.875rem;
          line-height: 2.25rem;
          font-weight: 700;
          color: #ffffff;
          text-shadow: 
            0 0 4px rgba(255, 255, 255, 0.8),
            0 0 10px rgba(255, 0, 150, 0.9),
            0 0 15px rgba(147, 51, 234, 0.9),
            0 0 20px rgba(6, 182, 212, 0.9);
          filter: none;
        }

        .small-rainbow-glow {
          font-size: 1.5rem;
          line-height: 2rem;
          color: #ffffff;
          margin-top: 0.25rem;
          text-shadow: 
            0 0 2px rgba(255, 255, 255, 0.8),
            0 0 5px rgba(255, 0, 150, 0.9),
            0 0 8px rgba(147, 51, 234, 0.9),
            0 0 12px rgba(6, 182, 212, 0.9);
        }

        .rainbow-glow-title {
          font-size: 2.25rem;
          line-height: 2.5rem;
          font-weight: 900;
          color: #ffffff;
          text-shadow: 
            0 0 4px rgba(255, 255, 255, 0.8),
            0 0 10px rgba(255, 0, 150, 0.9),
            0 0 15px rgba(147, 51, 234, 0.9),
            0 0 20px rgba(6, 182, 212, 0.9);
        }

        .full-gradient-hover-effect {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          border-radius: 1rem;
          background: linear-gradient(to right, #ec4899, #a855f7, #06b6d4);
          opacity: 0;
          filter: blur(20px);
          transition: opacity 500ms ease-in-out;
          z-index: -10;
        }

        .group:hover .full-gradient-hover-effect {
          opacity: 1;
        }

        .glass-card-hover-effect {
          position: relative;
          background-color: rgba(255, 255, 255, 0.8);
          border-width: 1px;
          border-color: rgba(255, 255, 255, 0.3);
          border-radius: 1rem;
          padding: 1.5rem;
          transition: all 400ms ease-in-out;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }

        .glass-card-hover-effect:hover {
          border-color: #f472b6;
          background-color: rgba(255, 255, 255, 0.2);
          transform: scale(1.02);
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 15px rgba(236, 72, 153, 0.3);
        }

        .transparent-search-input {
          width: 100%;
          padding-top: 2rem;
          padding-bottom: 2rem;
          padding-left: 7rem;
          padding-right: 2.5rem;
          font-size: 1.875rem;
          line-height: 2.25rem;
          font-weight: 900;
          color: #ffffff;
          background-color: transparent;
          text-align: center;
        }

        .transparent-search-input:focus {
          outline: 0;
        }

        .transparent-search-input::placeholder {
          color: rgba(255, 255, 255, 0.7);
          font-weight: 700;
        }

        .element-overlay-positioned {
          position: absolute;
          left: 2rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          z-index: 20;
        }

        .icon-centered-left {
          position: absolute;
          left: 2rem;
          top: 50%;
          transform: translateY(-50%);
          width: 3rem;
          height: 3rem;
          color: #ffffff;
          z-index: 20;
          filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 10px #f472b6);
        }

        .glass-effect-container {
          position: relative;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(40px);
          border-radius: 9999px;
          border-width: 4px;
          border-color: rgba(255, 255, 255, 0.4);
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 8px rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .hero-section-title {
          position: relative;
          display: block;
          padding-left: 2.5rem;
          padding-right: 2.5rem;
          padding-top: 2rem;
          padding-bottom: 2rem;
          font-weight: 900;
          letter-spacing: 0.05em;
          color: #ffffff;
          filter: drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15)) drop-shadow(0 10px 10px rgba(0, 0, 0, 0.04));
          transform: translateY(-0.75rem);
          font-size: 3.75rem;
          line-height: 1;
          text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #f687b3;
          animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @media (min-width: 768px) {
          .hero-section-title {
            padding-left: 3.5rem;
            padding-right: 3.5rem;
            padding-top: 2.5rem;
            padding-bottom: 2.5rem;
            font-size: 4.5rem;
            line-height: 1;
            transform: translateY(-1rem);
          }
        }

        @media (min-width: 1024px) {
          .hero-section-title {
            padding-left: 5rem;
            padding-right: 5rem;
            padding-top: 3rem;
            padding-bottom: 3rem;
            font-size: 8rem;
            line-height: 1;
            transform: translateY(-1.25rem);
          }
        }

        @keyframes pulse-soft {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.9;
          }
        }

        .circular-icon-button {
          padding: 1rem;
          border-radius: 9999px;
          background-color: rgba(255, 255, 255, 0.3);
          transition: all 150ms ease-in-out;
        }

        @media (min-width: 768px) {
          .circular-icon-button {
            padding: 1.25rem;
          }
        }

        .circular-icon-button:hover {
          background-color: #fecaca;
          transform: scale(1.05);
        }

        .circular-icon-button:disabled {
          opacity: 0.5;
        }

        .button-icon-effect {
          background-color: rgba(255, 255, 255, 0.9);
          width: 1.5rem;
          height: 1.5rem;
          transition: transform 150ms ease-in-out;
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
          color: #ffffff;
          padding-left: 1rem;
          padding-right: 1rem;
          height: 2.5rem;
          font-weight: 700;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
        }

        @media (min-width: 768px) {
          .custom-element {
            height: 3rem;
          }
        }

        .custom-button {
          padding: 1rem;
          border-radius: 9999px;
          background-color: rgba(255, 255, 255, 0.3);
          transition: all 150ms ease-in-out;
        }

        .button {
          padding: 1rem 2rem;
          background-color: #ffffff;
          backdrop-filter: blur(8px);
          border-radius: 9999px;
          color: #000000;
          font-weight: 700;
          transition: background-color 150ms ease, transform 150ms ease;
        }

        .button:hover {
          background-color: rgba(255,255,255,0.6);
        }

        @media (min-width: 768px) {
          .custom-button {
            padding: 1.25rem;
          }
        }

        .custom-button:hover {
          background-color: #fecaca;
          transform: scale(1.05);
        }

        .custom-button:disabled {
          opacity: 0.5;
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
