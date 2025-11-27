// src/data/kanjiLessons.ts
export type Kanji = {
  kanji: string;
  on: string;
  kun: string;
  meaning: string;
  strokes: number;
  // THÊM DÒNG NÀY
  compounds: { word: string; reading: string; meaning: string }[];
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
      },
      // ... các chữ khác cũng thêm compounds tương tự
    ],
  },
  // Bài 2, 3... bạn chỉ cần copy-paste format này là xong!
];