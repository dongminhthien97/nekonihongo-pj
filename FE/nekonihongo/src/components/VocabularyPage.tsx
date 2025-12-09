// VocabularyPage.tsx
import { useState, useMemo, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Cat, Sparkles } from "lucide-react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Background } from "./Background";
import api from "../api/auth";

interface Word {
  japanese: string;
  kanji: string;
  vietnamese: string;
  category?: string;
}

interface Lesson {
  id: number;
  title: string;
  icon: string;
  words: Word[];
}

interface VocabularyPageProps {
  onNavigate: (page: string) => void;
}
const localVocabularyLessons: Lesson[] = [];

export function VocabularyPage({ onNavigate }: VocabularyPageProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lessonPage, setLessonPage] = useState(1);
  const [wordPage, setWordPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const LESSONS_PER_PAGE = 12;
  const WORDS_PER_PAGE = 12;

  // LẤY DỮ LIỆU THẬT TỪ BACKEND
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Diagnostic logs to help debug 401 Unauthorized
        const token = localStorage.getItem("accessToken");
        console.debug("VocabularyPage: accessToken present:", !!token);
        if (token)
          console.debug(
            "VocabularyPage: accessToken (head):",
            token.slice(0, 12) + "..."
          );
        console.debug("VocabularyPage: api.baseURL", api.defaults.baseURL);

        const res = await api.get("/vocabulary/lessons");
        setLessons(res.data.data || []);
      } catch (err: any) {
        if (err.response?.status === 401) {
          console.warn(
            "VocabularyPage: received 401 from /vocabulary/lessons — falling back to local data and redirecting to login."
          );
          setLessons(localVocabularyLessons || []);
          alert("Phiên đăng nhập hết hạn! Đang chuyển về trang đăng nhập...");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("nekoUser");
          onNavigate("login");
          return;
        }
        setError("Không thể tải từ vựng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [onNavigate]);
  const handleStartFlashcard = () => {
    if (!selectedLesson) {
      alert("Mèo chưa thấy bài nào để học flashcard cả!");
      return;
    }

    const allWords = selectedLesson.words;
    if (allWords.length === 0) {
      alert("Bài này chưa có từ vựng nào! Mèo buồn quá...");
      return;
    }

    // Tạo 10 từ ngẫu nhiên (cho phép trùng nếu bài ít hơn 10 từ)
    let selectedWords = [...allWords];
    if (selectedWords.length > 10) {
      selectedWords = selectedWords
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
    }

    // LƯU DỮ LIỆU – QUAN TRỌNG NHẤT!!!
    const flashcardData = {
      lessonId: selectedLesson.id,
      lessonTitle: selectedLesson.title,
      icon: selectedLesson.icon || "Cat",
      words: selectedWords,
      totalWordsInLesson: allWords.length,
    };

    // DÙNG CHÍNH XÁC TÊN KEY NÀY → KHÔNG ĐƯỢC SAI 1 KÝ TỰ!
    localStorage.setItem("nekoFlashcardData", JSON.stringify(flashcardData));

    // LƯU TOÀN BỘ TỪ ĐỂ HỌC TIẾP (BẮT BUỘC!)
    localStorage.setItem("nekoFlashcardAllWords", JSON.stringify(allWords));

    console.log("Đã lưu flashcard data vào localStorage!", flashcardData);

    // Chuyển trang
    onNavigate("flashcard");
  };
  // TÌM KIẾM THẬT TỪ BACKEND
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const fetchSearch = async () => {
      try {
        const res = await api.get(
          `/vocabulary/search?q=${encodeURIComponent(searchQuery)}`
        );
        return res.data.data || [];
      } catch {
        return [];
      }
    };
    // Vì useMemo không hỗ trợ async trực tiếp → dùng trick
    let results: { word: Word; lessonId: number }[] = [];
    if (searchQuery) {
      // Bạn có thể gọi API thật ở đây nếu muốn, tạm thời dùng client-side search
      const query = searchQuery.toLowerCase();
      lessons.forEach((lesson) => {
        lesson.words.forEach((word) => {
          if (
            word.japanese.toLowerCase().includes(query) ||
            word.kanji.toLowerCase().includes(query) ||
            word.vietnamese.toLowerCase().includes(query)
          ) {
            results.push({ word, lessonId: lesson.id });
          }
        });
      });
    }
    return results.slice(0, 20);
  }, [searchQuery, lessons]);

  // Phân trang bài học
  const totalLessonPages = Math.ceil(lessons.length / LESSONS_PER_PAGE);
  const currentLessons = lessons.slice(
    (lessonPage - 1) * LESSONS_PER_PAGE,
    lessonPage * LESSONS_PER_PAGE
  );

  // Phân trang từ vựng
  const currentWords = selectedLesson
    ? selectedLesson.words.slice(
        (wordPage - 1) * WORDS_PER_PAGE,
        wordPage * WORDS_PER_PAGE
      )
    : [];
  const totalWordPages = selectedLesson
    ? Math.ceil(selectedLesson.words.length / WORDS_PER_PAGE)
    : 0;
  // Loading & Error
  // if (loading) {
  //   return (
  //     <div className="full-screen-gradient-center">
  //       <div className="text-center">
  //         <div className="w-32 h-32 mx-auto mb-8">
  //           <img
  //             src="/neko-loading.gif"
  //             alt="Neko đang tải..."
  //             className="w-full h-full"
  //           />
  //         </div>
  //         <p className="text-4xl font-bold text-white animate-pulse">
  //           Đang tải từ vựng mèo...
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-3xl font-bold text-red-400">{error}</p>
      </div>
    );
    0;
  }

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
            <span className="hero-section-title hero-text-glow">
              Từ Vựng Tiếng Nhật
            </span>
          </h1>
          {/* THANH TÌM KIẾM SIÊU ĐỈNH – VIỀN NỔI BẬT + TEXT CĂN GIỮA */}
          <div className="max-w-4xl mx-auto">
            <div className="relative group ">
              {/* VIỀN NEON CHẠY VÒNG QUANH – SIÊU SÁNG, SIÊU ĐẸP */}
              {/* <div className="gradient-border-effect" /> */}

              {/* VIỀN NEON THỨ 2 – TĂNG ĐỘ DÀY + SÁNG */}
              {/* <div className="pulsing-gradient-aura" /> */}

              {/* Thanh input chính – nền trắng mờ, viền sáng, bóng đẹp */}
              <div className="glass-effect-container animate-fade-in">
                {/* ICON TÌM KIẾM SIÊU NỔI */}
                <div className="element-overlay-positioned">
                  <Search className="icon-centered-left" strokeWidth={5} />
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
                  className="transparent-search-input"
                />
              </div>
            </div>
            {/* Kết quả tìm kiếm – CARD SIÊU TO */}
            {searchResults.length > 0 && (
              <div className="mt-10 max-w-4xl mx-auto space-y-4 animate-fade-in">
                <p className="pulsing-centered-text">
                  Tìm thấy {searchResults.length} kết quả
                </p>
                {searchResults.map(({ word, lessonId }, idx) => (
                  <div key={idx} className="glass-card-hover-effect">
                    <div className="full-gradient-hover-effect" />
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1 text-left">
                        <p className="rainbow-glow-title">{word.japanese}</p>
                        <p className="small-rainbow-glow">{word.kanji}</p>
                      </div>
                      <div className="text-right">
                        <p className="white-rainbow-glow-bold">
                          {word.vietnamese}
                        </p>
                        <p className="small-white-rainbow-glow">
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
              <div
                key={lessonPage}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-4 gap-8 mb-16"
              >
                {currentLessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setSelectedLesson(lesson);
                      setWordPage(1);
                      setSearchQuery("");
                    }}
                    className="responsive-hover-card animate-fade-in"
                  >
                    <div className="text-gray-800 animate-pulse-soft">
                      {/* MÈO SIÊU DỄ THƯƠNG – MẶC ĐỊNH CHO MỌI BÀI! */}
                      <Cat className="relative w-full h-full" />
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

              {/* Phân trang bài học — đồng bộ với style phân trang từ vựng */}
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
          /* Trong bài học – từ vựng + phân trang */
          <div className="max-w-7xl mx-auto">
            <div className="flex  items-center justify-right mb-10">
              <div className="w-full  flex flex-col items-center gap-4">
                <h2 className=" text-3xl hero-text-glow text-white">
                  {selectedLesson.title}
                </h2>
                <div className="flex justify-center mt-16 mb-10">
                  <button
                    onClick={handleStartFlashcard}
                    className="group relative px-16 py-10 bg-gradient-to-br from-pink-500 via-purple-600 to-cyan-500 rounded-3xl shadow-2xl hover:shadow-pink-500/70 transform hover:scale-110 transition-all duration-500 overflow-hidden"
                  >
                    {/* Hiệu ứng glow neon + mèo bay */}
                    <div className="absolute inset-0 bg-white/30 blur-2xl group-hover:blur-3xl transition-all duration-700" />
                    <div className="absolute -inset-4 bg-gradient-to-r from-pink-400/50 via-purple-500/50 to-cyan-400/50 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="text-left">
                      <p className="text-5xl font-black drop-shadow-2xl tracking-wider">
                        HỌC FLASHCARD
                      </p>
                      <p className="text-2xl font-bold opacity-90 mt-2">
                        10 từ ngẫu nhiên • Siêu thú vị • Có mèo!
                      </p>
                      {/* Hiệu ứng lấp lánh */}
                      <Sparkles className="w-16 h-16 animate-pulse" />
                      <Sparkles className="w-12 h-12 animate-pulse delay-75" />
                    </div>
                  </button>
                </div>
                <button
                  onClick={() => setSelectedLesson(null)}
                  className="button"
                >
                  ← Tất cả bài học
                </button>
              </div>
            </div>
            <div
              key={`${selectedLesson?.id || "none"}-${wordPage}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-4"
            >
              {currentWords.map((word, idx) => (
                <div key={idx} className="glassmorphism-card animate-fade-in">
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
                          : "button-icon-effect"
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
