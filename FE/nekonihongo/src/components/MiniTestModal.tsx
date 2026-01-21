// src/pages/MiniTestModal.tsx
import { useState, useEffect, useRef } from "react";
import { X, Send, Clock, Sparkles, HelpCircle } from "lucide-react";
import api from "../api/auth";

// --- INTERFACES ---
interface Question {
  id: number;
  lesson_id: number;
  example: string;
  question_type: "fill_blank" | "multiple_choice" | "reorder";
  raw_text: string;
  points: number;
}

interface MiniTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: number;
  lessonTitle: string;
  userId: number;
  onSuccess?: (data: {
    lessonId: number;
    lessonTitle: string;
    timeSpent: number;
    questionCount: number;
  }) => void;
  onError?: (
    message: string,
    type: "validation" | "server" | "timeout",
  ) => void;
}

// --- HELPER: Parse Furigana ---
const renderWithFurigana = (text: string) => {
  const parts = text.split(
    /([\u4e00-\u9faf\u3005-\u30ff]+)\(([\u3040-\u3096\u30a0-\u30f6]+)\)/g,
  );

  return parts.map((part, index) => {
    if (index % 3 === 1) {
      const reading = parts[index + 1];
      return (
        <ruby key={index}>
          {part}
          <rt>{reading}</rt>
        </ruby>
      );
    }
    if (index % 3 === 2) return null;
    return <span key={index}>{part}</span>;
  });
};

export function MiniTestModal({
  isOpen,
  onClose,
  lessonId,
  lessonTitle,
  userId,
  onSuccess,
  onError,
}: MiniTestModalProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<
    Record<number, Record<number, string>>
  >({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [testSubmitted, setTestSubmitted] = useState(false);

  const [hasPriorHistory, setHasPriorHistory] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset states khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      setQuestions([]);
      setLoading(true);
      setSubmitting(false);
      setAnswers({});
      setTimeLeft(600);
      setTestSubmitted(false);
      setHasPriorHistory(false);
      setIsClosingModal(false);
    }
  }, [isOpen]);

  // --- FETCH DATA ---
  useEffect(() => {
    if (!isOpen || testSubmitted) return;

    if (!lessonId || lessonId <= 0 || !userId || userId <= 0) {
      if (onError) {
        onError("ID bài học hoặc người dùng không hợp lệ", "validation");
      }
      return;
    }

    const initData = async () => {
      try {
        setLoading(true);

        try {
          const checkRes = await api.get(
            `/grammar-tests/check?lesson_id=${lessonId}`,
          );
          if (checkRes.data.hasSubmitted) {
            setHasPriorHistory(true);
          }
        } catch (checkErr) {}

        const qRes = await api.get(
          `/grammar/mini-test/questions?lesson_id=${lessonId}`,
        );

        if (qRes.data.success && Array.isArray(qRes.data.data)) {
          const formatted = qRes.data.data.map((item: any, index: number) => ({
            id: item.id || index + 1,
            lesson_id: item.lessonId || lessonId,
            example: item.example || "",
            question_type: item.type || "fill_blank",
            raw_text: (item.text || "").replace(item.example || "", "").trim(),
            points: item.points || 10,
          }));
          setQuestions(formatted);
        } else {
          if (onError) {
            onError(
              "Không thể tải câu hỏi. Dữ liệu không đúng định dạng.",
              "server",
            );
          }
        }
      } catch (err: any) {
        if (onError) {
          onError("Không thể tải câu hỏi. Vui lòng thử lại sau.", "server");
        }
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [isOpen, lessonId, userId, testSubmitted, onError]);

  // --- TIMER ---
  useEffect(() => {
    if (!isOpen || timeLeft <= 0 || testSubmitted || isClosingModal) {
      return;
    }

    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isOpen, testSubmitted, isClosingModal]);

  useEffect(() => {
    if (timeLeft === 0 && isOpen && !testSubmitted && !isClosingModal) {
      handleAutoSubmit();
    }
  }, [timeLeft, isOpen, testSubmitted, isClosingModal]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // --- VALIDATION ---
  const validateAnswers = () => {
    const emptyAnswers: number[] = [];

    questions.forEach((q) => {
      const qAnsObj = answers[q.id] || {};
      const blankCount = countBlanks(q.raw_text);

      for (let i = 0; i < blankCount; i++) {
        if (!qAnsObj[i] || qAnsObj[i].trim() === "") {
          emptyAnswers.push(q.id);
          break;
        }
      }
    });

    return emptyAnswers;
  };

  const countBlanks = (text: string) => {
    const blankMatches = text.match(/（　　）|＿{3,}/g);
    return blankMatches ? blankMatches.length : 0;
  };

  // --- HANDLERS ---
  const handleAnswerChange = (qId: number, index: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...(prev[qId] || {}), [index]: value },
    }));
  };

  const handleAutoSubmit = async () => {
    await handleSubmitInternal(true);
  };

  const handleSubmit = async () => {
    await handleSubmitInternal(false);
  };

  const handleSubmitInternal = async (isAutoSubmit: boolean) => {
    try {
      setSubmitting(true);

      if (!isAutoSubmit) {
        const emptyQuestions = validateAnswers();
        if (emptyQuestions.length > 0) {
          const questionNumbers = emptyQuestions.map((id) => {
            const index = questions.findIndex((q) => q.id === id);
            return index !== -1 ? index + 1 : "Unknown";
          });

          if (onError) {
            onError(
              `Vui lòng điền đầy đủ các ô trống trong nhóm câu hỏi: ${questionNumbers.join(", ")}`,
              "validation",
            );
          }

          setSubmitting(false);

          const firstEmptyQuestion = document.querySelector(
            `[data-question-id="${emptyQuestions[0]}"]`,
          );
          if (firstEmptyQuestion) {
            firstEmptyQuestion.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            firstEmptyQuestion.classList.add("highlight-empty");
            setTimeout(() => {
              firstEmptyQuestion.classList.remove("highlight-empty");
            }, 3000);
          }
          return;
        }
      }

      const formattedAnswers: Record<string, string[]> = {};
      questions.forEach((q) => {
        const qAnsObj = answers[q.id] || {};
        const qAnsArr = Object.keys(qAnsObj)
          .sort((a, b) => Number(a) - Number(b))
          .map((k) => qAnsObj[Number(k)]);
        formattedAnswers[q.id.toString()] = qAnsArr;
      });

      const payload = {
        userId: Number(userId),
        lessonId: Number(lessonId),
        answers: formattedAnswers,
        timeSpent: isAutoSubmit ? 600 : Math.max(0, 600 - timeLeft),
        submittedAt: new Date().toISOString(),
      };

      const res = await api.post("/grammar-tests/submit", payload, {
        timeout: 10000,
      });

      if (res.data.success) {
        setTestSubmitted(true);
        if (onSuccess) {
          onSuccess({
            lessonId,
            lessonTitle,
            timeSpent: isAutoSubmit ? 600 : Math.max(0, 600 - timeLeft),
            questionCount: questions.length,
          });
        }
        setIsClosingModal(true);
        setTimeout(() => {
          onClose();
        }, 300);
      } else {
        if (
          res.data.message?.includes("đã nộp bài") ||
          res.data.message?.includes("nộp bài này rồi")
        ) {
          setTestSubmitted(true);
          if (onSuccess) {
            onSuccess({
              lessonId,
              lessonTitle,
              timeSpent: isAutoSubmit ? 600 : Math.max(0, 600 - timeLeft),
              questionCount: questions.length,
            });
          }
          setIsClosingModal(true);
          setTimeout(() => {
            onClose();
          }, 300);
        } else {
          if (onError) {
            onError(res.data.message || "Nộp bài không thành công!", "server");
          }
        }
      }
    } catch (e: any) {
      let errorMsg = "Có lỗi xảy ra khi nộp bài!";
      let errorTyp: "validation" | "server" | "timeout" = "server";

      if (e.code === "ECONNABORTED" || e.message.includes("timeout")) {
        errorMsg = "Request timeout. Vui lòng thử lại.";
        errorTyp = "timeout";
      } else if (e.code === "ERR_NETWORK" || e.message.includes("Network")) {
        errorMsg = "Mất kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.";
        errorTyp = "server";
      } else if (e.response?.status === 400) {
        const errorData = e.response.data;
        if (
          errorData.message?.includes("đã nộp bài") ||
          errorData.message?.includes("nộp bài này rồi")
        ) {
          setTestSubmitted(true);
          if (onSuccess) {
            onSuccess({
              lessonId,
              lessonTitle,
              timeSpent: isAutoSubmit ? 600 : Math.max(0, 600 - timeLeft),
              questionCount: questions.length,
            });
          }
          setIsClosingModal(true);
          setTimeout(() => {
            onClose();
          }, 300);
          return;
        } else {
          errorMsg =
            errorData.message || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
          errorTyp = "validation";
        }
      } else if (e.response?.status === 401) {
        errorMsg = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        errorTyp = "server";
      } else if (e.response?.status === 500) {
        errorMsg = "Lỗi máy chủ. Vui lòng thử lại sau.";
        errorTyp = "server";
      }

      if (onError) {
        onError(errorMsg, errorTyp);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --- RENDERERS ---
  const renderInteractiveContent = (question: Question) => {
    const lines = question.raw_text.split("\n").filter((l) => l.trim());
    let globalInputIndex = 0;

    return (
      <div className="question-content-container">
        {lines.map((line, lineIdx) => {
          if (question.question_type === "fill_blank" || !line.includes("［")) {
            const parts = line.split(/(（　　）|＿{3,})/g);
            return (
              <div key={lineIdx} className="fill-blank-line">
                {parts.map((part, pIdx) => {
                  const isBlank = part === "（　　）" || part.match(/^＿{3,}$/);

                  if (isBlank) {
                    const currentIndex = globalInputIndex++;
                    const currentValue =
                      answers[question.id]?.[currentIndex] || "";

                    return (
                      <input
                        key={`input-${currentIndex}`}
                        type="text"
                        value={currentValue}
                        onChange={(e) =>
                          handleAnswerChange(
                            question.id,
                            currentIndex,
                            e.target.value,
                          )
                        }
                        className="blank-input-field"
                        placeholder="Điền..."
                        autoComplete="off"
                      />
                    );
                  }
                  return <span key={pIdx}>{renderWithFurigana(part)}</span>;
                })}
              </div>
            );
          }

          if (
            question.question_type === "multiple_choice" ||
            line.includes("［")
          ) {
            const parts = line.split(/［(.*?)］/g);
            return (
              <div key={lineIdx} className="multiple-choice-line">
                {parts.map((part, pIdx) => {
                  if (pIdx % 2 === 1) {
                    const options = part.split(/、/);
                    const currentIndex = globalInputIndex++;
                    const currentVal = answers[question.id]?.[currentIndex];

                    return (
                      <span
                        key={`choice-${currentIndex}`}
                        className="choice-container"
                      >
                        {options.map((opt, optIdx) => {
                          const isSelected = currentVal === opt;
                          return (
                            <button
                              key={optIdx}
                              onClick={() =>
                                handleAnswerChange(
                                  question.id,
                                  currentIndex,
                                  opt,
                                )
                              }
                              className={`choice-button ${isSelected ? "choice-button-selected" : "choice-button-default"}`}
                            >
                              {renderWithFurigana(opt)}
                            </button>
                          );
                        })}
                      </span>
                    );
                  }
                  return <span key={pIdx}>{renderWithFurigana(part)}</span>;
                })}
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  // --- RENDER LOGIC ---
  if (!isOpen) {
    return null;
  }

  return (
    <div className={`test-modal-container ${isClosingModal ? "fade-out" : ""}`}>
      <div className="test-modal">
        {/* HEADER */}
        <div className="modal-header">
          <div className="header-left">
            <div className="header-icon">
              <Sparkles className="sparkles-icon" />
            </div>
            <div>
              <h2 className="modal-title">Mini Test</h2>
              <p className="lesson-title">
                {lessonTitle}{" "}
                <span className="lesson-id-badge">ID: {lessonId}</span>
              </p>
            </div>
          </div>

          <div className="header-right">
            <div
              className={`timer-display ${timeLeft < 60 ? "timer-warning" : ""} ${timeLeft < 300 ? "timer-low" : ""}`}
            >
              <Clock className="timer-icon" />
              <span className="timer-value">{formatTime(timeLeft)}</span>
            </div>
            <button onClick={onClose} className="close-modal-button">
              <X className="close-icon" />
            </button>
          </div>
        </div>

        {/* BODY (Scrollable) */}
        <div className="modal-body" ref={scrollRef}>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải câu hỏi...</p>
              <p className="debug-info">
                Lesson ID: {lessonId} | User ID: {userId}
              </p>
            </div>
          ) : (
            <div className="questions-container">
              {questions.length === 0 ? (
                <div className="no-questions-message">
                  <p>Không tìm thấy câu hỏi cho bài học này.</p>
                  <div className="debug-info">
                    <p>Lesson ID: {lessonId}</p>
                    <p>User ID: {userId}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="close-no-questions-button"
                  >
                    Đóng
                  </button>
                </div>
              ) : (
                <>
                  <div className="questions-stats">
                    <span className="stat-badge">
                      Tổng: {questions.length} nhóm câu
                    </span>
                    <span className="stat-badge">
                      Thời gian: {formatTime(timeLeft)}
                    </span>
                    <span className="stat-badge">Lesson ID: {lessonId}</span>
                  </div>
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="question-card"
                      data-question-id={q.id}
                    >
                      <div className="question-badge">Nhóm câu {idx + 1}</div>

                      <div className="question-content">
                        <div className="instruction-hint">
                          <HelpCircle className="hint-icon" />
                          <div>
                            <p className="hint-title">Hướng dẫn:</p>
                            <p>
                              {q.question_type === "fill_blank"
                                ? "Điền từ thích hợp vào ô trống."
                                : "Chọn đáp án đúng trong các ngoặc vuông ［...］."}
                            </p>
                            <p className="hint-points">
                              (Tổng cộng: {q.points} điểm)
                            </p>
                          </div>
                        </div>

                        {q.example && (
                          <div className="example-section">
                            <p className="example-label">Ví dụ (Rei)</p>
                            <div className="example-content">
                              {renderWithFurigana(q.example)}
                            </div>
                          </div>
                        )}

                        <div className="main-question-content">
                          {renderInteractiveContent(q)}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <div className="submit-debug-info">
            <span>
              Debug: LessonID={lessonId} | UserID={userId} | Time=
              {formatTime(timeLeft)}
            </span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || timeLeft <= 0 || questions.length === 0}
            className={`submit-button ${submitting ? "submitting" : ""}`}
          >
            {submitting ? (
              <div className="submit-spinner" />
            ) : timeLeft <= 0 ? (
              "Hết giờ"
            ) : (
              <>
                <span>Nộp bài</span>
                <Send className="submit-icon" />
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .test-modal-container {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 1rem;
          font-family: sans-serif;
          animation: fadeIn 0.3s ease-out;
        }
        
        .fade-out {
          animation: fadeOut 0.3s ease-out forwards;
        }
        
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes fadeOut {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.95);
          }
        }
        
        .test-modal {
          background: #FDFCFE;
          width: 100%;
          max-width: 96rem;
          height: 90vh;
          border-radius: 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.5);
          animation: slideInUp 0.4s ease-out;
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .modal-header {
          flex: none;
          padding-left: 2rem;
          padding-right: 2rem;
          padding-top: 1.5rem;
          padding-bottom: 1.5rem;
          background: white;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .header-icon {
          background: #f3e8ff;
          padding: 0.75rem;
          border-radius: 1rem;
        }
        
        .sparkles-icon {
          color: #7c3aed;
          width: 1.5rem;
          height: 1.5rem;
        }
        
        .modal-title {
          font-size: 1.5rem;
          font-weight: 900;
          color: #1f2937;
          letter-spacing: -0.025em;
        }
        
        .lesson-title {
          color: #6b7280;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .lesson-id-badge {
          font-size: 0.75rem;
          background: #e5e7eb;
          padding: 0.125rem 0.5rem;
          border-radius: 0.375rem;
          color: #6b7280;
          font-family: monospace;
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        
        .timer-display {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-left: 1.25rem;
          padding-right: 1.25rem;
          padding-top: 0.625rem;
          padding-bottom: 0.625rem;
          border-radius: 9999px;
          font-weight: bold;
          font-size: 1.125rem;
          transition: all 0.2s;
          background: #f3f4f6;
          color: #374151;
        }
        
        .timer-low {
          background: #fef3c7;
          color: #d97706;
          animation: pulse 2s infinite;
        }
        
        .timer-warning {
          background: #fef2f2;
          color: #dc2626;
          animation: pulse 1s infinite;
        }
        
        .timer-icon {
          width: 1.25rem;
          height: 1.25rem;
        }
        
        .timer-value {
          font-variant-numeric: tabular-nums;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .close-modal-button {
          padding: 0.75rem;
          border-radius: 9999px;
          transition: background-color 0.2s;
          color: #9ca3af;
          background: none;
          border: none;
          cursor: pointer;
        }
        
        .close-modal-button:hover {
          background: #f3f4f6;
          color: #4b5563;
        }
        
        .close-icon {
          width: 1.75rem;
          height: 1.75rem;
        }
        
        .modal-body {
          flex: 1;
          overflow-y: auto;
          background: rgba(249, 250, 251, 0.5);
          padding: 1.5rem;
        }
        
        @media (min-width: 768px) {
          .modal-body {
            padding: 2.5rem;
          }
        }
        
        .loading-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          gap: 1rem;
        }
        
        .loading-spinner {
          animation: spin 1s linear infinite;
          width: 2.5rem;
          height: 2.5rem;
          border: 4px solid #7c3aed;
          border-top-color: transparent;
          border-radius: 9999px;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .debug-info {
          font-size: 0.75rem;
          color: #6b7280;
          background: #f3f4f6;
          padding: 0.5rem;
          border-radius: 0.375rem;
          font-family: monospace;
          margin-top: 0.5rem;
        }
        
        .questions-container {
          max-width: 64rem;
          margin-left: auto;
          margin-right: auto;
          padding-bottom: 5rem;
        }
        
        .questions-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        
        .stat-badge {
          font-size: 0.875rem;
          background: #e0e7ff;
          color: #3730a3;
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          font-weight: 500;
        }
        
        .no-questions-message {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          max-width: 32rem;
          margin: 0 auto;
          color: #6b7280;
        }
        
        .close-no-questions-button {
          margin-top: 1rem;
          padding: 0.75rem 2rem;
          background: #7c3aed;
          color: white;
          border-radius: 0.5rem;
          font-weight: bold;
          transition: background-color 0.2s;
          border: none;
          cursor: pointer;
        }
        
        .close-no-questions-button:hover {
          background: #6d28d9;
        }
        
        .question-card {
          background: white;
          border-radius: 1.5rem;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border: 1px solid #f3f4f6;
          position: relative;
          margin-bottom: 3rem;
          transition: box-shadow 0.3s;
        }
        
        .question-card.highlight-empty {
          animation: shake 0.5s ease-in-out;
          border-color: #f59e0b !important;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1) !important;
        }
        
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }
        
        .question-card:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
        }
        
        .question-badge {
          position: absolute;
          left: -0.75rem;
          top: 2rem;
          background: #7c3aed;
          color: white;
          padding-left: 1rem;
          padding-right: 1rem;
          padding-top: 0.25rem;
          padding-bottom: 0.25rem;
          border-radius: 0 9999px 9999px 0;
          font-weight: bold;
          font-size: 0.875rem;
          box-shadow: 0 10px 15px rgba(124, 58, 237, 0.1);
        }
        
        .question-content {
          padding-left: 1.5rem;
        }
        
        .instruction-hint {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          color: #d97706;
          background: rgba(254, 243, 199, 0.3);
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid #fef3c7;
          margin-bottom: 1.5rem;
        }
        
        .hint-icon {
          flex-shrink: 0;
          margin-top: 0.125rem;
          width: 1.25rem;
          height: 1.25rem;
        }
        
        .hint-title {
          font-weight: bold;
          margin-bottom: 0.25rem;
        }
        
        .hint-points {
          color: rgba(217, 119, 6, 0.8);
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }
        
        .example-section {
          margin-bottom: 2rem;
          padding-left: 1rem;
          border-left: 4px solid #bfdbfe;
          padding-top: 0.25rem;
          padding-bottom: 0.25rem;
        }
        
        .example-label {
          font-size: 0.875rem;
          color: #3b82f6;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }
        
        .example-content {
          font-size: 1.125rem;
          color: #4b5563;
          font-weight: 500;
        }
        
        .main-question-content {
          position: relative;
        }
        
        .question-content-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .fill-blank-line, .multiple-choice-line {
          line-height: 3.5rem;
          font-size: 1.25rem;
          color: #1f2937;
          word-break: break-word;
        }
        
        .blank-input-field {
          display: inline-flex;
          margin-left: 0.5rem;
          margin-right: 0.5rem;
          width: 8rem;
          height: 2.5rem;
          text-align: center;
          color: #7c3aed;
          font-weight: bold;
          background: #faf5ff;
          border: 2px solid #d8b4fe;
          border-radius: 0.25rem;
          transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          padding: 0 0.5rem;
          font-size: 1rem;
        }
        
        .blank-input-field:focus {
          border-color: #7c3aed;
          background: white;
          outline: none;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }
        
        .blank-input-field::placeholder {
          color: #c4b5fd;
        }
        
        .choice-container {
          display: inline-flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-left: 0.5rem;
          margin-right: 0.5rem;
          vertical-align: middle;
        }
        
        .choice-button {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: bold;
          border: 2px solid;
          transition: all 0.2s;
          transform: scale(1);
          cursor: pointer;
        }
        
        .choice-button:hover {
          transform: scale(1.05);
        }
        
        .choice-button-selected {
          background: #7c3aed;
          color: white;
          border-color: #7c3aed;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .choice-button-default {
          background: white;
          color: #4b5563;
          border-color: #d1d5db;
        }
        
        .choice-button-default:hover {
          border-color: #c4b5fd;
          color: #7c3aed;
        }
        
        .modal-footer {
          flex: none;
          padding: 1.5rem;
          background: white;
          border-top: 1px solid #f3f4f6;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          z-index: 20;
          box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.02);
        }
        
        .submit-debug-info {
          text-align: center;
          font-size: 0.75rem;
          color: #6b7280;
          font-family: monospace;
          background: #f3f4f6;
          padding: 0.5rem;
          border-radius: 0.375rem;
        }
        
        .submit-button {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background-image: linear-gradient(to right, #7c3aed, #db2777);
          color: white;
          padding-left: 3rem;
          padding-right: 3rem;
          padding-top: 1rem;
          padding-bottom: 1rem;
          border-radius: 1rem;
          font-size: 1.25rem;
          font-weight: bold;
          box-shadow: 0 10px 25px rgba(124, 58, 237, 0.1);
          transition: all 0.2s;
          width: 100%;
          min-width: 300px;
          border: none;
          cursor: pointer;
        }
        
        .submit-button:disabled {
          opacity: 0.5;
          transform: translateY(0);
          box-shadow: none;
          cursor: not-allowed;
        }
        
        @media (min-width: 768px) {
          .submit-button {
            width: auto;
            align-self: center;
          }
        }
        
        .submit-button:hover:not(:disabled) {
          box-shadow: 0 15px 30px rgba(124, 58, 237, 0.2);
          transform: translateY(-0.25rem);
        }
        
        .submit-spinner {
          animation: spin 1s linear infinite;
          width: 1.5rem;
          height: 1.5rem;
          border: 2px solid white;
          border-top-color: transparent;
          border-radius: 9999px;
        }
        
        .submit-icon {
          width: 1.375rem;
          height: 1.375rem;
          transition: transform 0.2s;
        }
        
        .submit-button:hover:not(:disabled) .submit-icon {
          transform: translateX(0.25rem);
        }
        
        .modal-body::-webkit-scrollbar {
          width: 8px;
        }
        
        .modal-body::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .modal-body::-webkit-scrollbar-thumb {
          background-color: #E9D5FF;
          border-radius: 20px;
          border: 3px solid transparent;
          background-clip: content-box;
        }
        
        .modal-body::-webkit-scrollbar-thumb:hover {
          background-color: #C084FC;
        }
        
        ruby {
          ruby-align: center;
        }
      `}</style>
    </div>
  );
}
