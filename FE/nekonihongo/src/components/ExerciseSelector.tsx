// src/components/ExerciseSelector.tsx
import { useState, useEffect } from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Background } from "./Background";
import api from "../api/auth";
import toast from "react-hot-toast";

interface Category {
  id: number;
  name: string; // VOCABULARY, GRAMMAR, KANJI
  displayName: string; // Từ vựng, Ngữ pháp, Kanji
  description: string;
}

interface Level {
  id: number;
  level: string; // N5, N4...
  displayName: string; // JLPT N5
}

export function ExerciseSelector({
  onNavigate,
}: {
  onNavigate: (page: string, params?: any) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Lấy data từ DB khi load trang
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [catRes, levelRes] = await Promise.all([
          api.get("/categories"),
          api.get("/levels"),
        ]);

        setCategories(catRes.data);
        setLevels(
          levelRes.data.sort((a: Level, b: Level) =>
            // Sắp xếp N5 → N1 (theo thứ tự giảm dần level)
            b.level.localeCompare(a.level)
          )
        );

        toast.success("Mèo đã chuẩn bị sẵn bài tập cho bạn rồi! 😻");
      } catch (err) {
        toast.error("Không tải được dữ liệu. Mèo đang sửa đây... 😿");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleLevelSelect = (level: Level) => {
    const categoryId = selectedCategory?.id;
    const levelId = level.id;

    // Chỉ có N5 Từ vựng hiện tại
    if (selectedCategory?.name === "VOCABULARY" && level.level === "N5") {
      onNavigate("exercise-n5");
    } else {
      toast("Bài tập JLPT N4 sẽ sớm ra mắt nhé! 😺", {
        icon: "ℹ️", // hoặc "📢", "🔔", "✨"
        duration: 5000,
      });
    }
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-4xl text-white animate-pulse">
          Mèo đang chuẩn bị... 🐱
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Navigation currentPage="exercise" onNavigate={onNavigate} />
      <Background />

      <main className="relative z-10 container mx-auto px-4 py-16 md:py-24 animate-fade-in">
        <div className="text-center mb-16 md:mb-24">
          <h1 className="hero-section-title hero-text-glow">
            {!selectedCategory
              ? "Chọn loại bài tập"
              : `Bài tập ${selectedCategory.displayName}`}
          </h1>
          <p className="lead-text">
            {!selectedCategory
              ? "Mèo đã chuẩn bị sẵn các loại bài tập siêu hay cho bạn rồi đấy! 🐾"
              : "Chọn cấp độ bạn muốn luyện tập nào!"}
          </p>
        </div>

        {/* Bước 1: Chọn loại bài tập */}
        {!selectedCategory && (
          <div className="grid-container">
            {categories.map((cat, index) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat)}
                className="glass-card group"
                style={{ animationDelay: `${0.3 + index * 0.2}s` }}
              >
                <div className="gradient-overlay bg-gradient-to-br from-pink-400 to-purple-500" />
                <div className="subtle-overlay">
                  <div className="glow-orb orb-top" />
                  <div className="glow-orb orb-bottom" />
                </div>

                <div className="relative z-10 p-10 md:p-16 text-center">
                  <div className="hero-text group-hover:scale-110 transition-transform duration-500">
                    {cat.name === "VOCABULARY"
                      ? "📚"
                      : cat.name === "GRAMMAR"
                      ? "✍️"
                      : "🖌️"}
                  </div>

                  <h2 className="card-title">{cat.displayName}</h2>
                  <p className="card-subtitle">Học theo cấp độ JLPT</p>
                  <p className="card-description">{cat.description}</p>

                  <div className="flex-container">
                    <span>Bấm để chọn</span>
                    <span className="moving-icon">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Bước 2: Chọn level */}
        {selectedCategory && (
          <div className="max-w-6xl mx-auto">
            <button
              onClick={handleBack}
              className="glass-button flex items-center gap-2 text-white/90 hover:text-white mb-12 group px-6 py-3 rounded-[20px]"
            >
              <span className="text-2xl group-hover:-translate-x-2 transition-transform">
                ←
              </span>
              <span>Quay lại</span>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {levels.map((level, index) => {
                const isAvailable =
                  selectedCategory.name === "VOCABULARY" &&
                  level.level === "N5";

                return (
                  <button
                    key={level.id}
                    onClick={() => isAvailable && handleLevelSelect(level)}
                    disabled={!isAvailable}
                    className={`glass-card relative overflow-hidden transition-all duration-500 ${
                      isAvailable
                        ? "hover:scale-105 cursor-pointer"
                        : "opacity-70 cursor-not-allowed"
                    }`}
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <div className="relative z-10 p-8 text-center">
                      <div className="text-6xl mb-4">
                        {isAvailable ? "🎯" : "🔒"}
                      </div>
                      <h3 className="text-3xl font-black text-white mb-2 drop-shadow-lg">
                        {level.displayName}
                      </h3>
                      <p className="text-xl text-white/90 mb-6">
                        {level.level === "N5"
                          ? "Cơ bản nhất"
                          : level.level === "N4"
                          ? "Nền tảng vững"
                          : level.level === "N3"
                          ? "Trung cấp"
                          : level.level === "N2"
                          ? "Nâng cao"
                          : "Thành thạo"}
                      </p>
                      <div className="text-lg font-bold text-white">
                        {isAvailable ? "Bắt đầu ngay →" : "Sắp ra mắt..."}
                      </div>
                    </div>

                    {!isAvailable && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20">
                        <p className="text-2xl text-white font-bold animate-pulse">
                          Coming Soon ✨
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div
          className="footer-container text-center"
          style={{ animationDelay: "0.8s" }}
        >
          <p className="accent-text">
            Dù bạn chọn loại bài nào, mèo cũng sẽ đồng hành cùng bạn đến cùng
            nhé! 💕
          </p>
          <div className="bouncing-icon">🐾</div>
        </div>
      </main>

      <Footer />

      {/* Giữ nguyên CSS đẹp lung linh như cũ */}
      <style>{`
        /* ... toàn bộ CSS bạn đã có từ VocabularySelector, dán nguyên vào đây */
      `}</style>
    </div>
  );
}
