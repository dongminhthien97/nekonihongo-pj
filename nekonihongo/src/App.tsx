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
  const [currentPage, setCurrentPage] = useState<Page>("splash");

  useEffect(() => {
    // Nếu chưa login → luôn vào login
    if (!user) {
      setCurrentPage("splash");
      // Không làm gì thêm, sẽ tự redirect về login ở LoginPage
    }
  }, [user]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSplashComplete = () => {
    if (user) {
      setCurrentPage("landing");
    }
  };

  // Nếu chưa login → hiện LoginPage
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen">
      {currentPage === "splash" && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
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
