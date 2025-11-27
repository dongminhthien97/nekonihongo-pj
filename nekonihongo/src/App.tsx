import { useState, useEffect } from "react";
import { SplashScreen } from "./components/SplashScreen";
import { LandingPage } from "./components/LandingPage";
import { VocabularyPage } from "./components/VocabularyPage";
import { GrammarPage } from "./components/GrammarPage";
import { KanjiPage } from "./components/KanjiPage";
import { FlashcardPage } from "./components/FlashcardPage";

type Page = "splash" | "landing" | "vocabulary" | "grammar" | "kanji" | "flashcard";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("splash");

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
      meta.content = "Học tiếng Nhật theo phong cách kawaii dễ thương cùng mèo Neko! Từ vựng, Ngữ pháp, Kanji và Flashcard giúp bạn học hiệu quả hơn.";
      document.head.appendChild(meta);
    }
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSplashComplete = () => {
    setCurrentPage("landing");
  };

  return (
    <div className="min-h-screen">
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
      {currentPage === "kanji" && (
        <KanjiPage onNavigate={handleNavigate} />
      )}
      {currentPage === "flashcard" && (
        <FlashcardPage onNavigate={handleNavigate} />
      )}
    </div>
  );
}