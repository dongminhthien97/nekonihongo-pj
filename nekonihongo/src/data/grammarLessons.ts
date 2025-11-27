// src/data/grammarLessons.ts
export type GrammarPoint = {
 title: string;
  structure: string;
  meaning: string;
  examples: { japanese: string; vietnamese: string }[];
  catMood: "happy" | "thinking" | "cool" | "excited" | "smart";
};

export type Word = {
  japanese: string;
  romaji: string;
  vietnamese: string;
};

export type GrammarLesson = {
  id: number;
  title: string;
  icon: string;
  grammar: GrammarPoint[];
  vocabulary: Word[];
  
};

export const grammarLessons: GrammarLesson[] = [
  {
    id: 1,
    title: "Chào hỏi & Giới thiệu bản thân",
    icon: "Greeting",
    grammar: [
      {
        title: "は (wa) - Trợ từ chủ đề",
        structure: "[Chủ đề] は [Vị ngữ]",
        meaning: "Đánh dấu chủ đề của câu",
        examples: [
          { japanese: "私はベトナム人です。", vietnamese: "Tôi là người Việt Nam." },
          { japanese: "これはペンです。", vietnamese: "Đây là cái bút." },
        ],
        catMood: "happy",
      },
      {
        title: "が (ga) - Trợ từ chủ ngữ",
        structure: "[Danh từ] + が + [Vị ngữ]",
        meaning: "Dùng để chỉ chủ ngữ, nhấn mạnh ai/cái gì làm hành động",
        examples: [
          { japanese: "猫が好きです。", vietnamese: "Tôi thích mèo." },
          { japanese: "雨が降ります。", vietnamese: "Trời mưa." },
        ],
        catMood: "thinking",      
      },
      {
        title: "が (ga) - Trợ từ chủ ngữ",
        structure: "[Danh từ] + が + [Vị ngữ]",
        meaning: "Dùng để chỉ chủ ngữ, nhấn mạnh ai/cái gì làm hành động",
        examples: [
          { japanese: "猫が好きです。", vietnamese: "Tôi thích mèo." },
          { japanese: "雨が降ります。", vietnamese: "Trời mưa." },
        ],
        catMood: "happy",
      },
    ],
    vocabulary: [
      { japanese: "こんにちは", romaji: "konnichiwa", vietnamese: "Xin chào" },
      { japanese: "はじめまして", romaji: "hajimemashite", vietnamese: "Rất vui được gặp" },
      { japanese: "よろしくお願いします", romaji: "yoroshiku onegaishimasu", vietnamese: "Nhờ giúp đỡ" },
      { japanese: "ありがとうございます", romaji: "arigatou gozaimasu", vietnamese: "Cảm ơn" },
      { japanese: "すみません", romaji: "sumimasen", vietnamese: "Xin lỗi / Làm ơn" },
      { japanese: "日本", romaji: "nihon", vietnamese: "Nhật Bản" },
      { japanese: "人", romaji: "hito", vietnamese: "Người" },
      { japanese: "学生", romaji: "gakusei", vietnamese: "Học sinh" },
      { japanese: "先生", romaji: "sensei", vietnamese: "Giáo viên" },
      { japanese: "会社員", romaji: "kaishain", vietnamese: "Nhân viên công ty" },
    ],
  },
  // ... (các bài 2-25 sẽ được mình bổ sung đầy đủ nếu bạn cần)
  // Hiện tại mình để bài 1 + bài 2 làm mẫu, bạn chỉ cần nói "đẩy đủ 25 bài" là mình gen hết!
  {
    id: 2,
    title: "Sở thích & Cảm xúc",
    icon: "Red Heart",
    grammar: [
      {
        title: "が好きです (ga suki desu)",
        structure: "[Danh từ] が 好きです",
        meaning: "Thích cái gì đó",
        examples: [
          { japanese: "猫が好きです。", vietnamese: "Tôi thích mèo." },
          { japanese: "アニメが好きです。", vietnamese: "Tôi thích anime." },
        ],
        catMood: "happy"
      },
    ],
    vocabulary: [
      { japanese: "好き", romaji: "suki", vietnamese: "Thích" },
      { japanese: "嫌い", romaji: "kirai", vietnamese: "Ghét" },
      { japanese: "猫", romaji: "neko", vietnamese: "Mèo" },
      { japanese: "犬", romaji: "inu", vietnamese: "Chó" },
      { japanese: "食べる", romaji: "taberu", vietnamese: "Ăn" },
      { japanese: "飲む", romaji: "nomu", vietnamese: "Uống" },
      { japanese: "見る", romaji: "miru", vietnamese: "Xem" },
      { japanese: "する", romaji: "suru", vietnamese: "Làm" },
      { japanese: "行く", romaji: "iku", vietnamese: "Đi" },
      { japanese: "来る", romaji: "kuru", vietnamese: "Đến" },
    ],
  },

   {
    id: 3,
    title: "Sở thích & Cảm xúc",
    icon: "Red Heart",
    grammar: [
      {
        title: "が好きです (ga suki desu)",
        structure: "[Danh từ] が 好きです",
        meaning: "Thích cái gì đó",
        examples: [
          { japanese: "猫が好きです。", vietnamese: "Tôi thích mèo." },
          { japanese: "アニメが好きです。", vietnamese: "Tôi thích anime." },
        ],
        catMood: "happy"
      },
    ],
    vocabulary: [
      { japanese: "好き", romaji: "suki", vietnamese: "Thích" },
      { japanese: "嫌い", romaji: "kirai", vietnamese: "Ghét" },
      { japanese: "猫", romaji: "neko", vietnamese: "Mèo" },
      { japanese: "犬", romaji: "inu", vietnamese: "Chó" },
      { japanese: "食べる", romaji: "taberu", vietnamese: "Ăn" },
      { japanese: "飲む", romaji: "nomu", vietnamese: "Uống" },
      { japanese: "見る", romaji: "miru", vietnamese: "Xem" },
      { japanese: "する", romaji: "suru", vietnamese: "Làm" },
      { japanese: "行く", romaji: "iku", vietnamese: "Đi" },
      { japanese: "来る", romaji: "kuru", vietnamese: "Đến" },
    ],
  },
   {
    id: 4,
    title: "Sở thích & Cảm xúc",
    icon: "Red Heart",
    grammar: [
      {
        title: "が好きです (ga suki desu)",
        structure: "[Danh từ] が 好きです",
        meaning: "Thích cái gì đó",
        examples: [
          { japanese: "猫が好きです。", vietnamese: "Tôi thích mèo." },
          { japanese: "アニメが好きです。", vietnamese: "Tôi thích anime." },
        ],
        catMood: "happy"
      },
    ],
    vocabulary: [
      { japanese: "好き", romaji: "suki", vietnamese: "Thích" },
      { japanese: "嫌い", romaji: "kirai", vietnamese: "Ghét" },
      { japanese: "猫", romaji: "neko", vietnamese: "Mèo" },
      { japanese: "犬", romaji: "inu", vietnamese: "Chó" },
      { japanese: "食べる", romaji: "taberu", vietnamese: "Ăn" },
      { japanese: "飲む", romaji: "nomu", vietnamese: "Uống" },
      { japanese: "見る", romaji: "miru", vietnamese: "Xem" },
      { japanese: "する", romaji: "suru", vietnamese: "Làm" },
      { japanese: "行く", romaji: "iku", vietnamese: "Đi" },
      { japanese: "来る", romaji: "kuru", vietnamese: "Đến" },
    ],
  },
  // Bạn muốn mình gen tiếp 23 bài còn lại chuẩn Minna no Nihongo không? Chỉ cần nói "gen hết" là xong!
];