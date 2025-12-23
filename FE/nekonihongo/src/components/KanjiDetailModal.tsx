// src/components/KanjiDetailModal.tsx
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import HanziWriter, { type CharacterJson } from "hanzi-writer";

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
}

interface KanjiDetailModalProps {
  kanji: Kanji;
  onClose: () => void;
}

export function KanjiDetailModal({ kanji, onClose }: KanjiDetailModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    const writer = HanziWriter.create(containerRef.current, kanji.kanji, {
      width: 320,
      height: 320,
      padding: 20,
      showOutline: true,
      outlineColor: "#e5e7eb",
      strokeColor: "#111827",
      radicalColor: "#dc2626",
      drawingColor: "#111827",
      strokeAnimationSpeed: 1.2,
      delayBetweenStrokes: 400,
      showCharacter: false,
      charDataLoader: (char: string, onLoad: (data: CharacterJson) => void) => {
        const code = char
          .charCodeAt(0)
          .toString(16)
          .padStart(5, "0")
          .toUpperCase();

        // Ưu tiên data KanjiVG chuẩn Nhật
        fetch(
          `https://cdn.jsdelivr.net/npm/hanzi-writer-data-jp@latest/${char}.json`
        )
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((data) => onLoad(data as CharacterJson))
          .catch(() => {
            // Fallback về data mặc định – đảm bảo luôn có data hợp lệ
            HanziWriter.loadCharacterData(char)
              .then((fallbackData) => {
                if (fallbackData) {
                  onLoad(fallbackData);
                } else {
                  // Data trống an toàn nếu cả fallback cũng undefined (rất hiếm)
                  onLoad({
                    strokes: [],
                    medians: [],
                    radicals: {},
                  } as CharacterJson);
                }
              })
              .catch(() => {
                // Nếu lỗi → data trống
                onLoad({
                  strokes: [],
                  medians: [],
                  radicals: {},
                } as CharacterJson);
              });
          });
      },
    });

    writerRef.current = writer;
    writer.animateCharacter();

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
      writerRef.current = null;
    };
  }, [kanji.kanji]);

  const handleReplay = () => {
    if (writerRef.current) {
      writerRef.current.animateCharacter();
    }
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
          {/* PHẦN TRÊN: 2 CỘT CÂN ĐỐI */}
          <div className="responsive-hero-grid">
            {/* CỘT TRÁI: CHỮ KANJI */}
            <div className="flex items-center justify-center h-full px-4">
              <div className="bg-gray-50 rounded-2xl w-full h-full flex items-center justify-center shadow-inner">
                <div className="display-ultra-massive">{kanji.kanji}</div>
              </div>
            </div>

            {/* CỘT PHẢI: THỨ TỰ NÉT VIẾT – HANZI-WRITER */}
            <div className="flex flex-col h-full justify-center">
              <div
                onClick={handleReplay}
                className="interactive-empty-state-box flex-center-both-col cursor-pointer"
                role="button"
                tabIndex={0}
              >
                <div ref={containerRef} className="w-full max-w-lg mx-auto" />
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

      {/* Style giữ nguyên */}
      <style>{`
        .display-ultra-massive {
          font-size: 8rem;
          font-weight: 900;
          color: #111827;
          line-height: 1;
          user-select: none;
          transition: font-size 0.3s ease-in-out;
        }
        @media (min-width: 768px) {
          .display-ultra-massive {
            font-size: 160px;
          }
        }
        @media (min-width: 1024px) {
          .display-ultra-massive {
            font-size: 200px;
          }
        }
        .flex-center-both-col {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
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
          transition: all 150ms ease;
        }
        .interactive-empty-state-box:hover {
          background-color: #f3f4f6;
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
          grid-template-columns: 1fr;
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
            grid-template-columns: repeat(2, 1fr);
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
