// components/MiniTestModal.tsx
import { useState, useEffect } from "react";
import { X, Send, Clock, AlertCircle } from "lucide-react";
import api from "../api/auth";

interface Question {
  id: number;
  lesson_id: number;
  question_type: "fill_blank" | "multiple_choice" | "reorder";
  question_text: string;
  options?: string[];
  correct_answer: string;
  points: number;
}

interface MiniTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: number;
  lessonTitle: string;
  userId: number;
}

export function MiniTestModal({
  isOpen,
  onClose,
  lessonId,
  lessonTitle,
  userId,
}: MiniTestModalProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 phút
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // Kiểm tra user đã làm test này chưa
  useEffect(() => {
    const checkExistingTest = async () => {
      try {
        const response = await api.get(
          `/grammar-tests/check?lesson_id=${lessonId}&user_id=${userId}`
        );
        if (response.data.hasSubmitted) {
          setAlreadySubmitted(true);
        }
      } catch (error) {
        console.error("Error checking existing test:", error);
      }
    };

    if (isOpen && userId) {
      checkExistingTest();
    }
  }, [isOpen, lessonId, userId]);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!isOpen) return;

      try {
        setLoading(true);
        const response = await api.get(
          `/grammar-questions?lesson_id=${lessonId}`
        );
        setQuestions(response.data.data || []);

        // Khởi tạo answers object
        const initialAnswers: Record<number, any> = {};
        (response.data.data || []).forEach((q: Question) => {
          if (q.question_type === "multiple_choice") {
            initialAnswers[q.id] = "";
          } else if (q.question_type === "fill_blank") {
            initialAnswers[q.id] = "";
          } else if (q.question_type === "reorder") {
            initialAnswers[q.id] = [];
          }
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [isOpen, lessonId]);

  // Timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0 || testSubmitted) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isOpen, testSubmitted]);

  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleReorderChange = (questionId: number, items: string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: items,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      alert("Vui lòng hoàn thành tất cả câu hỏi!");
      return;
    }

    try {
      setSubmitting(true);

      const testData = {
        user_id: userId,
        lesson_id: lessonId,
        answers: answers,
        time_spent: 600 - timeLeft,
        submitted_at: new Date().toISOString(),
      };

      const response = await api.post("/grammar-tests/submit", testData);

      if (response.data.success) {
        setTestSubmitted(true);
        // Gửi thông báo cho admin
        await api.post("/notifications", {
          user_id: userId,
          type: "test_submitted",
          title: `Bài test mới - Bài ${lessonId}`,
          message: `User đã nộp bài test cho bài ${lessonTitle}`,
          related_id: response.data.testId,
        });
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      alert("Có lỗi xảy ra khi nộp bài!");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  if (alreadySubmitted) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Đã nộp bài</h2>
            <button onClick={onClose} className="close-btn">
              <X size={20} />
            </button>
          </div>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">
              Bạn đã nộp bài test này rồi!
            </h3>
            <p className="text-gray-600 mb-6">
              Bài test cho "{lessonTitle}" đã được nộp và đang chờ phản hồi từ
              admin.
            </p>
            <p className="text-sm text-gray-500">
              Kiểm tra trong phần "Bài tập của tôi" để xem kết quả và nhận xét.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (testSubmitted) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Nộp bài thành công!</h2>
            <button onClick={onClose} className="close-btn">
              <X size={20} />
            </button>
          </div>
          <div className="text-center py-12">
            <Send className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Bài test đã được gửi</h3>
            <p className="text-gray-600 mb-6">
              Cảm ơn bạn đã hoàn thành bài test cho "{lessonTitle}". Bài làm của
              bạn đang được admin xem xét và phản hồi.
            </p>
            <p className="text-sm text-gray-500">
              Bạn sẽ nhận được thông báo khi có kết quả.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="modal-header sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between w-full">
            <div>
              <h2>Mini Test - {lessonTitle}</h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-orange-600">
                  <Clock size={16} />
                  <span className="font-mono font-bold">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {questions.length} câu hỏi
                </span>
              </div>
            </div>
            <button onClick={onClose} className="close-btn">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải câu hỏi...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                Chưa có câu hỏi nào cho bài học này.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {questions.map((question, index) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <span className="question-number">Câu {index + 1}</span>
                    <span className="question-type-badge">
                      {question.question_type === "fill_blank" && "Điền từ"}
                      {question.question_type === "multiple_choice" &&
                        "Chọn đáp án"}
                      {question.question_type === "reorder" && "Sắp xếp"}
                    </span>
                    <span className="question-points">
                      {question.points} điểm
                    </span>
                  </div>

                  <p className="question-text">{question.question_text}</p>

                  {question.question_type === "fill_blank" && (
                    <input
                      type="text"
                      value={answers[question.id] || ""}
                      onChange={(e) =>
                        handleAnswerChange(question.id, e.target.value)
                      }
                      className="answer-input"
                      placeholder="Nhập câu trả lời..."
                    />
                  )}

                  {question.question_type === "multiple_choice" &&
                    question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <label key={optIndex} className="option-label">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option}
                              checked={answers[question.id] === option}
                              onChange={(e) =>
                                handleAnswerChange(question.id, e.target.value)
                              }
                              className="option-radio"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                  {question.question_type === "reorder" && (
                    <div className="reorder-container">
                      <p className="text-sm text-gray-600 mb-2">
                        Kéo thả để sắp xếp đúng thứ tự:
                      </p>
                      <div className="reorder-items">
                        {(question.options || []).map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="reorder-item"
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData(
                                "text/plain",
                                itemIndex.toString()
                              );
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const draggedIndex = parseInt(
                                e.dataTransfer.getData("text/plain")
                              );
                              const newItems = [
                                ...(answers[question.id] ||
                                  question.options ||
                                  []),
                              ];
                              const temp = newItems[draggedIndex];
                              newItems[draggedIndex] = newItems[itemIndex];
                              newItems[itemIndex] = temp;
                              handleReorderChange(question.id, newItems);
                            }}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer sticky bottom-0 bg-white border-t p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                Đã trả lời:{" "}
                {
                  Object.values(answers).filter(
                    (a) => a && (Array.isArray(a) ? a.length > 0 : a !== "")
                  ).length
                }
                /{questions.length}
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting || timeLeft <= 0}
              className="submit-btn"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang nộp...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Nộp bài
                </>
              )}
            </button>
          </div>
          {timeLeft <= 0 && (
            <div className="mt-2 text-center text-red-600 font-medium">
              Thời gian đã hết! Vui lòng nộp bài.
            </div>
          )}
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 1rem;
          width: 100%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h2 {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1f2937;
        }

        .close-btn {
          padding: 0.5rem;
          border-radius: 0.5rem;
          background: #f3f4f6;
          color: #6b7280;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #e5e7eb;
        }

        .question-card {
          background: #f9fafb;
          border-radius: 0.75rem;
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
        }

        .question-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .question-number {
          font-weight: bold;
          color: #3b82f6;
        }

        .question-type-badge {
          background: #dbeafe;
          color: #1d4ed8;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .question-points {
          margin-left: auto;
          font-weight: bold;
          color: #059669;
        }

        .question-text {
          font-size: 1.125rem;
          color: #1f2937;
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .answer-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .answer-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .option-label {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          background: white;
          border: 2px solid #d1d5db;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .option-label:hover {
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .option-label input:checked + span {
          color: #1d4ed8;
          font-weight: 500;
        }

        .option-radio {
          margin-right: 0.75rem;
        }

        .reorder-container {
          background: white;
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .reorder-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .reorder-item {
          padding: 0.75rem 1rem;
          background: #f3f4f6;
          border-radius: 0.5rem;
          cursor: move;
          user-select: none;
          transition: all 0.2s;
        }

        .reorder-item:hover {
          background: #e5e7eb;
          transform: translateX(4px);
        }

        .reorder-item:active {
          background: #d1d5db;
        }

        .submit-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 2rem;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border-radius: 0.75rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #1d4ed8, #1e40af);
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-footer {
          border-top: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
}
