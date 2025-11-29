import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Background } from "./Background";

interface FlashcardPageProps {
  onNavigate: (page: string) => void;
}

const flashcardData = [
  { front: "猫", back: "Mèo (neko)" },
  { front: "本", back: "Sách (hon)" },
  { front: "学校", back: "Trường học (gakkou)" },
  { front: "先生", back: "Giáo viên (sensei)" },
  { front: "友達", back: "Bạn bè (tomodachi)" },
  { front: "食べる", back: "Ăn (taberu)" },
  { front: "飲む", back: "Uống (nomu)" },
  { front: "行く", back: "Đi (iku)" },
  { front: "来る", back: "Đến (kuru)" },
  { front: "見る", back: "Nhìn (miru)" },
];

export function FlashcardPage({ onNavigate }: FlashcardPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcardData.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex(
      (prev) => (prev - 1 + flashcardData.length) % flashcardData.length
    );
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const progress = ((currentIndex + 1) / flashcardData.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF6E9] via-[#FFC7EA]/20 to-[#D8C8FF]/30">
      {/* Navigation */}
      <Navigation currentPage="flashcard" onNavigate={onNavigate} />
      <Background />
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-12 flex flex-col items-center">
        <div className="text-center mb-12 relative z-10 animate-float hero-text-glow">
          <h2 className="text-5xl md:text-5xl font-extrabold text-white bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,199,234,0.8)]">
            Luyện Tập Flashcard 🎴
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-white drop-shadow-2xl">
            Nhấn vào thẻ để lật và xem đáp án! 🐾
          </p>
        </div>

        {/* Progress Bar with Paw Prints */}
        <div className="w-full max-w-2xl mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tiến độ học</span>
            <span className="text-sm text-gray-600">
              {currentIndex + 1} / {flashcardData.length}
            </span>
          </div>
          <div className="relative h-4 bg-white rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#FFC7EA] to-[#D8C8FF] rounded-full transition-all duration-500 relative"
              style={{ width: `${progress}%` }}
            >
              {/* Animated paw at the end of progress */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-xl animate-paw-walk">
                🐾
              </div>
            </div>
          </div>
        </div>

        {/* Flashcard Container */}
        <div className="relative w-full max-w-2xl h-96 mb-8 perspective-1000">
          <div
            onClick={handleFlip}
            className={`flashcard-inner ${
              isFlipped ? "flipped" : ""
            } w-full h-full cursor-pointer`}
          >
            {/* Front Side */}
            <div className="flashcard-face flashcard-front absolute w-full h-full bg-white rounded-[32px] shadow-2xl flex flex-col items-center justify-center p-8 backface-hidden">
              <div className="text-8xl mb-4 text-gray-800">
                {flashcardData[currentIndex].front}
              </div>
              <div className="text-lg text-gray-500 mt-4">
                Nhấn để xem nghĩa
              </div>
              <div className="absolute top-6 right-6 text-3xl animate-wiggle">
                😺
              </div>
              <div className="absolute bottom-6 left-6 text-2xl opacity-50">
                🌸
              </div>
            </div>

            {/* Back Side */}
            <div className="flashcard-face flashcard-back absolute w-full h-full bg-gradient-to-br from-[#FFC7EA] to-[#D8C8FF] rounded-[32px] shadow-2xl flex flex-col items-center justify-center p-8 backface-hidden">
              <div className="text-5xl mb-4 text-white">
                {flashcardData[currentIndex].back}
              </div>
              <div className="text-lg text-white/90 mt-4">Nhấn để quay lại</div>
              <div className="absolute top-6 right-6 text-3xl animate-wiggle">
                😺
              </div>
              <div className="absolute bottom-6 left-6 text-2xl opacity-70">
                ✨
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-6">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-[24px] shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Trước</span>
          </button>

          <div className="text-4xl animate-bounce-cat">🐱</div>

          <button
            onClick={handleNext}
            disabled={currentIndex === flashcardData.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-[24px] shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span>Sau</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Decoration */}
        <div className="text-center mt-16 space-y-4">
          <div className="flex justify-center gap-4">
            <span className="text-3xl animate-float">💪</span>
            <span className="text-3xl animate-float delay-1">✨</span>
            <span className="text-3xl animate-float delay-2">🎉</span>
          </div>
          <p className="text-lg text-gray-600">
            Học flashcard thật vui phải không! Tiếp tục nào! 📚
          </p>
        </div>
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
      {/* Footer */}
      <Footer />

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }

        .flashcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flashcard-inner.flipped {
          transform: rotateY(180deg);
        }

        .flashcard-face {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }

        .flashcard-back {
          transform: rotateY(180deg);
        }

        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }

        @keyframes bounce-cat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.1); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes paw-walk {
          0%, 100% { transform: translateY(-50%) translateX(50%) rotate(0deg); }
          50% { transform: translateY(-50%) translateX(50%) rotate(10deg) scale(1.1); }
        }

        .animate-wiggle {
          animation: wiggle 1.5s ease-in-out infinite;
        }

        .animate-bounce-cat {
          animation: bounce-cat 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-paw-walk {
          animation: paw-walk 1s ease-in-out infinite;
        }

        .delay-1 {
          animation-delay: 0.3s;
        }

        .delay-2 {
          animation-delay: 0.6s;
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
      `}</style>
    </div>
  );
}
