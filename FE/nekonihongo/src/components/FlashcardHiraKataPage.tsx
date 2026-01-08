// pages/FlashcardHiraKataPage.tsx
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Cat, Sparkles } from "lucide-react";
import { NekoLoading } from "../components/NekoLoading";
import { NekoAlertModal } from "../components/NekoAlertModal";
import type { FlashcardData } from "./types/hirakata";

interface FlashcardHiraKataPageProps {
  onNavigate?: (
    page: string,
    params?: { category?: string; level?: string }
  ) => void;
}

export function FlashcardHiraKataPage({
  onNavigate,
}: FlashcardHiraKataPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [flashcardData, setFlashcardData] = useState<FlashcardData | null>(
    null
  );
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);

    const data = localStorage.getItem("nekoFlashcardHiraKata");
    if (!data) {
      setShowErrorModal(true);
      return;
    }

    try {
      setFlashcardData(JSON.parse(data));
    } catch (err) {
      setShowErrorModal(true);
    }

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <NekoLoading message="Mèo đang chuẩn bị flashcard siêu dễ thương..." />
    );
  }

  if (showErrorModal || !flashcardData) {
    return (
      <NekoAlertModal
        isOpen={true}
        onClose={() =>
          onNavigate ? onNavigate("/") : (window.location.href = "/")
        }
        title="Meow meow..."
        message="Không có dữ liệu flashcard! Quay về trang chủ nhé"
      />
    );
  }

  const items = flashcardData.items;
  const currentItem = items[currentIndex];
  const progress = ((currentIndex + 1) / items.length) * 100;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setShowEndModal(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowEndModal(false);
  };

  const handleReturn = () => {
    localStorage.removeItem("nekoFlashcardHiraKata");
    if (flashcardData.type === "hiragana") {
      if (onNavigate) onNavigate("hiragana");
      else window.location.href = "/hiragana";
    } else {
      if (onNavigate) onNavigate("katakana");
      else window.location.href = "/katakana";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Flashcard{" "}
            {flashcardData.type === "hiragana" ? "Hiragana" : "Katakana"}
          </h1>
          <p className="text-gray-600">Ôn tập bảng chữ cái tiếng Nhật</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-2xl mx-auto mb-8">
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>
              Thẻ {currentIndex + 1}/{items.length}
            </span>
            <span>{Math.round(progress)}% hoàn thành</span>
          </div>
        </div>

        {/* Flashcard */}
        <div className="relative w-full max-w-2xl h-96 mx-auto mb-12">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`w-full h-full cursor-pointer transition-all duration-500 preserve-3d ${
              isFlipped ? "rotate-y-180" : ""
            }`}
          >
            {/* Front */}
            <div className="absolute w-full h-full bg-white rounded-3xl shadow-2xl flex items-center justify-center backface-hidden">
              <div className="text-center p-8">
                <div className="text-9xl font-bold text-gray-800 mb-6">
                  {currentItem.character}
                </div>
                <p className="text-gray-500">Nhấn để xem cách đọc</p>
                <Cat className="w-16 h-16 text-gray-300 mx-auto mt-6" />
              </div>
            </div>

            {/* Back */}
            <div className="absolute w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-2xl flex items-center justify-center backface-hidden rotate-y-180">
              <div className="text-center p-8">
                <div className="text-4xl font-bold text-white mb-4">
                  Cách đọc:
                </div>
                <div className="text-6xl font-black text-white mb-6">
                  {currentItem.romanji}
                </div>
                <p className="text-white/80">Nhấn để quay lại ký tự</p>
                <Sparkles className="w-16 h-16 text-white/50 mx-auto mt-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-8">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all ${
              currentIndex === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:scale-105"
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
            Trước
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-105 transition-all"
          >
            {currentIndex < items.length - 1 ? "Tiếp theo" : "Hoàn thành!"}
            {currentIndex < items.length - 1 && (
              <ChevronRight className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* End Modal */}
        {showEndModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
              <div className="text-center">
                <div className="text-8xl mb-6">🎉</div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                  Hoàn thành!
                </h3>
                <p className="text-gray-600 mb-8">
                  Bạn đã ôn tập xong toàn bộ {items.length} ký tự{" "}
                  {flashcardData.type}!
                </p>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleRestart}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Ôn tập lại
                  </button>
                  <button
                    onClick={handleReturn}
                    className="w-full py-4 bg-gray-100 text-gray-800 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                  >
                    Quay về bảng {flashcardData.type}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add CSS for 3D flip */}
      <style>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
