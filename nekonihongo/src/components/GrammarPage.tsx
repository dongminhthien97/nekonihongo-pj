import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Background } from "./Background";

interface GrammarPageProps {
  onNavigate: (page: string) => void;
}

const grammarData = [
  {
    id: "1",
    title: "は (wa) - Trợ từ chủ đề",
    structure: "[Danh từ] + は + [Vị ngữ]",
    meaning: "Dùng để chỉ chủ đề của câu",
    examples: [
      { japanese: "私は学生です。", vietnamese: "Tôi là học sinh." },
      { japanese: "これは本です。", vietnamese: "Đây là quyển sách." },
    ],
    catMood: "happy",
  },
  {
    id: "2",
    title: "が (ga) - Trợ từ chủ ngữ",
    structure: "[Danh từ] + が + [Vị ngữ]",
    meaning: "Dùng để chỉ chủ ngữ của câu, nhấn mạnh ai/cái gì làm hành động",
    examples: [
      { japanese: "猫が好きです。", vietnamese: "Tôi thích mèo." },
      { japanese: "雨が降ります。", vietnamese: "Trời mưa." },
    ],
    catMood: "thinking",
  },
  {
    id: "3",
    title: "を (wo/o) - Trợ từ tân ngữ",
    structure: "[Danh từ] + を + [Động từ]",
    meaning: "Đánh dấu tân ngữ trực tiếp của động từ",
    examples: [
      { japanese: "本を読みます。", vietnamese: "Đọc sách." },
      { japanese: "水を飲みます。", vietnamese: "Uống nước." },
    ],
    catMood: "cool",
  },
  {
    id: "4",
    title: "に (ni) - Trợ từ chỉ nơi chốn/thời gian",
    structure: "[Nơi chốn/Thời gian] + に + [Động từ]",
    meaning: "Chỉ địa điểm, thời gian, hướng đi",
    examples: [
      { japanese: "学校に行きます。", vietnamese: "Đi đến trường." },
      { japanese: "7時に起きます。", vietnamese: "Thức dậy lúc 7 giờ." },
    ],
    catMood: "excited",
  },
  {
    id: "5",
    title: "で (de) - Trợ từ chỉ phương tiện/địa điểm",
    structure: "[Phương tiện/Địa điểm] + で + [Động từ]",
    meaning: "Chỉ phương tiện hoặc nơi diễn ra hành động",
    examples: [
      { japanese: "電車で行きます。", vietnamese: "Đi bằng tàu điện." },
      { japanese: "図書館で勉強します。", vietnamese: "Học ở thư viện." },
    ],
    catMood: "smart",
  },
];

const catEmojis = {
  happy: "😺",
  thinking: "🤔😸",
  cool: "😎😺",
  excited: "😻",
  smart: "🧐😺",
};

export function GrammarPage({ onNavigate }: GrammarPageProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const handleAccordionChange = (value: string[]) => {
    setOpenItems(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF6E9] via-[#D8C8FF]/20 to-[#C7FFF1]/30">
      {/* Navigation */}
      <Navigation currentPage="grammar" onNavigate={onNavigate} />

      {/* Background */}
      <Background />
      

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-4 text-gray-800">
            Ngữ Pháp Tiếng Nhật 📝
          </h2>
          <p className="text-xl text-gray-600">
            Nhấn vào từng mục để xem chi tiết nhé! 🐾
          </p>
        </div>

        {/* Grammar Accordion */}
        <div className="max-w-4xl mx-auto relative z-20">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl ring-8 ring-white/60 p-6 sm:p-8">
          <Accordion
            type="multiple"
            value={openItems}
            onValueChange={handleAccordionChange}
            className="space-y-4"
          >
            {grammarData.map((grammar) => (
              <AccordionItem
                key={grammar.id}
                value={grammar.id}
                className="bg-white/90 rounded-2xl overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <AccordionTrigger className="px-6 py-6 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-pink-100 [&[data-state=open]]:to-purple-100">
                  <div className="flex items-center gap-5 flex-1 text-left">
                    <span className="text-4xl transition-transform duration-500 group-hover:scale-110">
                      {openItems.includes(grammar.id)
                        ? catEmojis[grammar.catMood as keyof typeof catEmojis]
                        : "😺"}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800">{grammar.title}</h3>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-8 pt-4 bg-gradient-to-b from-white/80 to-pink-50/30">
                  <div className="space-y-6">
                    {/* Structure */}
                    <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-5 shadow-md">
                      <h4 className="font-semibold text-pink-700 mb-2">Cấu trúc:</h4>
                      <p className="text-xl font-medium text-gray-800">{grammar.structure}</p>
                    </div>

                    {/* Meaning */}
                    <div className="bg-gradient-to-r from-purple-100 to-cyan-100 rounded-2xl p-5 shadow-md">
                      <h4 className="font-semibold text-purple-700 mb-2">Ý nghĩa:</h4>
                      <p className="text-lg text-gray-800">{grammar.meaning}</p>
                    </div>

                    {/* Examples */}
                    <div>
                      <h4 className="font-semibold text-gray-700 text-lg">Ví dụ:</h4>
                      <div className="space-y-3">
                        {grammar.examples.map((example, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-2xl p-5 shadow-md border-2 border-pink-200 hover:border-pink-400 hover:scale-[1.02] transition-all duration-300"
                          >
                            <p className="text-2xl font-bold text-gray-800 mb-2">
                              {example.japanese}
                            </p>
                            <p className="text-lg text-gray-600">
                              → {example.vietnamese}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Decoration */}
                    <div className="flex justify-center gap-3 pt-2">
                      <span className="text-2xl animate-wiggle">🌸</span>
                      <span className="text-2xl">✨</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
            </div>
        {/* Bottom Decoration */}
        <div className="text-center mt-16 space-y-4">
          <div className="flex justify-center gap-4">
            <span className="text-3xl animate-float">🐾</span>
            <span className="text-3xl animate-float delay-1">📖</span>
            <span className="text-3xl animate-float delay-2">💫</span>
          </div>
          <p className="text-lg text-gray-600">
            Học ngữ pháp thật thú vị phải không nào! 🎉
          </p>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
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