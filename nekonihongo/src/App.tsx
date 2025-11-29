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
import { Navigation } from "./components/Navigation";
type Page =
  | "splash"
  | "landing"
  | "vocabulary"
  | "grammar"
  | "kanji"
  | "flashcard"
  | "exercise";

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>("splash");

  useEffect(() => {
    if (!user) setCurrentPage("splash");
  }, [user]);

  const handleNavigate = (page: string) => {
    if (!user && page !== "splash") {
      alert("Mèo ơi, phải đăng nhập trước nha~");
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSplashComplete = () => {
    if (user) setCurrentPage("landing");
  };

  // CHƯA LOGIN → CHỈ ĐƯỢC XEM LOGINPAGE
  if (!user) return <LoginPage />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50">
      {/* 2. NỘI DUNG CHÍNH – Đẩy xuống để không bị navigation che */}
      <div className={currentPage === "splash" ? "pt-0" : "pt-24"}>
        {currentPage === "splash" && (
          <SplashScreen onComplete={handleSplashComplete} />
        )}
        {currentPage === "landing" && (
          <LandingPage onNavigate={handleNavigate} />
        )}
        {currentPage === "vocabulary" && (
          <VocabularyPage onNavigate={handleNavigate} />
        )}
        {currentPage === "grammar" && (
          <GrammarPage onNavigate={handleNavigate} />
        )}
        {currentPage === "kanji" && <KanjiPage onNavigate={handleNavigate} />}
        {currentPage === "flashcard" && (
          <FlashcardPage onNavigate={handleNavigate} />
        )}
        {currentPage === "exercise" && (
          <ExercisePage onNavigate={handleNavigate} />
        )}
      </div>
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
