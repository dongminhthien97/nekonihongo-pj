import { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Clock,
  Sparkles,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
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
}: MiniTestModalProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<
    Record<number, Record<number, string>>
  >({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- FETCH DATA ---
  useEffect(() => {
    if (!isOpen || !lessonId) return;

    const initData = async () => {
      try {
        setLoading(true);
        const checkRes = await api.get(
          `/grammar-tests/check?lesson_id=${lessonId}`,
        );
        if (checkRes.data.hasSubmitted) {
          setAlreadySubmitted(true);
          return;
        }

        const qRes = await api.get(
          `/grammar/mini-test/questions?lesson_id=${lessonId}`,
        );
        if (qRes.data.success && Array.isArray(qRes.data.data)) {
          const formatted = qRes.data.data.map((item: any) => ({
            id: item.id,
            lesson_id: item.lesson_id || item.lessonId || lessonId,
            example: item.example || "",
            question_type: item.type || item.question_type || "fill_blank",
            raw_text: (item.text || item.raw_text || "")
              .replace(item.example || "", "")
              .trim(),
            points: item.points || 10,
          }));
          setQuestions(formatted);
        } else {
          alert("Không thể tải câu hỏi. Vui lòng thử lại!");
        }
      } catch (err: any) {
        alert("Lỗi khi tải câu hỏi. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [isOpen, lessonId]);

  // --- TIMER ---
  useEffect(() => {
    if (!isOpen || timeLeft <= 0 || testSubmitted || alreadySubmitted) return;
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isOpen, testSubmitted, alreadySubmitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // --- HANDLERS ---
  const handleAnswerChange = (qId: number, index: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...(prev[qId] || {}), [index]: value },
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      if (questions.length === 0) {
        alert("Không có câu hỏi để nộp!");
        return;
      }

      // Format answers: Map<String, Object> (String keys)
      const formattedAnswers: Record<string, string[]> = {};

      questions.forEach((q) => {
        const qAnsObj = answers[q.id] || {};
        const keys = Object.keys(qAnsObj)
          .map((k) => Number(k))
          .sort((a, b) => a - b);
        const qAnsArr = keys.map((k) => (qAnsObj[k] || "").trim());

        // Key là String (q.id.toString()), Value là array
        formattedAnswers[q.id.toString()] = qAnsArr;
      });

      // Tạo payload đúng với DTO
      const payload = {
        userId: Number(userId), // Long
        lessonId: Number(lessonId), // Integer
        answers: formattedAnswers, // Map<String, Object> - OBJECT không stringify
        timeSpent: Math.max(1, 600 - timeLeft), // Integer
        submittedAt: new Date().toISOString(), // String -> LocalDateTime
      };

      const res = await api.post("/grammar-tests/submit", payload, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });

      if (res.data.success) {
        setTestSubmitted(true);
      } else {
        alert(res.data.message || "Nộp bài không thành công!");
      }
    } catch (e: any) {
      if (e.response?.data?.message) {
        alert(`Lỗi: ${e.response.data.message}`);
      } else {
        alert("Lỗi khi nộp bài. Vui lòng thử lại!");
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
                    return (
                      <input
                        key={`input-${currentIndex}`}
                        type="text"
                        value={answers[question.id]?.[currentIndex] || ""}
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

  // --- UI RENDER ---
  if (!isOpen) return null;

  if (alreadySubmitted || testSubmitted) {
    return (
      <div className="modal-overlay">
        <div className="submission-success-modal">
          <div className="success-icon-container">
            <CheckCircle2 className="success-icon" />
          </div>
          <h2 className="success-title">
            {alreadySubmitted
              ? "Bạn đã làm bài này rồi!"
              : "Nộp bài thành công!"}
          </h2>
          <p className="success-message">
            {alreadySubmitted
              ? "Hãy xem lại kết quả trong phần lịch sử nhé."
              : "Mèo sẽ chấm điểm ngay. Hãy kiểm tra kết quả nhé!"}
          </p>
          <button onClick={onClose} className="close-success-button">
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="test-modal-container">
      <div className="test-modal">
        {/* HEADER */}
        <div className="modal-header">
          <div className="header-left">
            <div className="header-icon">
              <Sparkles className="sparkles-icon" />
            </div>
            <div>
              <h2 className="modal-title">Mini Test</h2>
              <p className="lesson-title">{lessonTitle}</p>
            </div>
          </div>

          <div className="header-right">
            <div
              className={`timer-display ${timeLeft < 60 ? "timer-warning" : ""}`}
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
            </div>
          ) : questions.length === 0 ? (
            <div className="no-questions-container">
              <p className="no-questions-text">
                Không có câu hỏi cho bài học này.
              </p>
              <button onClick={onClose} className="close-modal-btn">
                Quay lại
              </button>
            </div>
          ) : (
            <div className="questions-container">
              {questions.map((q, idx) => (
                <div key={q.id} className="question-card">
                  <div className="question-badge">Nhóm câu {idx + 1}</div>

                  <div className="question-content">
                    {/* Instruction Hint */}
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

                    {/* Example Section */}
                    {q.example && (
                      <div className="example-section">
                        <p className="example-label">Ví dụ (Rei)</p>
                        <div className="example-content">
                          {renderWithFurigana(q.example)}
                        </div>
                      </div>
                    )}

                    {/* Main Content */}
                    <div className="main-question-content">
                      {renderInteractiveContent(q)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <button
            onClick={handleSubmit}
            disabled={submitting || timeLeft <= 0 || questions.length === 0}
            className={`submit-button ${submitting ? "submitting" : ""}`}
          >
            {submitting ? (
              <div className="submit-spinner" />
            ) : (
              <>
                <span>Nộp bài ngay</span>
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
          z-index: 50;
          padding: 1rem;
          font-family: sans-serif;
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
        
        .timer-warning {
          background: #fef2f2;
          color: #dc2626;
          animation: pulse 2s infinite;
        }
        
        .timer-icon {
          width: 1.25rem;
          height: 1.25rem;
        }
        
        .timer-value {
          font-variant-numeric: tabular-nums;
        }
        
        .close-modal-button {
          padding: 0.75rem;
          border-radius: 9999px;
          transition: background-color 0.2s;
          color: #9ca3af;
          border: none;
          background: none;
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
        
        .no-questions-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2rem;
        }
        
        .no-questions-text {
          font-size: 1.25rem;
          color: #6b7280;
          text-align: center;
        }
        
        .close-modal-btn {
          padding: 0.75rem 2rem;
          background: #7c3aed;
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .close-modal-btn:hover {
          background: #6d28d9;
        }
        
        .questions-container {
          max-width: 64rem;
          margin-left: auto;
          margin-right: auto;
          padding-bottom: 5rem;
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
          border-bottom-width: 2px;
          border-color: #d8b4fe;
          border-top-left-radius: 0.25rem;
          border-top-right-radius: 0.25rem;
          transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          border: none;
          outline: none;
        }
        
        .blank-input-field:focus {
          border-color: #7c3aed;
          background: white;
        }
        
        .blank-input-field::placeholder {
          color: #e9d5ff;
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
          padding-top: 0.25rem;
          padding-bottom: 0.25rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: bold;
          border: 1px solid;
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
          justify-content: center;
          z-index: 20;
          box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.02);
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
        
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 1rem;
        }
        
        .submission-success-modal {
          background: white;
          border-radius: 1.5rem;
          padding: 2rem;
          max-width: 28rem;
          width: 100%;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: fadeInUp 0.5s ease-out;
        }
        
        .success-icon-container {
          width: 5rem;
          height: 5rem;
          background: #dcfce7;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: auto;
          margin-right: auto;
          margin-bottom: 1.5rem;
        }
        
        .success-icon {
          width: 2.5rem;
          height: 2.5rem;
          color: #16a34a;
        }
        
        .success-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }
        
        .success-message {
          color: #6b7280;
          margin-bottom: 2rem;
        }
        
        .close-success-button {
          width: 100%;
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
          background: #111827;
          color: white;
          border-radius: 0.75rem;
          font-weight: bold;
          transition: background-color 0.2s;
          border: none;
          cursor: pointer;
        }
        
        .close-success-button:hover {
          background: #1f2937;
        }
        
        /* Custom Scrollbar */
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
        
        /* Ruby Text */
        ruby {
          ruby-align: center;
        }
        
        rt {
          font-size: 0.6em;
          line-height: 1;
          transform: translateY(-2px);
          color: #7c3aed;
          font-weight: normal;
          user-select: none;
        }
        
        /* Animations */
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
