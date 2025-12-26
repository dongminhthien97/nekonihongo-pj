// src/components/ExercisePage.tsx
import { useState, useEffect, useRef } from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Background } from "./Background";
import { NekoLoading } from "../components/NekoLoading";
import {
  BookOpen,
  FileText,
  Languages,
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  List,
} from "lucide-react";
import api from "../api/auth";
import toast from "react-hot-toast";
interface Question {
  id: number;
  displayOrder: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  explanation?: string;
}

interface Exercise {
  id: number;
  title: string;
  description: string;
  lessonNumber: number;
  totalQuestions: number;
  questions: Question[];
}

export function ExercisePage({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const hasShownToast = useRef(false);
  const hasShownDetailToast = useRef(false);

  // Lấy danh sách bài tập N5 Từ vựng
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setIsLoading(true);

        const res = await api.get("/exercises/vocabulary/n5");

        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setExercises(res.data);

          if (!hasShownToast.current) {
            hasShownToast.current = true;
            toast.success(`Tải thành công ${res.data.length} bài tập N5! 😻`);
          }
        } else {
          toast.error("Chưa có bài tập nào. Mèo sẽ sớm cập nhật thêm nhé! 😺");
          setExercises([]);
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          toast.error(
            "Phiên đăng nhập hết hạn rồi... Mèo đưa bạn về đăng nhập nhé 😿",
            {
              duration: 6000,
            }
          );
          setTimeout(() => onNavigate("login"), 3000);
        } else if (err.response?.status === 404) {
          toast.error("Không tìm thấy bài tập N5. Có thể đang bảo trì... 🛠️");
        } else if (err.response?.status >= 500) {
          toast.error("Máy chủ đang ngủ quên... Mèo đang đánh thức đây! 😾");
        } else if (!err.response) {
          toast.error("Không kết nối được với máy chủ. Kiểm tra mạng nhé! 🌐");
        } else {
          toast.error("Có lỗi xảy ra khi tải bài tập. Mèo đang sửa đây... 🔧");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, [onNavigate]);

  // Reset ref khi rời trang
  useEffect(() => {
    return () => {
      hasShownToast.current = false;
    };
  }, []);

  // Chọn bài tập chi tiết
  const handleExerciseSelect = async (exerciseId: number) => {
    const loadingToast = toast.loading("Mèo đang chuẩn bị bài tập... 🐱");

    try {
      const res = await api.get(`/exercises/${exerciseId}`);
      const exercise: Exercise = res.data;

      if (!exercise.questions || exercise.questions.length === 0) {
        toast.dismiss(loadingToast);
        toast.error("Bài tập này chưa có câu hỏi. Mèo sẽ bổ sung sớm nhé! 😿");
        return;
      }

      const shuffled = [...exercise.questions].sort(() => Math.random() - 0.5);

      setSelectedExercise(exercise);
      setShuffledQuestions(shuffled);
      setUserAnswers(new Array(shuffled.length).fill(null));
      setShowResult(false);
      setScore(0);

      toast.dismiss(loadingToast);
      toast.success(`Sẵn sàng làm bài "${exercise.title}" rồi! 🎉`);
    } catch (err: any) {
      toast.dismiss(loadingToast);

      if (err.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn. Đưa bạn về đăng nhập...");
        setTimeout(() => onNavigate("login"), 3000);
      } else {
        toast.error("Không tải được bài tập này. Mèo đang kiểm tra lại... 😿");
      }
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    let correctCount = 0;
    shuffledQuestions.forEach((q, i) => {
      const correctIndex = ["A", "B", "C", "D"].indexOf(q.correctOption);
      if (userAnswers[i] === correctIndex) correctCount++;
    });
    setScore(correctCount);
    setShowResult(true);

    toast.success(
      `Nộp bài thành công! Bạn được ${correctCount}/${shuffledQuestions.length} điểm! 🎉`,
      { duration: 6000 }
    );
  };

  const handleRetry = () => {
    if (selectedExercise) {
      const shuffled = [...selectedExercise.questions].sort(
        () => Math.random() - 0.5
      );
      setShuffledQuestions(shuffled);
      setUserAnswers(new Array(selectedExercise.questions.length).fill(null));
      setShowResult(false);
      setScore(0);
    }
  };

  const handleBackToList = () => {
    setSelectedExercise(null);
    setShowResult(false);
  };

  const getScoreMessage = (score: number, total: number) => {
    const ratio = score / total;
    if (ratio <= 0.3) return "Cố lên nào mèo con ơi 😿";
    if (ratio <= 0.6) return "Khá lắm rồi, cố thêm chút nữa 💪";
    if (ratio <= 0.9) return "Giỏi quá đi 😸";
    return "Tuyệt vời! Mèo tự hào về bạn 🎉";
  };

  const getScoreEmoji = (score: number, total: number) => {
    const ratio = score / total;
    if (ratio <= 0.3) return "😿";
    if (ratio <= 0.6) return "😼";
    if (ratio <= 0.9) return "😸";
    return "😻";
  };

  if (isLoading && !selectedExercise)
    return <NekoLoading message="Mèo đang chuẩn bị bài tập..." />;

  if (error && !selectedExercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl text-white mb-8">😿</p>
          <p className="text-3xl text-white hero-text-glow">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Background />
      <Navigation currentPage="exercise" onNavigate={onNavigate} />

      <main className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-bounce-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl animate-float">📝</span>
            <h1 className="text-5xl md:text-6xl text-white hero-text-glow animate-float">
              Bài Tập Luyện Tập
            </h1>
            <span
              className="text-5xl animate-float"
              style={{ animationDelay: "0.2s" }}
            >
              ✨
            </span>
          </div>
          <p className="text-white text-lg max-w-2xl mx-auto hero-text-glow">
            Làm bài trắc nghiệm để củng cố từ vựng N5 cùng mèo nhé!
          </p>
        </div>

        {/* Danh sách bài tập */}
        {!selectedExercise && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="bg-white/80 rounded-[32px] p-8 mb-8 border border-white/20">
              <div className="flex items-center gap-4">
                <Languages className="w-16 h-16 text-purple-600 drop-shadow-lg" />
                <h2 className="text-4xl text-white hero-text-glow drop-shadow-lg">
                  Bài tập Từ vựng N5
                </h2>
              </div>
              <p className="text-white/80 mt-4">
                Tổng cộng {exercises.length} bài • Mỗi bài 10 câu
              </p>
            </div>

            <div className="space-y-4">
              {exercises.length === 0 ? (
                <p className="text-center text-white text-xl">
                  Chưa có bài tập nào 😿
                </p>
              ) : (
                exercises.map((ex, idx) => (
                  <button
                    key={`exercise-${ex.id}-${idx}`} // Kết hợp ID và Index để đảm bảo duy nhất
                    onClick={() => handleExerciseSelect(ex.id)}
                    className="w-full bg-white/80 rounded-[24px] p-6 hover:scale-[1.02] transition-all duration-300 border border-white/10 hover:border-white/30 group"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#FFC7EA] to-[#D8C8FF] rounded-[16px] flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                        <span className="text-xl">{ex.lessonNumber}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-white text-xl mb-2 drop-shadow-lg">
                          {ex.title}
                        </h3>
                        <p className="text-white/70 text-sm leading-relaxed">
                          {ex.description}
                        </p>
                        <div className="mt-3 flex items-center gap-3 text-sm text-white/60">
                          <span>📝 10 câu hỏi</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-3xl group-hover:translate-x-2 transition-transform">
                        ▶️
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Làm bài */}
        {selectedExercise && !showResult && (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleBackToList}
              className="glass-button flex items-center gap-2 text-white/90 hover:text-white mb-8 group px-6 py-3 rounded-[20px]"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
              <span>Quay lại danh sách</span>
            </button>

            <div className="bg-white/80 rounded-[32px] p-8 mb-8 text-black border border-white/20">
              <h2 className="text-3xl mb-3 drop-shadow-lg">
                {selectedExercise.title}
              </h2>
              <p className="text-black leading-relaxed">
                {selectedExercise.description}
              </p>
              <div className="mt-6 flex items-center gap-4 text-sm">
                <span>📝 {shuffledQuestions.length} câu hỏi</span>
                <span>•</span>
                <span>
                  ✅ {userAnswers.filter((a) => a !== null).length}/
                  {shuffledQuestions.length} đã trả lời
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {shuffledQuestions.map((question, qIndex) => {
                const correctIndex = ["A", "B", "C", "D"].indexOf(
                  question.correctOption
                );
                return (
                  <div
                    key={question.id}
                    className="bg-white/80 rounded-[24px] p-6 border border-white/20 "
                    style={{ animationDelay: `${qIndex * 0.05}s` }}
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#FFC7EA] to-[#D8C8FF] rounded-full flex items-center justify-center text-white shadow-lg">
                        <span className="text-lg">{qIndex + 1}</span>
                      </div>
                      <h3 className="flex-1 text-black text-lg drop-shadow-lg">
                        {question.questionText}
                      </h3>
                    </div>

                    <div className="space-y-3 ml-16">
                      {[
                        { text: question.optionA, key: "A" },
                        { text: question.optionB, key: "B" },
                        { text: question.optionC, key: "C" },
                        { text: question.optionD, key: "D" },
                      ].map(({ text, key }, oIndex) => {
                        // FIX: Kiểm tra userAnswers có đủ length chưa
                        const isSelected =
                          userAnswers.length > qIndex &&
                          userAnswers[qIndex] === oIndex;

                        return (
                          <button
                            key={key}
                            onClick={() => handleAnswerSelect(qIndex, oIndex)}
                            className={`w-full text-left p-4 rounded-[16px] border-2 transition-all duration-300 ${
                              isSelected
                                ? "bg-gradient-to-r from-pink-400 to-purple-500 text-white border-transparent shadow-2xl scale-105"
                                : "glass-card text-white/80 border-white/20 hover:border-white/40 hover:scale-[1.01]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "border-white bg-white"
                                    : "border-white/40"
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-3 h-3 rounded-full bg-pink-500" />
                                )}
                              </div>
                              <span className="text-black font-medium">
                                {text}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={userAnswers.some((a) => a === null)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 px-12 py-5 rounded-[24px] hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3 text-white shadow-2xl"
              >
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg font-bold">Nộp bài</span>
              </button>
            </div>
          </div>
        )}

        {/* Kết quả */}
        {showResult && selectedExercise && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/80 rounded-[32px] p-12 text-center border border-white/20 shadow-2xl">
              <div className="text-9xl mb-6 animate-bounce drop-shadow-2xl">
                {getScoreEmoji(score, selectedExercise.questions.length)}
              </div>

              <h2 className="text-4xl text-white hero-text-glow mb-6 drop-shadow-lg">
                Kết quả của bạn
              </h2>

              <div className="text-7xl mb-6">
                <span className="hero-text-glow text-white drop-shadow-2xl">
                  {score}/{selectedExercise.questions.length}
                </span>
              </div>

              <p className="hero-text-glow text-3xl text-white mb-10 drop-shadow-lg">
                {getScoreMessage(score, selectedExercise.questions.length)}
              </p>

              <div className="flex flex-wrap justify-center gap-6 mt-10">
                <button
                  onClick={handleRetry}
                  className="px-10 py-5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-[24px] hover:scale-110 transition-all flex items-center gap-3 text-white shadow-xl"
                >
                  <RotateCcw className="w-6 h-6" />
                  <span className="text-xl font-bold">Làm lại</span>
                </button>
                <button
                  onClick={handleBackToList}
                  className="px-10 py-5 bg-white/80 rounded-[24px] hover:scale-110 transition-all flex items-center gap-3 text-black shadow-xl"
                >
                  <List className="w-6 h-6" />
                  <span className="text-xl font-bold">Danh sách</span>
                </button>
              </div>
            </div>

            {/* Chi tiết câu trả lời */}
            <div className="mt-10 space-y-4">
              <h3 className="text-white hero-text-glow text-2xl text-center mb-8 drop-shadow-lg">
                Chi tiết câu trả lời ✨
              </h3>
              {shuffledQuestions.map((question, index) => {
                const userAnswerIndex = userAnswers[index];
                const correctIndex = ["A", "B", "C", "D"].indexOf(
                  question.correctOption
                );
                const isCorrect = userAnswerIndex === correctIndex;

                // Mảng để lấy text đáp án theo index
                const optionTexts = [
                  question.optionA,
                  question.optionB,
                  question.optionC,
                  question.optionD,
                ];

                return (
                  <div
                    key={question.id}
                    className={`bg-white/80 rounded-[24px] p-6 border-2 ${
                      isCorrect
                        ? "border-green-400/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                        : "border-red-400/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                          isCorrect ? "bg-green-500/20" : "bg-red-500/20"
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle className="w-7 h-7 text-green-500" />
                        ) : (
                          <XCircle className="w-7 h-7 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-black text-lg mb-4 drop-shadow-lg">
                          {question.questionText}
                        </p>

                        <div className="space-y-3">
                          {/* Bạn chọn */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-white/70">
                              Bạn chọn:
                            </span>
                            <span
                              className={`px-4 py-2 rounded-[12px] text-sm shadow-lg ${
                                isCorrect ? "bg-green-500/20" : "bg-red-500/20"
                              }`}
                            >
                              {userAnswerIndex !== null
                                ? optionTexts[userAnswerIndex]
                                : "Chưa chọn"}
                            </span>
                          </div>

                          {/* Đáp án đúng (chỉ hiện khi sai) */}
                          {!isCorrect && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm text-white/70">
                                Đáp án đúng:
                              </span>
                              <span className="px-4 py-2 rounded-[12px] text-sm bg-green-500/20 shadow-lg">
                                {optionTexts[correctIndex]}
                              </span>
                            </div>
                          )}

                          {/* Giải thích (nếu có) */}
                          {question.explanation && (
                            <div className="mt-4 p-4 bg-white/60 rounded-[16px] border border-white/30">
                              <p className="text-black text-sm leading-relaxed">
                                <strong>Giải thích:</strong>{" "}
                                {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Mèo bay góc phải */}
      <div className="fixed bottom-10 right-10 pointer-events-none z-50 hidden lg:block">
        <img
          src="https://i.pinimg.com/1200x/8c/98/00/8c9800bb4841e7daa0a3db5f7db8a4b7.jpg"
          alt="Flying Neko"
          className="w-40 h-40 rounded-full object-cover shadow-2xl animate-fly drop-shadow-2xl"
          style={{
            filter: "drop-shadow(0 10px 20px rgba(255, 182, 233, 0.4))",
          }}
        />
      </div>

      <Footer />

      {/* CSS giữ nguyên đẹp lung linh */}
      <style>{`
        .glass-card { background: rgba(255,255,255,0.08); backdrop-filter: blur(20px); box-shadow: 0 8px 32px rgba(0,0,0,0.37); }
        .glass-button { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); }
        .glass-button:hover { background: rgba(255,255,255,0.15); box-shadow: 0 0 20px rgba(255,199,234,0.5); }

        @keyframes bounce-in { 0% { opacity: 0; transform: scale(0.9) translateY(-30px); } 50% { transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes sparkle { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }

        .animate-bounce-in { animation: bounce-in 0.8s cubic-bezier(0.68,-0.55,0.265,1.55); }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; opacity: 0; }
        .animate-slide-in { animation: slide-in 0.6s ease-out forwards; opacity: 0; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-sparkle { animation: sparkle 2s ease-in-out infinite; }

        .hero-text-glow {
          text-shadow: 0 0 20px #FF69B4, 0 0 40px #A020F0, 0 0 60px #00FFFF, 0 0 80px #FF69B4, 0 0 100px #A020F0, 0 4px 20px rgba(0,0,0,0.9);
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.8));
        }
      `}</style>
    </div>
  );
}
