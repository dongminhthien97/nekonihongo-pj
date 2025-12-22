// src/data/kanjiLessons.ts
export type Kanji = {
  kanji: string;
  on: string;
  kun: string;
  meaning: string;
  strokes: number;
  compounds: { word: string; reading: string; meaning: string }[];
  strokeOrder?: string[]; // Optional để tránh lỗi nếu chưa có
};

export type KanjiLesson = {
  id: number;
  title: string;
  icon: string;
  kanjiList: Kanji[];
};

export const kanjiLessons: KanjiLesson[] = [
  {
    id: 1,
    title: "Chào hỏi & Cơ bản",
    icon: "Greeting",
    kanjiList: [
      {
        kanji: "人",
        on: "ジン、ニン",
        kun: "ひと",
        meaning: "Người",
        strokes: 2,
        compounds: [
          { word: "日本人", reading: "にほんじん", meaning: "Người Nhật" },
          { word: "大人", reading: "おとな", meaning: "Người lớn" },
          { word: "一人", reading: "ひとり", meaning: "Một mình" },
        ],
        strokeOrder: [
          "M30 20 L70 80",           // nét 1: từ trái trên xuống phải dưới
          "M30 80 L70 20",           // nét 2: từ trái dưới lên phải trên
        ],
      },
      {
        kanji: "日",
        on: "ニチ、ジツ",
        kun: "ひ、か",
        meaning: "Mặt trời, ngày",
        strokes: 4,
        compounds: [
          { word: "日本", reading: "にほん", meaning: "Nhật Bản" },
          { word: "今日", reading: "きょう", meaning: "Hôm nay" },
          { word: "日曜日", reading: "にちようび", meaning: "Chủ nhật" },
        ],
        strokeOrder: [
          "M20 30 L80 30",           // nét ngang trên
          "M20 70 L80 70",           // nét ngang dưới
          "M30 20 L30 80",           // nét dọc trái
          "M70 20 L70 80",           // nét dọc phải
        ],
      },
      {
        kanji: "月",
        on: "ゲツ、ガツ",
        kun: "つき",
        meaning: "Mặt trăng, tháng",
        strokes: 4,
        compounds: [
          { word: "月曜日", reading: "げつようび", meaning: "Thứ Hai" },
          { word: "一ヶ月", reading: "いっかげつ", meaning: "Một tháng" },
        ],
        strokeOrder: [
          "M30 20 L70 80",           // nét 1
          "M70 20 L30 80",           // nét 2
          "M25 50 L75 50",           // nét ngang giữa
          "M50 30 L50 70",           // nét dọc giữa
        ],
      },
      // Các kanji khác bạn thêm strokeOrder tương tự hoặc để rỗng tạm thời
      // {
      //   kanji: "本",
      //   ...
      //   strokeOrder: [] // hoặc thêm path khi có dữ liệu
      // },
    ],
  },
  // Các bài khác...
];