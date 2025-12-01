// src/App.tsx
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

function AppContent() {
  const { user, hasSeenSplash, loading, markSplashAsSeen } = useAuth();

  // 1. Đang load → hiện trắng (hoặc loading spinner nhẹ)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
        <div className="text-4xl text-purple-600">にゃん…</div>
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
    <div className="min-h-screen  page-transition bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 pt-24">
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
