// src/pages/FlashcardPage.tsx
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Cat, Sparkles } from "lucide-react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Background } from "./Background";
import api from "../api/auth";

interface Word {
  japanese: string;
  kanji: string;
  vietnamese: string;
}

interface FlashcardData {
  lessonId: number;
  lessonTitle: string;
  words: Word[];
}

export function FlashcardPage({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("Flashcard Mèo");

  // Lấy dữ liệu từ localStorage khi vào trang
  useEffect(() => {
    const data = localStorage.getItem("nekoFlashcardData");
    if (data) {
      const parsed: FlashcardData = JSON.parse(data);
      setWords(parsed.words);
      setLessonTitle(parsed.lessonTitle);
      localStorage.removeItem("nekoFlashcardData"); // xóa sau khi dùng
    }
  }, []);

  const currentWord = words[currentIndex];
  const progress =
    words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  const handleFlip = () => setIsFlipped(!isFlipped);
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };
  const handleNext = () => {
    if (currentIndex === words.length - 1) {
      setShowEndModal(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handleContinue = () => {
    console.log("Mèo vui quá! Bạn bấm Học tiếp rồi!");

    const allWordsJson = localStorage.getItem("nekoFlashcardAllWords");
    if (!allWordsJson) {
      alert("Mèo lạc mất danh sách từ rồi! Về trang từ vựng nhé...");
      onNavigate("vocabulary");
      return;
    }

    const allWords: Word[] = JSON.parse(allWordsJson);

    // Tạo 10 từ mới – CHO PHÉP TRÙNG (siêu tự nhiên!)
    const newWords = Array.from(
      { length: 10 },
      () => allWords[Math.floor(Math.random() * allWords.length)]
    );

    setWords((prev) => [...prev, ...newWords]);
    setCurrentIndex((prev) => prev + 1);
    setIsFlipped(false);
    setShowEndModal(false);

    // MÈO VUI MỪNG KHI BẠN HỌC TIẾP!
    alert("Mèo đã chuẩn bị thêm 10 từ mới cho bạn rồi! Meow meow!!!");
  };

  if (words.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
        <div className="text-center">
          <Cat className="w-32 h-32 mx-auto mb-8 animate-bounce text-pink-400" />
          <p className="text-4xl font-bold text-white">
            Đang chuẩn bị flashcard mèo...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF6E9] via-[#FFC7EA]/20 to-[#D8C8FF]/30">
      <Navigation currentPage="flashcard" onNavigate={onNavigate} />
      <Background />

      <main className="container mx-auto px-4 py-12 flex flex-col items-center">
        <h1 className="text-center text-5xl font-black text-white drop-shadow-2xl mb-10 hero-text-glow">
          {lessonTitle}
        </h1>

        {/* Progress Bar */}
        <div className="w-full max-w-2xl mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Tiến độ</span>
            <span>
              {currentIndex + 1} / {words.length}
            </span>
          </div>
          <div className="h-4 bg-white rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-pink-400 to-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-xl animate-paw-walk"></div>
            </div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="relative w-full max-w-2xl h-96 mb-12 perspective-1000">
          <div
            onClick={handleFlip}
            className={`flashcard-inner ${
              isFlipped ? "flipped" : ""
            } w-full h-full cursor-pointer`}
          >
            <div className="flashcard-face flashcard-front absolute inset-0 bg-white rounded-[32px] shadow-2xl flex flex-col items-center justify-center p-8 backface-hidden">
              <p className="text-8xl font-black text-gray-800">
                {currentWord.japanese}
              </p>
              {currentWord.kanji &&
                currentWord.kanji !== currentWord.japanese && (
                  <p className="text-5xl text-purple-500 mt-4 opacity-80">
                    {currentWord.kanji}
                  </p>
                )}
              <p className="text-lg text-gray-500 mt-8">Nhấn để xem nghĩa</p>
              <Cat className="absolute top-6 right-6 w-12 h-12 text-pink-400 animate-wiggle" />
            </div>

            <div className="flashcard-face flashcard-back absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-[32px] shadow-2xl flex flex-col items-center justify-center p-8 backface-hidden">
              <p className="text-6xl font-black text-white text-center">
                {currentWord.vietnamese}
              </p>
              <p className="text-xl text-white/90 mt-6">Nhấn để quay lại</p>
              <Sparkles className="absolute top-6 right-6 w-12 h-12 text-yellow-300 animate-pulse" />
            </div>
          </div>
        </div>

        {/* NÚT ĐIỀU HƯỚNG – SIÊU ĐẸP, SIÊU RÕ, SIÊU MÈO, KHÔNG THỂ KHÔNG THẤY! */}
        <div className="flex items-center justify-center gap-12 mt-16">
          {/* NÚT TRƯỚC – TO, ĐẸP, CÓ MÈO */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="group relative p-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-pink-500/50 transform hover:scale-110 disabled:opacity-40 disabled:hover:scale-100 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-purple-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            <ChevronLeft
              className="w-16 h-16 text-purple-600 group-hover:text-purple-800 transition-colors"
              strokeWidth={4}
            />
            <Cat className="absolute -top-4 -left-4 w-12 h-12 text-pink-500 animate-bounce" />
          </button>

          {/* MÈO Ở GIỮA – SIÊU DỄ THƯƠNG */}
          <div className="relative">
            <Cat
              className="w-24 h-24 text-pink-500 animate-bounce drop-shadow-2xl"
              strokeWidth={3}
            />
            <Sparkles className="absolute -top-4 -right-4 w-10 h-10 text-yellow-400 animate-pulse" />
            <Sparkles className="absolute -bottom-4 -left-4 w-8 h-8 text-purple-400 animate-pulse delay-300" />
          </div>

          {/* NÚT TIẾP THEO / HOÀN THÀNH – TO NHẤT, ĐẸP NHẤT */}
          <button
            onClick={handleNext}
            className="group relative px-16 py-10 bg-gradient-to-br from-pink-500 via-purple-600 to-cyan-500 rounded-3xl shadow-2xl hover:shadow-cyan-500/70 transform hover:scale-110 transition-all duration-500 overflow-hidden"
          >
            {/* Hiệu ứng glow */}
            <div className="absolute inset-0 bg-white/30 blur-2xl group-hover:blur-3xl transition-all duration-700" />
            <div className="absolute -inset-2 bg-gradient-to-r from-pink-400/50 to-cyan-400/50 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative flex items-center gap-6 text-white">
              <span className="text-4xl font-black drop-shadow-2xl">
                {currentIndex === words.length - 1
                  ? "HOÀN THÀNH!"
                  : "TIẾP THEO"}
              </span>
              {currentIndex !== words.length - 1 && (
                <ChevronRight
                  className="w-14 h-14 animate-pulse"
                  strokeWidth={5}
                />
              )}
              {currentIndex === words.length - 1 && (
                <div className="flex gap-2">
                  <span className="text-6xl animate-bounce">PARTY</span>
                  <span className="text-6xl animate-bounce delay-100">
                    PARTY
                  </span>
                  <span className="text-6xl animate-bounce delay-200">
                    PARTY
                  </span>
                </div>
              )}
            </div>

            {/* Mèo nhỏ ở góc */}
            <Cat className="absolute -bottom-6 -right-6 w-16 h-16 text-white/80 animate-wiggle" />
          </button>
        </div>

        {/* Modal học tiếp */}
        {showEndModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-12 max-w-lg text-center shadow-2xl">
              <Cat className="w-32 h-32 mx-auto mb-6 text-pink-500 animate-bounce" />
              <h2 className="text-5xl font-black text-purple-600 mb-4">
                Siêu giỏi!
              </h2>
              <p className="text-2xl text-gray-700 mb-10">
                Bạn đã học xong 10 từ! Mèo tự hào về bạn lắm!
              </p>
              <div className="flex gap-8 justify-center">
                <button
                  onClick={handleContinue}
                  className="px-12 py-6 bg-gradient-to-r from-pink-500 to-purple-600 text-black rounded-2xl text-2xl font-bold hover:scale-110 transition-all"
                >
                  Học tiếp 10 từ nữa!
                </button>
                <button
                  onClick={() => onNavigate("vocabulary")}
                  className="px-12 py-6 bg-gray-400 text-black rounded-2xl text-2xl font-bold hover:scale-105 transition-all"
                >
                  Về trang từ vựng
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <style>{`
      @keyframes wiggle {
    0%, 100% { transform: rotate(-10deg); }
    50% { transform: rotate(10deg); }
  }
  .animate-wiggle { animation: wiggle 2s ease-in-out infinite; }
        .perspective-1000 {
          perspective: 1000px;
        }
        .flashcard-inner {
          transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-style: preserve-3d;
        }
        .flashcard-inner.flipped {
          transform: rotateY(180deg);
        }
        .flashcard-face {
          backface-visibility: hidden;
        }
        .flashcard-back {
          transform: rotateY(180deg);
        }
        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(-8deg);
          }
          50% {
            transform: rotate(8deg);
          }
        }
        @keyframes bounce-cat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-wiggle {
          animation: wiggle 2s infinite;
        }
        .animate-bounce-cat {
          animation: bounce-cat 2s infinite;
        }
        .hero-text-glow {
          text-shadow: 0 0 30px rgba(255, 105, 180, 0.8),
            0 0 60px rgba(160, 32, 240, 0.6);
        }
      `}</style>
    </div>
  );
}
