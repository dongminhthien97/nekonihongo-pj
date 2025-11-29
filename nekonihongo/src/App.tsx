// src/App.tsx
import { useState, useEffect } from "react";
import { SplashScreen } from "./components/SplashScreen";
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

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("splash");

  // SEO metadata
  useEffect(() => {
    const titles: Record<Page, string> = {
      splash: "Neko Nihongo",
      landing: "Neko Nihongo - Học Tiếng Nhật Dễ Thương",
      vocabulary: "Từ Vựng Tiếng Nhật - Neko Nihongo",
      grammar: "Ngữ Pháp Tiếng Nhật - Neko Nihongo",
      kanji: "Kanji Tiếng Nhật - Neko Nihongo",
      flashcard: "Flashcard Tiếng Nhật - Neko Nihongo",
      exercise: "Bài Tập Tiếng Nhật - Neko Nihongo", // ĐÃ THÊM TIÊU ĐỀ CHO EXERCISE!!!
    };

    document.title = titles[currentPage];

    const metaDescription = document.querySelector('meta[name="description"]');
    const desc =
      "Học tiếng Nhật siêu dễ thương cùng mèo Neko! Từ vựng, Kanji, Ngữ pháp, Flashcard và Bài tập trắc nghiệm kawaii!";

    if (metaDescription) {
      metaDescription.setAttribute("content", desc);
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = desc;
      document.head.appendChild(meta);
    }
  }, [currentPage]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSplashComplete = () => {
    setCurrentPage("landing");
  };

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
