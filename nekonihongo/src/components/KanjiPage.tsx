import { useState } from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Background } from "./Background";

interface KanjiPageProps {
  onNavigate: (page: string) => void;
}

const kanjiData = [
  {
    kanji: "猫",
    on: "ビョウ",
    kun: "ねこ",
    meaning: "Mèo",
    strokes: 11,
  },
  {
    kanji: "日",
    on: "ニチ、ジツ",
    kun: "ひ、か",
    meaning: "Mặt trời, ngày",
    strokes: 4,
  },
  {
    kanji: "本",
    on: "ホン",
    kun: "もと",
    meaning: "Sách, gốc",
    strokes: 5,
  },
  {
    kanji: "語",
    on: "ゴ",
    kun: "かた-る",
    meaning: "Ngôn ngữ",
    strokes: 14,
  },
  {
    kanji: "学",
    on: "ガク",
    kun: "まな-ぶ",
    meaning: "Học",
    strokes: 8,
  },
  {
    kanji: "校",
    on: "コウ",
    kun: "",
    meaning: "Trường học",
    strokes: 10,
  },
  {
    kanji: "先",
    on: "セン",
    kun: "さき",
    meaning: "Trước, trước đây",
    strokes: 6,
  },
  {
    kanji: "生",
    on: "セイ、ショウ",
    kun: "い-きる、う-まれる",
    meaning: "Sinh, sống",
    strokes: 5,
  },
  {
    kanji: "食",
    on: "ショク",
    kun: "た-べる",
    meaning: "Ăn, thức ăn",
    strokes: 9,
  },
  {
    kanji: "飲",
    on: "イン",
    kun: "の-む",
    meaning: "Uống",
    strokes: 12,
  },
  {
    kanji: "水",
    on: "スイ",
    kun: "みず",
    meaning: "Nước",
    strokes: 4,
  },
  {
    kanji: "火",
    on: "カ",
    kun: "ひ",
    meaning: "Lửa",
    strokes: 4,
  },
];

export function KanjiPage({ onNavigate }: KanjiPageProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF6E9] via-[#C7FFF1]/20 to-[#D8C8FF]/30">
      {/* Navigation */}
      <Navigation currentPage="kanji" onNavigate={onNavigate} />
      <Background />
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-4 text-gray-800">
            Học Chữ Kanji 🎌
          </h2>
          <p className="text-xl text-gray-600">
            Di chuột vào từng chữ để xem chi tiết! 🐱✨
          </p>
        </div>

        {/* Kanji Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {kanjiData.map((item, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-[24px] p-6 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Kanji Display */}
              <div className="text-center mb-4">
                <div className="text-7xl text-gray-800 mb-2 transition-all duration-300 group-hover:text-[#FFC7EA]">
                  {item.kanji}
                </div>
                <div className="text-sm text-gray-500">
                  {item.strokes} nét
                </div>
              </div>

              {/* Hover Info */}
              <div
                className={`space-y-3 transition-all duration-300 ${
                  hoveredIndex === index
                    ? "opacity-100 max-h-96"
                    : "opacity-0 max-h-0 overflow-hidden"
                }`}
              >
                <div className="bg-gradient-to-r from-[#FFC7EA]/20 to-[#D8C8FF]/20 rounded-[12px] p-3">
                  <p className="text-xs text-gray-600 mb-1">On (Âm Hán):</p>
                  <p className="text-sm text-gray-800">{item.on}</p>
                </div>

                <div className="bg-gradient-to-r from-[#D8C8FF]/20 to-[#C7FFF1]/20 rounded-[12px] p-3">
                  <p className="text-xs text-gray-600 mb-1">Kun (Âm Nhật):</p>
                  <p className="text-sm text-gray-800">{item.kun || "—"}</p>
                </div>

                <div className="bg-gradient-to-r from-[#C7FFF1]/20 to-[#FFF6E9] rounded-[12px] p-3">
                  <p className="text-xs text-gray-600 mb-1">Nghĩa:</p>
                  <p className="text-sm text-gray-800">{item.meaning}</p>
                </div>
              </div>

              {/* Default Info (when not hovering) */}
              <div
                className={`text-center transition-all duration-300 ${
                  hoveredIndex === index
                    ? "opacity-0 max-h-0 overflow-hidden"
                    : "opacity-100"
                }`}
              >
                <div className="bg-gradient-to-r from-[#FFF6E9] to-[#C7FFF1]/20 rounded-[12px] p-3">
                  <p className="text-lg text-gray-800">{item.meaning}</p>
                </div>
              </div>

              {/* Cat Paw Animation on Hover */}
              {hoveredIndex === index && (
                <div className="absolute -top-2 -right-2 text-4xl animate-paw-touch">
                  🐾
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Decoration */}
        <div className="text-center mt-16 space-y-4">
          <div className="flex justify-center gap-4">
            <span className="text-3xl animate-float">🎌</span>
            <span className="text-3xl animate-float delay-1">📝</span>
            <span className="text-3xl animate-float delay-2">🌸</span>
          </div>
          <p className="text-lg text-gray-600">
            Cố gắng học Kanji thật nhiều nhé! がんばって! 💪
          </p>
        </div>
      </main>

      {/* Floating Navigation */}
      <button
        onClick={() => onNavigate("flashcard")}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-[#FFC7EA] to-[#D8C8FF] text-white px-6 py-4 rounded-[24px] shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center gap-2 animate-bounce-subtle z-40"
      >
        <span className="text-xl">🃏</span>
        <span>Flashcard</span>
      </button>

      {/* Footer */}
      <Footer />

      <style>{`
        @keyframes paw-touch {
          0% { transform: scale(0) rotate(-20deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .animate-paw-touch {
          animation: paw-touch 0.4s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }

        .delay-1 {
          animation-delay: 0.3s;
        }

        .delay-2 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  );
}