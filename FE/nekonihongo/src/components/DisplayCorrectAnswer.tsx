// src/components/DisplayCorrectAnswer.tsx
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle,
  XCircle,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../api/auth";

interface CorrectAnswer {
  id: number;
  lessonId: number;
  type: "fill_blank" | "multiple_choice" | "rearrange";
  text: string;
  correctAnswer: string;
  points: number;
  explanation?: string;
  answerParts?: string[];
  numParts?: number;
}

interface DisplayCorrectAnswerProps {
  lessonId: number;
  isOpen: boolean;
  onClose: () => void;
  userAnswers?: Array<{
    questionId: number;
    userAnswer: string;
    subQuestionIndex?: number;
  }>;
}

export function DisplayCorrectAnswer({
  lessonId,
  isOpen,
  onClose,
  userAnswers = [],
}: DisplayCorrectAnswerProps) {
  const [correctAnswers, setCorrectAnswers] = useState<CorrectAnswer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [showExplanations, setShowExplanations] = useState(false);

  useEffect(() => {
    if (isOpen && lessonId) {
      fetchCorrectAnswers();
    }
  }, [isOpen, lessonId]);

  const fetchCorrectAnswers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(
        `/admin/questions/lesson/${lessonId}/correct-answers`,
      );

      if (response.data.success) {
        setCorrectAnswers(response.data.data || []);
      } else {
        setError(response.data.message || "Không thể tải đáp án đúng");
      }
    } catch (err: any) {
      console.error("Error fetching correct answers:", err);
      setError("Lỗi khi tải đáp án đúng: " + (err.message || "Unknown error"));
      setCorrectAnswers([]);
    } finally {
      setLoading(false);
    }
  };

  const getUserAnswerForQuestion = (questionId: number, subIndex?: number) => {
    if (!userAnswers || userAnswers.length === 0) return null;

    const userAnswer = userAnswers.find(
      (answer) =>
        answer.questionId === questionId &&
        (subIndex === undefined || answer.subQuestionIndex === subIndex),
    );

    return userAnswer?.userAnswer;
  };

  const formatCorrectAnswer = (answer: CorrectAnswer) => {
    const { type, correctAnswer, answerParts } = answer;

    switch (type) {
      case "fill_blank":
        return (
          <div className="fill-blank-display">
            {answerParts && answerParts.length > 0 ? (
              <div className="blank-parts">
                {answerParts.map((part, index) => {
                  const userAnswer = getUserAnswerForQuestion(answer.id, index);
                  const isCorrect =
                    userAnswer && compareAnswer(userAnswer, part, "fill_blank");

                  return (
                    <div key={index} className="blank-part">
                      <div className="blank-header">
                        <span className="blank-number">
                          Ô trống {index + 1}
                        </span>
                        {userAnswer && (
                          <span
                            className={`user-answer-indicator ${isCorrect ? "correct" : "incorrect"}`}
                          >
                            {isCorrect ? "✓" : "✗"} Học viên: "{userAnswer}"
                          </span>
                        )}
                      </div>
                      <div className="blank-content">
                        <span className="correct-answer-text">{part}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="single-answer">{correctAnswer}</div>
            )}
          </div>
        );

      case "multiple_choice":
        return (
          <div className="multiple-choice-display">
            {answerParts && answerParts.length > 0 ? (
              <div className="choice-options">
                {answerParts.map((option, index) => {
                  const userAnswer = getUserAnswerForQuestion(answer.id);
                  const isCorrect =
                    userAnswer &&
                    compareAnswer(userAnswer, option, "multiple_choice");

                  return (
                    <div
                      key={index}
                      className={`choice-option ${isCorrect ? "selected" : ""}`}
                    >
                      <span className="option-label">Đáp án {index + 1}:</span>
                      <span className="option-text">{option}</span>
                      {userAnswer && userAnswer === option && (
                        <span className="user-selected">✓ Học viên chọn</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="single-choice">{correctAnswer}</div>
            )}
          </div>
        );

      case "rearrange":
        const userAnswer = getUserAnswerForQuestion(answer.id);
        const isCorrect =
          userAnswer && compareAnswer(userAnswer, correctAnswer, "rearrange");

        return (
          <div className="rearrange-display">
            <div className="rearrange-content">
              <div className="correct-order">
                <span className="order-label">Thứ tự đúng:</span>
                <span className="order-text">{correctAnswer}</span>
              </div>
              {userAnswer && (
                <div className="user-order">
                  <span className="order-label">Học viên sắp xếp:</span>
                  <span
                    className={`order-text ${isCorrect ? "correct" : "incorrect"}`}
                  >
                    {userAnswer}
                  </span>
                  {isCorrect ? (
                    <span className="match-indicator correct">
                      ✓ Đúng thứ tự
                    </span>
                  ) : (
                    <span className="match-indicator incorrect">
                      ✗ Sai thứ tự
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <div className="default-display">{correctAnswer}</div>;
    }
  };

  const compareAnswer = (
    userAnswer: string,
    correctAnswer: string,
    type: string,
  ): boolean => {
    if (!userAnswer || !correctAnswer) return false;

    const normalizedUser = userAnswer.trim().toLowerCase();
    const normalizedCorrect = correctAnswer.trim().toLowerCase();

    switch (type) {
      case "multiple_choice":
        // So sánh chính xác
        return normalizedUser === normalizedCorrect;

      case "fill_blank":
        // Fill blank có thể có nhiều đáp án đúng phân cách bằng dấu |
        const possibleAnswers = normalizedCorrect
          .split("|")
          .map((ans) => ans.trim());
        return possibleAnswers.some((possible) => normalizedUser === possible);

      case "rearrange":
        // So sánh chuỗi đã sắp xếp
        return normalizedUser === normalizedCorrect;

      default:
        return normalizedUser === normalizedCorrect;
    }
  };
  // Thêm hàm tính điểm tự động trong DisplayCorrectAnswer
  const calculateScore = (answers: CorrectAnswer[]): number => {
    let totalScore = 0;

    answers.forEach((answer) => {
      if (answer.type === "fill_blank" && answer.answerParts) {
        // Đếm số ô trống đúng
        let correctCount = 0;
        answer.answerParts.forEach((part, index) => {
          const userAnswer = getUserAnswerForQuestion(answer.id, index);
          if (userAnswer && compareAnswer(userAnswer, part, "fill_blank")) {
            correctCount++;
          }
        });

        // Tính điểm cho mỗi ô trống
        const pointsPerPart = answer.points / answer.answerParts.length;
        totalScore += correctCount * pointsPerPart;
      } else {
        // Các loại câu hỏi khác
        const userAnswer = getUserAnswerForQuestion(answer.id);
        if (
          userAnswer &&
          compareAnswer(userAnswer, answer.correctAnswer, answer.type)
        ) {
          totalScore += answer.points || 0;
        }
      }
    });

    return Math.round(totalScore * 10) / 10; // Làm tròn 1 chữ số thập phân
  };
  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "fill_blank":
        return "Điền vào chỗ trống";
      case "multiple_choice":
        return "Chọn đáp án";
      case "rearrange":
        return "Sắp xếp";
      default:
        return "Câu hỏi";
    }
  };

  const calculateMaxScore = () => {
    return correctAnswers.reduce(
      (sum, answer) => sum + (answer.points || 0),
      0,
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Có thể thêm toast thông báo
        console.log("Copied to clipboard:", text);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  if (!isOpen) return null;

  return (
    <div className="correct-answers-modal-overlay">
      <div className="correct-answers-modal-container">
        <div className="correct-answers-header">
          <div className="header-content">
            <h3 className="modal-title">
              <BookOpen className="title-icon" />
              Đáp án đúng - Bài {lessonId}
            </h3>
            <p className="modal-subtitle">
              Tổng cộng: {correctAnswers.length} câu hỏi - Điểm tối đa:{" "}
              {calculateMaxScore()} điểm
            </p>
          </div>
          <div className="header-actions">
            <button
              onClick={() => setShowExplanations(!showExplanations)}
              className="toggle-button"
              title={showExplanations ? "Ẩn giải thích" : "Hiện giải thích"}
            >
              {showExplanations ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <button onClick={onClose} className="close-button" title="Đóng">
              <XCircle size={24} />
            </button>
          </div>
        </div>

        <div className="correct-answers-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Đang tải đáp án đúng...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <XCircle className="error-icon" />
              <p className="error-message">{error}</p>
              <button onClick={fetchCorrectAnswers} className="retry-button">
                Thử lại
              </button>
            </div>
          ) : correctAnswers.length === 0 ? (
            <div className="empty-state">
              <BookOpen className="empty-icon" />
              <p>Không có câu hỏi nào cho bài học này</p>
            </div>
          ) : (
            <div className="answers-list">
              {correctAnswers.map((answer) => (
                <div
                  key={answer.id}
                  className={`answer-item ${expandedQuestion === answer.id ? "expanded" : ""}`}
                >
                  <div
                    className="answer-header"
                    onClick={() =>
                      setExpandedQuestion(
                        expandedQuestion === answer.id ? null : answer.id,
                      )
                    }
                  >
                    <div className="question-info">
                      <span className="question-number">Câu {answer.id}</span>
                      <span className={`question-type ${answer.type}`}>
                        {getQuestionTypeLabel(answer.type)}
                      </span>
                      <span className="question-points">
                        {answer.points || 0} điểm
                      </span>
                    </div>
                    <div className="header-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(answer.correctAnswer);
                        }}
                        className="copy-button"
                        title="Sao chép đáp án"
                      >
                        <Copy size={16} />
                      </button>
                      <span className="expand-icon">
                        {expandedQuestion === answer.id ? "▼" : "▶"}
                      </span>
                    </div>
                  </div>

                  {expandedQuestion === answer.id && (
                    <div className="answer-details">
                      {answer.text && (
                        <div className="question-text">
                          <p className="text-label">Nội dung câu hỏi:</p>
                          <div className="text-content">{answer.text}</div>
                        </div>
                      )}

                      <div className="correct-answer-section">
                        <p className="section-label">Đáp án đúng:</p>
                        <div className="section-content">
                          {formatCorrectAnswer(answer)}
                        </div>
                      </div>

                      {showExplanations && answer.explanation && (
                        <div className="explanation-section">
                          <p className="section-label">Giải thích:</p>
                          <div className="section-content">
                            {answer.explanation}
                          </div>
                        </div>
                      )}

                      {answer.type === "fill_blank" && answer.numParts && (
                        <div className="parts-info">
                          <p className="info-text">
                            Có {answer.numParts} ô trống cần điền
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="correct-answers-footer">
          <div className="footer-actions">
            <button onClick={fetchCorrectAnswers} className="refresh-button">
              Làm mới
            </button>
            <button onClick={onClose} className="done-button">
              Xong
            </button>
          </div>
          <p className="footer-note">
            Sử dụng đáp án này để chấm điểm thủ công cho học viên
          </p>
        </div>
      </div>

      <style>{`
        .correct-answers-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    animation: fadeIn 0.2s ease-out;
  }
  
  .correct-answers-modal-container {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 500px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    animation: slideInRight 0.3s ease-out;
  }
  
  /* Desktop: hiển thị bên phải */
  @media (min-width: 1024px) {
    .correct-answers-modal-overlay {
      justify-content: flex-end;
      padding-right: 2rem;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: none;
    }
    
    .correct-answers-modal-container {
      width: 30%;
      max-width: 30%;
      margin-left: 1rem;
      max-height: 85vh;
    }
    
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  }
  
  /* Mobile: hiển thị fullscreen */
  @media (max-width: 1023px) {
    .correct-answers-modal-overlay {
      align-items: center;
      justify-content: center;
    }
    
    .correct-answers-modal-container {
      width: 95%;
      max-width: 95%;
    }
    
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
        .correct-answers-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: fadeIn 0.2s ease-out;
        }
        
        .correct-answers-modal-container {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 500px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .correct-answers-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .header-content {
          flex: 1;
        }
        
        .modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .title-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #3b82f6;
        }
        
        .modal-subtitle {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0.25rem 0 0;
        }
        
        .header-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        
        .toggle-button,
        .close-button {
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
          color: #6b7280;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        
        .toggle-button:hover {
          background: #f3f4f6;
          color: #4b5563;
        }
        
        .close-button:hover {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .correct-answers-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }
        
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
        }
        
        .loading-spinner {
          width: 2.5rem;
          height: 2.5rem;
          border: 3px solid #dbeafe;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        .error-state {
          text-align: center;
          padding: 2rem;
        }
        
        .error-icon {
          width: 3rem;
          height: 3rem;
          color: #ef4444;
          margin: 0 auto 1rem;
        }
        
        .error-message {
          color: #dc2626;
          margin-bottom: 1rem;
        }
        
        .retry-button {
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
        }
        
        .empty-state {
          text-align: center;
          padding: 2rem;
        }
        
        .empty-icon {
          width: 3rem;
          height: 3rem;
          color: #9ca3af;
          margin: 0 auto 1rem;
        }
        
        .answers-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .answer-item {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
          transition: all 0.2s;
        }
        
        .answer-item.expanded {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .answer-header {
          padding: 1rem;
          background: #f9fafb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .answer-header:hover {
          background: #f3f4f6;
        }
        
        .question-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .question-number {
          padding: 0.25rem 0.5rem;
          background: #3b82f6;
          color: white;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .question-type {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .question-type.fill_blank {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .question-type.multiple_choice {
          background: #dcfce7;
          color: #166534;
        }
        
        .question-type.rearrange {
          background: #fef3c7;
          color: #92400e;
        }
        
        .question-points {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .copy-button {
          padding: 0.375rem;
          border-radius: 0.375rem;
          background: transparent;
          border: none;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .copy-button:hover {
          background: #f3f4f6;
          color: #4b5563;
        }
        
        .expand-icon {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-left: 0.5rem;
        }
        
        .answer-details {
          padding: 1rem;
          background: white;
          border-top: 1px solid #e5e7eb;
        }
        
        .question-text,
        .correct-answer-section,
        .explanation-section {
          margin-bottom: 1rem;
        }
        
        .section-label {
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }
        
        .section-content {
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }
        
        .text-content {
          white-space: pre-wrap;
        }
        
        .blank-parts {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .blank-part {
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          padding: 0.5rem;
        }
        
        .blank-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }
        
        .blank-number {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .user-answer-indicator {
          font-size: 0.75rem;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
        }
        
        .user-answer-indicator.correct {
          background: #dcfce7;
          color: #166534;
        }
        
        .user-answer-indicator.incorrect {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .blank-content {
          font-weight: 500;
          color: #1e40af;
        }
        
        .choice-options {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        
        .choice-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
        }
        
        .choice-option.selected {
          background: #f0f9ff;
          border-color: #7dd3fc;
        }
        
        .option-label {
          font-size: 0.75rem;
          color: #6b7280;
          min-width: 80px;
        }
        
        .option-text {
          flex: 1;
        }
        
        .user-selected {
          font-size: 0.75rem;
          background: #22c55e;
          color: white;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
        }
        
        .rearrange-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .correct-order,
        .user-order {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }
        
        .order-label {
          font-size: 0.75rem;
          color: #6b7280;
          min-width: 100px;
        }
        
        .order-text {
          flex: 1;
          padding: 0.375rem;
          background: white;
          border-radius: 0.375rem;
          border: 1px solid #e5e7eb;
        }
        
        .order-text.correct {
          background: #dcfce7;
          border-color: #86efac;
        }
        
        .order-text.incorrect {
          background: #fee2e2;
          border-color: #fca5a5;
        }
        
        .match-indicator {
          font-size: 0.75rem;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
        }
        
        .match-indicator.correct {
          background: #dcfce7;
          color: #166534;
        }
        
        .match-indicator.incorrect {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .parts-info {
          padding: 0.5rem;
          background: #eff6ff;
          border-radius: 0.375rem;
          text-align: center;
        }
        
        .info-text {
          font-size: 0.75rem;
          color: #1e40af;
          margin: 0;
        }
        
        .correct-answers-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        
        .footer-actions {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        
        .refresh-button {
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          cursor: pointer;
        }
        
        .done-button {
          flex: 1;
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
        }
        
        .footer-note {
          font-size: 0.75rem;
          color: #6b7280;
          text-align: center;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
