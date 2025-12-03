import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SplashScreen } from "./components/SplashScreen";
import { LoginPage } from "./components/LoginPage";
import { LandingPage } from "./components/LandingPage";
import { VocabularyPage } from "./components/VocabularyPage";
import { GrammarPage } from "./components/GrammarPage";
import { KanjiPage } from "./components/KanjiPage";
import { FlashcardPage } from "./components/FlashcardPage";
import { ExercisePage } from "./components/ExercisePage";
import MyPage from "./pages/MyPage";

function AppContent() {
  const { user, hasSeenSplash, loading, markSplashAsSeen } = useAuth();

  // SEO metadata
  useEffect(() => {
    document.title = "Neko Nihongo - Học Tiếng Nhật Dễ Thương";

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Học tiếng Nhật theo phong cách kawaii dễ thương cùng mèo Neko! Từ vựng, Ngữ pháp, Kanji và Flashcard giúp bạn học hiệu quả hơn."
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content =
        "Học tiếng Nhật theo phong cách kawaii dễ thương cùng mèo Neko! Từ vựng, Ngữ pháp, Kanji và Flashcard giúp bạn học hiệu quả hơn.";
      document.head.appendChild(meta);
    }
  }, []);

  // 1. Đang load → hiện loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
        <div className="text-center animate-bounce-in">
          <div className="text-8xl mb-6 animate-bounce">🐱</div>
          <div className="w-16 h-16 border-4 border-[#FFC7EA]/30 border-t-[#FFC7EA] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 text-xl">にゃん…</p>
        </div>
        <style>{`
          @keyframes bounce-in {
            0% {
              opacity: 0;
              transform: scale(0.9);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-bounce-in {
            animation: bounce-in 0.5s ease-out;
          }
        `}</style>
      </div>
    );
  }

  // 2. Chưa đăng nhập → LoginPage (không splash)
  if (!user) {
    return <LoginPage />;
  }

  // 3. Đã đăng nhập + chưa thấy splash → hiện SplashScreen 1 lần duy nhất
  if (!hasSeenSplash) {
    return <SplashScreen onComplete={markSplashAsSeen} />;
  }

  // 4. Đã thấy splash → vào app bình thường
  return <MainApp />;
}

function MainApp() {
  const [currentPage, setCurrentPage] = useState<string>("landing");

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen page-transition">
      {currentPage === "landing" && <LandingPage onNavigate={handleNavigate} />}
      {currentPage === "vocabulary" && (
        <VocabularyPage onNavigate={handleNavigate} />
      )}
      {currentPage === "grammar" && <GrammarPage onNavigate={handleNavigate} />}
      {currentPage === "kanji" && <KanjiPage onNavigate={handleNavigate} />}
      {currentPage === "flashcard" && (
        <FlashcardPage onNavigate={handleNavigate} />
      )}
      {currentPage === "exercise" && (
        <ExercisePage onNavigate={handleNavigate} />
      )}
      {currentPage === "mypage" && <MyPage onNavigate={handleNavigate} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
