// src/pages/ExercisePage.tsx
import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Background } from "./Background";

// Dữ liệu mẫu (bạn có thể import từ file data riêng sau)
const vocabularyExercises = [
  { id: 1, title: "Từ vựng cơ bản 1", icon: "Book", questions: 20 },
  { id: 2, title: "Từ vựng gia đình", icon: "Family", questions: 25 },
  { id: 3, title: "Từ vựng ăn uống", icon: "Food", questions: 30 },
  { id: 4, title: "Từ vựng trường học", icon: "School", questions: 22 },
  { id: 5, title: "Từ vựng du lịch", icon: "Travel", questions: 28 },
];

const kanjiExercises = [
  { id: 101, title: "Kanji N5 - Phần 1", icon: "Kanji1", questions: 25 },
  { id: 102, title: "Kanji N5 - Phần 2", icon: "Kanji2", questions: 25 },
  { id: 103, title: "Kanji N4 - Cơ bản", icon: "Kanji3", questions: 30 },
];

const grammarExercises = [
  {
    id: 201,
    title: "Ngữ pháp N5 - です・ます",
    icon: "Grammar1",
    questions: 20,
  },
  { id: 202, title: "Ngữ pháp N5 - て形", icon: "Grammar2", questions: 25 },
  { id: 203, title: "Ngữ pháp N4 - ば・たら", icon: "Grammar3", questions: 28 },
];

// Câu hỏi mẫu (có thể mở rộng thành file data riêng)
const sampleQuestions = [
  {
    q: "「猫」đọc là gì?",
    options: ["neko", "inu", "tori", "sakana"],
    correct: 0,
  },
  {
    q: "「食べる」nghĩa là?",
    options: ["uống", "ăn", "ngủ", "đi"],
    correct: 1,
  },
  {
    q: "「学校」là gì?",
    options: ["bệnh viện", "cửa hàng", "trường học", "nhà"],
    correct: 2,
  },
  {
    q: "「友達」nghĩa là?",
    options: ["gia đình", "bạn bè", "giáo viên", "học sinh"],
    correct: 1,
  },
  {
    q: "「行く」ở thể て là?",
    options: ["行って", "食べて", "寝て", "飲んで"],
    correct: 0,
  },
  { q: "「本」đọc là?", options: ["hon", "pen", "kami", "kaban"], correct: 0 },
  {
    q: "「美しい」nghĩa là?",
    options: ["xấu xí", "đắt tiền", "đẹp", "cao"],
    correct: 2,
  },
  {
    q: "「雨が降る」là?",
    options: ["mưa rơi", "nắng lên", "gió thổi", "tuyết rơi"],
    correct: 0,
  },
  {
    q: "「昨日」là ngày?",
    options: ["hôm nay", "ngày mai", "hôm qua", "tuần trước"],
    correct: 2,
  },
  {
    q: "「ありがとう」là?",
    options: ["xin lỗi", "cảm ơn", "xin chào", "tạm biệt"],
    correct: 1,
  },
  { q: "「水」đọc là?", options: ["mizu", "hi", "kaze", "yama"], correct: 0 },
  {
    q: "「勉強する」là?",
    options: ["chơi", "học", "làm việc", "ngủ"],
    correct: 1,
  },
];

interface ExercisePageProps {
  onNavigate: (page: string) => void;
}

type Topic = "vocabulary" | "kanji" | "grammar" | null;
type Exercise =
  | (typeof vocabularyExercises)[0]
  | (typeof kanjiExercises)[0]
  | (typeof grammarExercises)[0];

export function ExercisePage({ onNavigate }: ExercisePageProps) {
  const [selectedTopic, setSelectedTopic] = useState<Topic>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([]);

  // Random 10 câu hỏi mỗi lần vào bài
  const questions = useMemo(() => {
    if (!selectedExercise) return [];
    const shuffled = [...sampleQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10);
    setShuffledQuestions(selected);
    setUserAnswers(new Array(10).fill(-1));
    setShowResult(false);
    return selected;
  }, [selectedExercise]);

  const handleAnswer = (qIndex: number, answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[qIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setShowResult(true);
  };

  const score = userAnswers.reduce((acc, ans, i) => {
    return ans === shuffledQuestions[i]?.correct ? acc + 1 : acc;
  }, 0);

  const getScoreMessage = (score: number) => {
    if (score <= 1) return { msg: "Ảo vậy chời ", icon: "Sad Cat" };
    if (score <= 5)
      return { msg: "Cần cố gắng thêm nhé! ", icon: "Fighting Cat" };
    if (score <= 8) return { msg: "OK! Có cố gắng rồi đó ", icon: "Good Cat" };
    return { msg: "Tuyệt vời! Pro tiếng Nhật rồi ", icon: "Champion Cat" };
  };

  const { msg, icon } = getScoreMessage(score);

  const getExercises = () => {
    if (selectedTopic === "vocabulary") return vocabularyExercises;
    if (selectedTopic === "kanji") return kanjiExercises;
    if (selectedTopic === "grammar") return grammarExercises;
    return [];
  };

  return (
    <div className="min-h-screen">
      <Navigation currentPage="exercise" onNavigate={onNavigate} />
      <Background />

      <main className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="relative z-10 mb-12 md:mb-16">
            <span
              className="relative block px-10 md:px-14 lg:px-20 py-8 md:py-10 lg:py-12 
              text-6xl sm:text-7xl md:text-8xl lg:text-10xl font-black tracking-wider 
              hero-text-glow text-white animate-pulse-soft drop-shadow-2xl"
            >
              Bài Tập Tiếng Nhật
            </span>
          </h1>
        </div>

        {/* 3 nút chủ đề lớn */}
        {!selectedTopic && !selectedExercise && (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  topic: "vocabulary" as Topic,
                  title: "Từ Vựng",
                  icon: "😺😺😺😺😺😺",
                  color: "from-pink-500 to-purple-600",
                },
                {
                  topic: "kanji" as Topic,
                  title: "Kanji",
                  icon: "😺😺😺😺😺😺",
                  color: "from-cyan-500 to-blue-600",
                },
                {
                  topic: "grammar" as Topic,
                  title: "Ngữ Pháp",
                  icon: "😺😺😺😺😺😺",
                  color: "from-yellow-500 to-orange-600",
                },
              ].map((item) => (
                <button
                  key={item.topic}
                  onClick={() => setSelectedTopic(item.topic)}
                  className={`group relative overflow-hidden rounded-3xl 
              w-80 h-80 sm:w-96 sm:h-96 lg:w-96 lg:h-96
              bg-gradient-to-br ${item.color} 
              hover:scale-110 transition-all duration-500 shadow-2xl 
              flex flex-col items-center justify-center gap-6 
              cursor-pointer`}
                >
                  <div className="absolute inset-0 bg-white/80 group-hover:bg-white/40 transition" />
                  <div className="relative z-10 text-center">
                    <div
                      className="text-14xl sm:text-15xl lg:text-16xl xl:text-17xl 
                mb-6 drop-shadow-2xl 
                select-none"
                    >
                      {item.icon}
                    </div>
                    <p className="text-4xl font-black text-white drop-shadow-2xl hero-text-glow animate-pulse-soft">
                      {item.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Danh sách bài tập theo chủ đề */}
        {selectedTopic && !selectedExercise && (
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => setSelectedTopic(null)}
              className="mb-10 px-8 py-4 bg-white/80 backdrop-blur-xl rounded-full text-black font-bold hover:bg-white/60"
            >
              ← Quay lại chọn chủ đề
            </button>

            <h2 className="text-6xl font-black text-white text-center mb-12 hero-text-glow">
              {selectedTopic === "vocabulary" && "Từ Vựng"}
              {selectedTopic === "kanji" && "Kanji"}
              {selectedTopic === "grammar" && "Ngữ Pháp"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {getExercises().map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExercise(ex)}
                  className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl 
                    border-4 border-white/50 hover:border-pink-400 hover:scale-105 
                    transition-all duration-500 shadow-xl p-8"
                >
                  <div className="text-6xl mb-4">{ex.icon}</div>
                  <p className="text-3xl font-black text-black">Bài {ex.id}</p>
                  <p className="text-xl text-gray-700 mt-2">{ex.title}</p>
                  <p className="text-lg text-pink-600 mt-4 font-bold">
                    {ex.questions} câu
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bài tập chi tiết */}
        {selectedExercise && !showResult && (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedExercise(null)}
              className="mb-8 px-6 py-3 bg-white/80 rounded-full text-black font-bold hover:bg-white/60"
            >
              ← Quay lại danh sách
            </button>

            <h2 className="text-5xl font-black text-white text-center mb-10 hero-text-glow ">
              {selectedExercise.title}
            </h2>

            <div className="space-y-10">
              {questions.map((q, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-4 border-pink-200"
                >
                  <p className="text-3xl font-black text-black mb-6">
                    Câu {i + 1}: {q.q}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {q.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(i, idx)}
                        className={`p-6 rounded-2xl text-2xl font-bold transition-all
                          ${
                            userAnswers[i] === idx
                              ? "bg-pink-500 text-white scale-105 shadow-xl"
                              : "bg-gray-100 hover:bg-pink-100 text-black"
                          }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button
                onClick={handleSubmit}
                disabled={userAnswers.includes(-1)}
                className="px-16 py-8 bg-gradient-to-r from-pink-500 to-purple-600 
                  text-white text-4xl font-black rounded-full shadow-2xl 
                  hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                NỘP BÀI
              </button>
            </div>
          </div>
        )}

        {/* Kết quả */}
        {showResult && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-50 flex items-center justify-center p-8">
            <div className="bg-white/80 rounded-3xl p-12 max-w-2xl w-full shadow-2xl border-8 border-pink-400">
              <div className="text-center">
                <div className="text-9xl mb-8">{icon}</div>
                <h2 className="text-6xl font-black text-pink-600 mb-6">
                  {score}/10 ĐIỂM
                </h2>
                <p className="text-4xl font-bold text-black mb-10">{msg}</p>
                <div className="flex gap-6 justify-center">
                  <button
                    onClick={() => {
                      setSelectedExercise(selectedExercise); // trigger re-random
                    }}
                    className="px-10 py-6 bg-gradient-to-r from-purple-500 to-pink-500 
                      text-white text-3xl font-black rounded-full shadow-xl hover:scale-110 transition-all flex items-center gap-4"
                  >
                    <RotateCw className="w-10 h-10" /> Làm lại
                  </button>
                  <button
                    onClick={() => {
                      setSelectedExercise(null);
                      setShowResult(false);
                    }}
                    className="px-10 py-6 bg-gray-200 text-black text-3xl font-black rounded-full shadow-xl hover:scale-110 transition-all"
                  >
                    Quay lại danh sách
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <style>{`
      @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
       .hero-text-glow {
    text-shadow: 
      0 0 20px #FF69B4,
      0 0 40px #A020F0,
      0 0 60px #00FFFF,
      0 0 80px #FF69B4,
      0 0 100px #A020F0,
      0 4px 20px rgba(0,0,0,0.9);
    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.8));

     @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }    
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
  `}</style>
      <Footer />
    </div>
  );
}
