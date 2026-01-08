import { useState, useEffect, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Cat } from "lucide-react";
import { HiraKataDetailModal } from "../components/HiraKataDetailModal";
import { NekoLoading } from "../components/NekoLoading";
import api from "../api/auth";
import type { HiraKata } from "./types/hirakata";

// Định nghĩa interface mở rộng chỉ dùng trong trang này
interface KatakanaData extends HiraKata {
  row?: string;
}

interface KatakanaPageProps {
  onNavigate: (page: string) => void;
}

export function KatakanaPage({ onNavigate }: KatakanaPageProps) {
  const [katakanaList, setKatakanaList] = useState<KatakanaData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState<HiraKata | null>(
    null
  );

  useEffect(() => {
    const fetchKatakana = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/katakana");
        const data = res.data.data || [];

        // Normalize dữ liệu và gán row để phân nhóm
        const normalized = data.map((item: any) => ({
          ...item,
          // Nếu backend không có row, ta dựa vào chữ cái cuối của romanji (a, i, u, e, o)
          // để xác định hàng hoặc dùng chính romanji cho các hàng đặc biệt
          row: item.row || item.romanji?.replace(/[aeiou]/g, "") || "a",
        }));

        setKatakanaList(normalized);
      } catch (err) {
        console.error("❌ Lỗi khi tải Katakana:", err);
      } finally {
        setTimeout(() => setIsLoading(false), 600);
      }
    };
    fetchKatakana();
  }, []);

  // Gom nhóm dữ liệu cho Grid
  const groupedSections = useMemo(() => {
    // Thứ tự các hàng phụ âm trong tiếng Nhật
    const rowOrder = ["", "k", "s", "t", "n", "h", "m", "y", "r", "w", "n"];
    const rows: { title: string; items: KatakanaData[] }[] = [];
    const others: KatakanaData[] = [];

    // Lọc theo tìm kiếm trước nếu có
    const filteredList = searchQuery.trim()
      ? katakanaList.filter(
          (item) =>
            item.character.includes(searchQuery) ||
            item.romanji.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : katakanaList;

    if (searchQuery.trim()) {
      return {
        rows: [{ title: "Kết quả tìm kiếm", items: filteredList }],
        others: [],
      };
    }

    rowOrder.forEach((r) => {
      const items = filteredList.filter((item) => item.row === r);
      if (items.length === 5) {
        rows.push({
          title: `Hàng ${r === "" ? "Nguyên âm" : r.toUpperCase()}`,
          items: items,
        });
      } else {
        others.push(...items);
      }
    });

    return { rows, others };
  }, [katakanaList, searchQuery]);

  const handleStartFlashcard = () => {
    localStorage.setItem(
      "nekoFlashcardHiraKata",
      JSON.stringify({
        type: "katakana",
        items: katakanaList,
      })
    );
    onNavigate("flashcard-hirakata");
  };

  if (isLoading)
    return <NekoLoading message="Mèo đang chuẩn bị bảng Katakana..." />;

  return (
    <div className="katakana-main-wrapper">
      <main className="content-container">
        {/* Header Section */}
        <div className="page-header-section text-center mb-16">
          <h1 className="page-main-title mb-8">
            <span className="title-gradient-text katakana-title-gradient text-6xl font-black">
              Bảng Chữ Katakana
            </span>
          </h1>

          <div className="search-section-wrapper max-w-2xl mx-auto">
            <div className="glass-effect-search-container relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="Tìm kiếm ký tự hoặc romanji..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="transparent-search-field w-full py-4 pl-16 pr-8 bg-black/20 rounded-full text-white border-2 border-white/10 outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Grid Content */}
        <div className="katakana-grid-section space-y-16">
          {/* Render các hàng chuẩn (5 chữ) */}
          {groupedSections.rows.map((section) => (
            <div key={section.title} className="animate-fade-in">
              <h2 className="text-white/40 text-sm font-bold tracking-widest uppercase mb-6 ml-2">
                {section.title}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCharacter(item)}
                    className="katakana-character-card group relative bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl p-8 transition-all hover:-translate-y-2"
                  >
                    <span className="text-5xl font-black text-white group-hover:text-blue-400 transition-colors">
                      {item.character}
                    </span>
                    <p className="mt-4 text-white/40 font-bold group-hover:text-white transition-colors">
                      {item.romanji}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Render các chữ lẻ/biến thể */}
          {groupedSections.others.length > 0 && (
            <div className="animate-fade-in pb-20">
              <h2 className="text-purple-400/50 text-sm font-bold tracking-widest uppercase mb-6 ml-2">
                Âm lẻ & Bổ trợ
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
                {groupedSections.others.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCharacter(item)}
                    className="katakana-character-card group bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/30 rounded-3xl p-8 transition-all hover:-translate-y-2"
                  >
                    <span className="text-5xl font-black text-white group-hover:text-purple-400 transition-colors">
                      {item.character}
                    </span>
                    <p className="mt-4 text-white/40 font-bold group-hover:text-white transition-colors">
                      {item.romanji}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Flashcard Button */}
      <div className="fixed bottom-10 right-10 z-50">
        <button
          onClick={handleStartFlashcard}
          className="group relative flex flex-col items-center"
        >
          <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 pointer-events-none">
            <div className="bg-white text-blue-600 px-4 py-2 rounded-xl font-bold shadow-2xl whitespace-nowrap">
              Học Flashcard Katakana! 🐾
            </div>
          </div>
          <img
            src="https://i.pinimg.com/1200x/8c/98/00/8c9800bb4841e7daa0a3db5f7db8a4b7.jpg"
            className="w-20 h-20 rounded-full border-4 border-white shadow-2xl group-hover:scale-110 transition-transform object-cover"
            alt="Flashcard"
          />
        </button>
      </div>

      {selectedCharacter && (
        <HiraKataDetailModal
          character={selectedCharacter}
          type="katakana"
          onClose={() => setSelectedCharacter(null)}
        />
      )}

      {/* Style giữ nguyên logic giao diện của bạn */}

      <style>{`
        .katakana-main-wrapper {
          min-height: 100vh;
          background: radial-gradient(circle at top right, #1e293b, #0f172a);
        }
        .content-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 4rem 2rem;
        }
        .katakana-title-gradient {
          background: linear-gradient(to right, #60a5fa, #a855f7);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .animate-fade-in {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }


      `}</style>
    </div>
  );
}
