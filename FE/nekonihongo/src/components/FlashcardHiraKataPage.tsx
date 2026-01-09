import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Cat, Sparkles } from "lucide-react";
import { NekoLoading } from "../components/NekoLoading";
import { NekoAlertModal } from "../components/NekoAlertModal";

interface FlashcardItem {
  character: string;
  romanji: string;
}

interface FlashcardData {
  type: "hiragana" | "katakana";
  lessonTitle?: string;
  characters: FlashcardItem[];
  originPage?: string;
}

interface FlashcardHiraKataPageProps {
  onNavigate: (page: string) => void;
}

export function FlashcardHiraKataPage({
  onNavigate,
}: FlashcardHiraKataPageProps) {
  const [items, setItems] = useState<FlashcardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [flashcardData, setFlashcardData] = useState<FlashcardData | null>(
    null
  );
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    const loadingTimer = setTimeout(() => setIsLoading(false), 1000);

    const loadData = () => {
      const rawData = localStorage.getItem("nekoFlashcardHiraKata");
      if (!rawData) {
        setShowErrorModal(true);
        return;
      }

      try {
        const parsed: FlashcardData = JSON.parse(rawData);
        setFlashcardData(parsed);
        setItems(parsed.characters || []);
      } catch {
        setShowErrorModal(true);
      }
    };

    loadData();
    return () => clearTimeout(loadingTimer);
  }, []);

  if (isLoading) {
    return (
      <NekoLoading message="Mèo đang chuẩn bị flashcard HiraKata cho bạn nhé..." />
    );
  }

  if (showErrorModal || !flashcardData || items.length === 0) {
    return (
      <NekoAlertModal
        isOpen={true}
        onClose={() => onNavigate(flashcardData?.type || "landing")}
        title="Meow meow..."
        message="Không có dữ liệu flashcard! Mèo đưa bạn về trang trước nhé"
      />
    );
  }

  const currentItem = items[currentIndex];
  // Giữ nguyên logic tính % của Hirakata
  const progress =
    items.length > 0 ? ((currentIndex + 1) / items.length) * 100 : 0;

  const lessonTitle =
    flashcardData.lessonTitle ||
    `Flashcard ${flashcardData.type === "hiragana" ? "Hiragana" : "Katakana"}`;

  const handleFlip = () => setIsFlipped((prev) => !prev);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex === items.length - 1) {
      setShowEndModal(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowEndModal(false);
  };

  const handleReturn = () => {
    localStorage.removeItem("nekoFlashcardHiraKata");
    onNavigate(flashcardData.type);
  };

  return (
    <div className="soft-gradient-background">
      <main className="container mx-auto px-4 py-12 flex flex-col items-center">
        {/* Tiêu đề theo style Kanji */}
        <div className="pt-12 pb-6 px-4 flex flex-col items-center">
          <h1 className="text-center text-5xl md:text-6xl font-black text-white drop-shadow-2xl mb-8 hero-text-glow leading-tight">
            {lessonTitle}
          </h1>
        </div>

        {/* Progress Section (Giữ text đếm từ nhưng áp dụng style mới) */}
        <div className="w-full max-w-2xl mb-8">
          <div className="flex justify-between items-end mb-2 px-2">
            <span className="text-white font-bold text-xl drop-shadow-md">
              Ký tự{" "}
              <span className="text-yellow-300 text-2xl">
                {currentIndex + 1}
              </span>{" "}
              / {items.length}
            </span>
          </div>
          <div className="progress-bar-shell">
            <div
              className="progress-bar-fill-animated"
              style={{ width: `${progress}%` }}
            >
              <div className="bouncing-absolute-badge">🐾</div>
            </div>
          </div>
        </div>

        {/* Flashcard Area (3D Flip Effect) */}
        <div className="relative w-full max-w-2xl h-96 mb-12 perspective-1000">
          <div
            onClick={handleFlip}
            className={`flashcard-inner ${
              isFlipped ? "flipped" : ""
            } w-full h-full cursor-pointer`}
          >
            {/* Mặt trước: Chữ cái */}
            <div className="flashcard-front-face">
              <p className="huge-dark-title">{currentItem.character}</p>
              <p className="caption-text-muted">Nhấn để xem cách đọc</p>
              <Cat className="absolute-wiggle-icon" />
            </div>

            {/* Mặt sau: Romaji */}
            <div className="flashcard-back-face">
              <p className="centered-hero-text">{currentItem.romanji}</p>
              <p className="caption-text-white-subtle">Nhấn để quay lại</p>
              <Sparkles className="absolute-pulsing-icon" />
            </div>
          </div>
        </div>

        {/* Nút điều hướng style Glass và Gradient */}
        <div className="flex items-center justify-center gap-12 mt-16">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="interactive-glass-card"
          >
            <div className="gradient-blur-effect" />
            <ChevronLeft className="interactive-icon" strokeWidth={4} />
            <Cat className="bouncing-top-left-icon" />
          </button>

          <div className="relative">
            <Cat className="bouncing-pink-icon-shadow" strokeWidth={3} />
            <Sparkles className="absolute-pulsing-corner-icon" />
          </div>

          <button
            onClick={handleNext}
            className="interactive-gradient-cta-card"
          >
            <div className="glass-blur-effect" />
            <div className="flex-centered-text-row">
              <span className="heavy-shadowed-title">
                {currentIndex === items.length - 1 ? "XONG RỒI!" : "TIẾP THEO"}
              </span>
              {currentIndex !== items.length - 1 ? (
                <ChevronRight
                  className="pulsing-element-medium"
                  strokeWidth={5}
                />
              ) : (
                <span className="text-5xl bouncing-animation">🎉</span>
              )}
            </div>
            <Cat className="absolute-wiggle-corner-icon" />
          </button>
        </div>

        {/* Modal kết thúc style mới */}
        {showEndModal && (
          <div className="modal-backdrop-dark">
            <div className="modal-card-large">
              <div className="modal-icon-wrapper">
                <Cat className="bouncing-pink-icon-large" strokeWidth={2.5} />
                <Sparkles
                  className="absolute-pulsing-corner-icon"
                  style={{ top: "-10px", right: "30%" }}
                />
              </div>

              <h2 className="section-title-xl-bold">Siêu tuyệt vời!</h2>

              <p className="paragraph-large-spaced">
                Bạn đã hoàn thành bài học này một cách xuất sắc! <br />
                Mèo rất tự hào về sự chăm chỉ của bạn đấy! 🐾
              </p>

              <div className="modal-actions">
                <button
                  onClick={handleRestart}
                  className="gradient-cta-button-large w-full"
                >
                  Học lại từ đầu nhé!
                </button>
                <button
                  onClick={handleReturn}
                  className="gray-cta-button-large w-full"
                >
                  Về trang chính
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .soft-gradient-background {
          min-height: 100vh;
        }
        
        .perspective-1000 { perspective: 1000px; }
        
        .flashcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-style: preserve-3d;
        }
        
        .flashcard-inner.flipped { transform: rotateY(180deg); }
        
        .flashcard-front-face, .flashcard-back-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .flashcard-front-face { background-color: #ffffff; }
        
        .flashcard-back-face {
          background-image: linear-gradient(to bottom right, #ec4899, #7c3aed);
          transform: rotateY(180deg);
        }

        .huge-dark-title { font-size: 8rem; font-weight: 900; color: #1f2937; }
        .centered-hero-text { font-size: 6rem; font-weight: 900; color: #ffffff; text-align: center; }
        .caption-text-muted { font-size: 1.125rem; color: #6b7280; margin-top: 2rem; }
        .caption-text-white-subtle { font-size: 1.25rem; color: rgba(255, 255, 255, 0.9); margin-top: 1.5rem; }

        .progress-bar-shell {
          height: 2rem;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 9999px;
          overflow: hidden;
          box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.1);
        }

        .progress-bar-fill-animated {
          height: 100%;
          background-image: linear-gradient(to right, #f472b6, #7c3aed);
          transition: all 500ms ease-in-out;
          position: relative;
        }

        .hero-text-glow {
          text-shadow: 0 0 20px #ff69b4, 0 0 40px #a020f0, 0 4px 20px rgba(0, 0, 0, 0.5);
        }

        /* Buttons & Interactions */
        .interactive-glass-card {
          position: relative;
          padding: 1.5rem;
          background-color: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 1.5rem;
          transition: all 300ms;
        }
        .interactive-glass-card:hover:not([disabled]) { transform: scale(1.1); box-shadow: 0 0 20px rgba(236, 72, 153, 0.4); }
        .interactive-glass-card[disabled] { opacity: 0.5; cursor: not-allowed; }

        .interactive-gradient-cta-card {
          position: relative;
          padding: 1.5rem 3rem;
          background-image: linear-gradient(to bottom right, #ec4899, #7c3aed, #06b6d4);
          border-radius: 1.5rem;
          transition: all 500ms ease-in-out;
          overflow: hidden;
          color: white;
        }
        .interactive-gradient-cta-card:hover { transform: scale(1.05); box-shadow: 0 10px 30px rgba(6, 182, 212, 0.5); }

        .heavy-shadowed-title { font-size: 1.75rem; font-weight: 900; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.2)); }
        .flex-centered-text-row { display: flex; align-items: center; gap: 1rem; }

        /* Icons & Animations */
        @keyframes wiggle { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        .absolute-wiggle-icon { position: absolute; top: 1.5rem; right: 1.5rem; width: 3rem; height: 3rem; color: #f472b6; animation: wiggle 1s infinite; }
        
        @keyframes bounce { 0%, 100% { transform: translateY(-25%); } 50% { transform: translateY(0); } }
        .bouncing-absolute-badge { position: absolute; right: 0; top: 50%; transform: translate(50%, -50%); animation: bounce 1s infinite; }
        .bouncing-pink-icon-shadow { width: 5rem; height: 5rem; color: #ec4899; animation: bounce 1s infinite; filter: drop-shadow(0 10px 10px rgba(0,0,0,0.2)); }

/* --- MODAL STYLE MỚI --- */
.modal-backdrop-dark {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.8); /* Màu slate đậm */
  backdrop-filter: blur(8px); /* Làm mờ hậu cảnh cực đẹp */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-card-large {
  background: white;
  padding: 50px;
  border-radius: 40px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); /* Hiệu ứng hiện hình */
}

@keyframes modalIn {
  from { transform: scale(0.8) translateY(20px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.modal-icon-wrapper { 
  position: relative; 
  margin-bottom: 25px; 
}

.bouncing-pink-icon-large { 
  width: 100px; 
  height: 100px; 
  color: #ec4899; 
  margin: auto;
  animation: bounce 1s infinite;
}

.section-title-xl-bold { 
  font-size: 2.5rem; 
  font-weight: 900;
  color: #1e293b; 
  margin-bottom: 15px; 
  letter-spacing: -0.025em;
}

.paragraph-large-spaced { 
  font-size: 1.15rem; 
  color: #64748b; 
  line-height: 1.6; 
  margin-bottom: 35px; 
}

.modal-actions { 
  display: flex; 
  flex-direction: column; /* Xếp chồng các nút theo hàng dọc */
  gap: 15px; 
}

/* --- BUTTON STYLES (ĐÃ CÓ HOVER) --- */
.gradient-cta-button-large { 
  padding: 1.25rem 2rem; 
  background: linear-gradient(to right, #ec4899, #7c3aed); 
  color: white; 
  border-radius: 1.25rem; 
  font-size: 1.25rem;
  font-weight: 800; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(236, 72, 153, 0.3);
}

.gradient-cta-button-large:hover { 
  transform: scale(1.03) translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(236, 72, 153, 0.4);
  filter: brightness(1.1);
}

.gray-cta-button-large {
  padding: 1.25rem 2rem;
  background-color: #f1f5f9; /* Màu nền xám nhạt tinh tế hơn */
  color: #64748b; /* Màu chữ slate */
  border-radius: 1.25rem;
  font-size: 1.2rem;
  font-weight: 700;
  transition: all 300ms ease-in-out;
  border: none;
  cursor: pointer;
}

.gray-cta-button-large:hover {
  background-color: #e2e8f0;
  color: #1e293b;
  transform: scale(1.03);
}

.gray-cta-button-large:active {
  transform: scale(0.98);
}

/* Helper class */
.w-full { width: 100%; }
      `}</style>
    </div>
  );
}
