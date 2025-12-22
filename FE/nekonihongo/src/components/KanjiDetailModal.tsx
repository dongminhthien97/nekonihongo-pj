// src/components/KanjiDetailModal.tsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface KanjiCompound {
  word: string;
  reading: string;
  meaning: string;
}

interface Kanji {
  kanji: string;
  on: string;
  kun: string;
  hanViet: string;
  meaning: string;
  compounds: KanjiCompound[];
  strokes: number;
  svgPaths?: string[];
}

interface KanjiDetailModalProps {
  kanji: Kanji;
  onClose: () => void;
}

export function KanjiDetailModal({ kanji, onClose }: KanjiDetailModalProps) {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    setIsAnimating(true);
  }, [kanji.kanji]);

  const handleReplay = () => {
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 100);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay-blurred" onClick={handleOverlayClick}>
      <div className="modal-card-premium">
        {/* Header */}
        <div className="modal-header-divider">
          <h2 className="heading-dark-xl">Chi tiết chữ Kanji</h2>
          <button
            onClick={onClose}
            className="icon-button-circle"
            aria-label="Đóng"
          >
            <X className="icon-gray-medium" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 md:p-12 space-y-12">
          {/* PHẦN TRÊN: 2 CỘT CÂN ĐỐI – KANJI TRÁI + THỨ TỰ NÉT PHẢI */}
          <div className="responsive-hero-grid">
            {/* CỘT TRÁI: CHỮ KANJI */}
            <div className="flex items-center justify-center h-full">
              <div className="centered-content-box flex items-center justify-center">
                <div className="hero-display-massive">{kanji.kanji}</div>
              </div>
            </div>

            {/* CỘT PHẢI: THỨ TỰ NÉT VIẾT */}
            <div className="flex flex-col h-full justify-center">
              <div
                onClick={handleReplay}
                className="interactive-empty-state-box flex-center-both-col"
                role="button"
                tabIndex={0}
              >
                <KanjiStrokeSVG
                  kanji={kanji.kanji}
                  isAnimating={isAnimating}
                  strokes={kanji.strokes}
                  svgPaths={kanji.svgPaths}
                />
                <p className="description-text-spaced mt-8 text-center">
                  Bấm vào để xem lại animation viết nét
                </p>
              </div>
            </div>
          </div>

          {/* THÔNG TIN CHI TIẾT – 2 CỘT */}
          <div className="responsive-grid-layout">
            <div className="space-y-6">
              <div>
                <p className="label-medium-gray">Âm On (音読み)</p>
                <p className="heading-display-lg">{kanji.on}</p>
              </div>
              <div>
                <p className="label-medium-gray">Âm Kun (訓読み)</p>
                <p className="heading-display-lg">{kanji.kun || "—"}</p>
              </div>
              <div>
                <p className="label-medium-gray">Âm Hán Việt</p>
                <p className="heading-display-lg">{kanji.hanViet}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="label-medium-gray">Ý nghĩa</p>
                <p className="heading-display-lg">{kanji.meaning}</p>
              </div>
              <div>
                <p className="label-medium-gray">Số nét</p>
                <p className="heading-display-lg">{kanji.strokes} nét</p>
              </div>
            </div>
          </div>

          {/* TỪ GHÉP PHỔ BIẾN – ĐƯA XUỐNG DƯỚI RIÊNG, RỘNG RÃI */}
          {/* TỪ GHÉP PHỔ BIẾN – CHIA 2 CỘT ĐỀU NHAU */}
          <div className="mt-12">
            <p className="label-medium-gray mb-6">Từ ghép phổ biến</p>
            <div className="bg-gray-50 rounded-2xl p-8">
              {kanji.compounds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Cột trái */}
                  <div className="space-y-6">
                    {kanji.compounds
                      .slice(0, Math.ceil(kanji.compounds.length / 2))
                      .map((c, i) => (
                        <div
                          key={i}
                          className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                        >
                          <p className="text-2xl font-bold text-gray-900">
                            {c.word}
                          </p>
                          <p className="text-lg text-gray-600 mt-2">
                            {c.reading}
                          </p>
                          <p className="text-lg text-gray-700 mt-3 leading-relaxed">
                            {c.meaning}
                          </p>
                        </div>
                      ))}
                  </div>

                  {/* Cột phải */}
                  <div className="space-y-6">
                    {kanji.compounds
                      .slice(Math.ceil(kanji.compounds.length / 2))
                      .map((c, i) => (
                        <div
                          key={i}
                          className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                        >
                          <p className="text-2xl font-bold text-gray-900">
                            {c.word}
                          </p>
                          <p className="text-lg text-gray-600 mt-2">
                            {c.reading}
                          </p>
                          <p className="text-lg text-gray-700 mt-3 leading-relaxed">
                            {c.meaning}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 italic py-8">
                  Chưa có từ ghép nào
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Style giữ nguyên từ file của bạn */}
      <style>{`
      .flex-center-both-col {
  /* flex */
  display: flex;

  /* flex-col */
  flex-direction: column;

  /* justify-center */
  justify-content: center;

  /* items-center */
  align-items: center;

  /* Thường đi kèm với h-full hoặc min-h-screen để thấy rõ hiệu ứng căn giữa */
  min-height: 100%;
}
        .description-text-spaced {
          margin-top: 1.5rem;
          font-size: 1.125rem;
          line-height: 1.75rem;
          color: #4b5563;
          text-align: center;
        }
        .interactive-empty-state-box {
          text-align: center;
          padding: 2rem;
          background-color: #f9fafb;
          border-radius: 1rem;
          cursor: pointer;
          transition: all 150ms ease;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .interactive-empty-state-box:hover {
          background-color: #f3f4f6;
        }
        .paragraph-reading-large {
          font-size: 1.5rem;
          line-height: 1.8;
          color: #1f2937;
        }
        .heading-display-lg {
          font-size: 1.875rem;
          line-height: 2.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        .label-medium-gray {
          font-size: 1.125rem;
          line-height: 1.75rem;
          font-weight: 600;
          color: #4b5563;
          margin-bottom: 0.5rem;
        }
        .responsive-grid-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .responsive-grid-layout {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .responsive-hero-grid {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          align-items: center;
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .responsive-hero-grid {
            gap: 3rem;
          }
        }
        @media (min-width: 1024px) {
          .responsive-hero-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        .hero-display-massive {
          font-size: 8rem;
          font-weight: 900;
          color: #111827;
          line-height: 1;
          margin: 0;
        }
        @media (min-width: 768px) {
          .hero-display-massive {
            font-size: 160px;
          }
        }
        .centered-content-box {
          text-align: center;
          padding: 3rem 2rem;
          background-color: #f9fafb;
          border-radius: 1rem;
          width: 100%;
          height: 100%;
        }
        .icon-gray-medium {
          width: 1.75rem;
          height: 1.75rem;
          color: #4b5563;
        }
        .icon-button-circle {
          padding: 0.75rem;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background-color: transparent;
          cursor: pointer;
          transition: background-color 150ms ease;
        }
        .icon-button-circle:hover {
          background-color: #f3f4f6;
        }
        .heading-dark-xl {
          font-size: 1.875rem;
          line-height: 2.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        .modal-header-divider {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2rem;
          border-bottom: 1px solid #e5e7eb;
          background-color: #ffffff;
        }
        .modal-card-premium {
          background-color: #ffffff;
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          width: 100%;
          max-width: 56rem;
          margin-left: 1rem;
          margin-right: 1rem;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-overlay-blurred {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
}

// KanjiStrokeSVG – giữ nguyên
function KanjiStrokeSVG({
  kanji,
  isAnimating,
  strokes,
  svgPaths,
}: {
  kanji: string;
  isAnimating: boolean;
  strokes: number;
  svgPaths?: string[];
}) {
  const paths =
    svgPaths && svgPaths.length > 0
      ? svgPaths
      : generatePlaceholderPaths(strokes);

  function generatePlaceholderPaths(count: number) {
    const paths: string[] = [];
    const cx = 120,
      cy = 120,
      size = 80;
    for (let i = 0; i < count; i++) {
      const angle = (i * 360) / count;
      const x1 = cx + Math.cos((angle * Math.PI) / 180) * size;
      const y1 = cy + Math.sin((angle * Math.PI) / 180) * size;
      const x2 = cx + Math.cos(((angle + 60) * Math.PI) / 180) * (size * 0.6);
      const y2 = cy + Math.sin(((angle + 60) * Math.PI) / 180) * (size * 0.6);
      paths.push(`M ${x1} ${y1} L ${cx} ${cy} L ${x2} ${y2}`);
    }
    return paths;
  }

  return (
    <svg width="100%" height="300" viewBox="0 0 240 240" className="mx-auto">
      <rect
        x="20"
        y="20"
        width="200"
        height="200"
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="1"
        strokeDasharray="4,4"
      />
      <line
        x1="120"
        y1="20"
        x2="120"
        y2="220"
        stroke="#e5e7eb"
        strokeWidth="1"
        strokeDasharray="4,4"
      />
      <line
        x1="20"
        y1="120"
        x2="220"
        y2="120"
        stroke="#e5e7eb"
        strokeWidth="1"
        strokeDasharray="4,4"
      />

      <text
        x="120"
        y="160"
        fontSize="130"
        textAnchor="middle"
        fill="#f3f4f6"
        fontWeight="900"
      >
        {kanji}
      </text>

      {paths.map((path, i) => (
        <path
          key={i}
          d={path}
          fill="none"
          stroke="#111827"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 300,
            strokeDashoffset: isAnimating ? 0 : 300,
            animation: isAnimating
              ? `draw 0.8s ease-out ${i * 0.3}s forwards`
              : "none",
          }}
        />
      ))}

      {isAnimating &&
        paths.map((path, i) => {
          const match = path.match(/M\s*([\d.]+),([\d.]+)/);
          if (!match) return null;
          const x = parseFloat(match[1]);
          const y = parseFloat(match[2]);

          return (
            <g
              key={`num-${i}`}
              style={{
                animation: `fade 0.4s ease-out ${i * 0.3 + 0.6}s forwards`,
                opacity: 0,
              }}
            >
              <circle cx={x} cy={y} r="14" fill="#dc2626" />
              <text
                x={x}
                y={y + 5}
                fontSize="16"
                fontWeight="900"
                textAnchor="middle"
                fill="white"
              >
                {i + 1}
              </text>
            </g>
          );
        })}

      <style>{`
        @keyframes draw {
          from {
            stroke-dashoffset: 300;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes fade {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </svg>
  );
}
