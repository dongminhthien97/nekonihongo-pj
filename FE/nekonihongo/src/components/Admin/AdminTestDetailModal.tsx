import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  XCircle,
  MessageSquare,
  Star,
  Clock,
  User,
  BookOpen,
  Send,
  AlertCircle,
  Eye,
  HelpCircle,
  CheckCircle,
  XSquare,
} from "lucide-react";
import toast from "react-hot-toast";

interface TestAnswer {
  questionId: number;
  userAnswer: string;
  isCorrect?: boolean;
  correctAnswer?: string;
  allCorrectAnswers?: string;
  subQuestionIndex: number;
  points?: number;
  maxPoints?: number;
  explanation?: string;
  questionType?: string;
  questionText?: string;
  originalAnswer?: string;
  adminChecked?: boolean;
}

interface UserTest {
  id: number;
  userId: number;
  userName?: string;
  userEmail?: string;
  lessonId: number;
  lessonTitle?: string;
  score?: number | null;
  status: "pending" | "feedbacked";
  feedback: string | null;
  feedbackAt: string | null;
  submittedAt: string;
  answers?: TestAnswer[];
  timeSpent?: number;
}

interface AdminTestDetailModalProps {
  test: UserTest | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitFeedback: (
    testId: number,
    feedback: string,
    score: number,
  ) => Promise<void>;
  onDeleteTest: (testId: number) => Promise<void>;
  onShowCorrectAnswers: () => void;
  position?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
}

interface QuestionData {
  id: number;
  lesson_id: number;
  example: string | null;
  type: "fill_blank" | "multiple_choice" | "rearrange";
  text: string;
  options: string[] | null;
  correct_answer: string;
  points: number;
  explanation: string | null;
}

export function AdminTestDetailModal({
  test,
  isOpen,
  onClose,
  onSubmitFeedback,
  onDeleteTest,
  onShowCorrectAnswers,
  position = { x: 100, y: 100 },
  onPositionChange,
}: AdminTestDetailModalProps) {
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, boolean>>(
    {},
  );
  const [modalPosition, setModalPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [questionsData, setQuestionsData] = useState<QuestionData[]>([]);
  const [autoGraded, setAutoGraded] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Initialize data when test changes
  useEffect(() => {
    if (test) {
      setFeedback(test.feedback || "");
      setScore(test.score ?? null);
      setFetchError(null);

      // Initialize checked answers from existing data
      const initialChecks: Record<string, boolean> = {};
      if (test.answers) {
        test.answers.forEach((answer) => {
          const key = `${answer.questionId}_${answer.subQuestionIndex}`;
          if (answer.isCorrect !== undefined) {
            initialChecks[key] = answer.isCorrect;
          }
        });
      }
      setCheckedAnswers(initialChecks);

      // Fetch correct answers from API
      fetchCorrectAnswers();
    }
  }, [test]);

  // Fetch correct answers from API
  const fetchCorrectAnswers = async () => {
    if (!test || !test.lessonId) {
      toast.error("Không tìm thấy bài học để lấy đáp án");
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    try {
      // Try with /api prefix first
      const apiUrl = `/api/admin/questions/lesson/${test.lessonId}/correct-answers`;
      const response = await fetch(apiUrl, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        // If 404, try without /api prefix (fallback)
        if (response.status === 404) {
          const fallbackUrl = `/admin/questions/lesson/${test.lessonId}/correct-answers`;
          const fallbackResponse = await fetch(fallbackUrl, {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          if (!fallbackResponse.ok) {
            throw new Error(`HTTP error! status: ${fallbackResponse.status}`);
          }

          const fallbackContentType =
            fallbackResponse.headers.get("content-type");
          if (
            !fallbackContentType ||
            !fallbackContentType.includes("application/json")
          ) {
            const text = await fallbackResponse.text();
            console.error(
              "Fallback response không phải JSON:",
              text.substring(0, 200),
            );
            throw new Error("Server trả về dữ liệu không đúng định dạng JSON");
          }

          const data: QuestionData[] = await fallbackResponse.json();
          setQuestionsData(data);
          if (!autoGraded && data.length > 0) {
            autoGradeAnswers(data);
          }
          toast.success(`Đã tải ${data.length} câu hỏi từ server (fallback)`);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Response không phải JSON:", text.substring(0, 200));
        throw new Error("Server trả về dữ liệu không đúng định dạng JSON");
      }

      const data: QuestionData[] = await response.json();
      setQuestionsData(data);

      // Auto-grade answers if not already graded
      if (!autoGraded && data.length > 0) {
        autoGradeAnswers(data);
      }

      toast.success(`Đã tải ${data.length} câu hỏi từ server`);
    } catch (error: any) {
      console.error("Error fetching correct answers:", error);
      setFetchError(error.message || "Không thể kết nối đến server");
      toast.error(`Lỗi khi lấy đáp án: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-grade answers by comparing with correct answers from API
  const autoGradeAnswers = (questions: QuestionData[]) => {
    if (!test?.answers || questions.length === 0) return;

    const newChecks: Record<string, boolean> = {};
    let correctCount = 0;

    test.answers.forEach((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) return;

      const key = `${answer.questionId}_${answer.subQuestionIndex}`;

      // Check if already manually graded
      if (checkedAnswers[key] !== undefined) {
        newChecks[key] = checkedAnswers[key];
        if (checkedAnswers[key]) correctCount++;
        return;
      }

      let isCorrect = false;
      const userAnswer = answer.userAnswer || "";

      // Compare based on question type
      switch (question.type) {
        case "fill_blank":
          // For fill_blank, correct_answer contains answers separated by ;
          const correctAnswers = question.correct_answer.split(";");
          if (answer.subQuestionIndex < correctAnswers.length) {
            const expected = correctAnswers[answer.subQuestionIndex].trim();
            const actual = userAnswer.trim();
            isCorrect = expected === actual;
          }
          break;

        case "multiple_choice":
          // For multiple choice, userAnswer should match correct_answer
          isCorrect = userAnswer.trim() === question.correct_answer.trim();
          break;

        case "rearrange":
          // For rearrange, need more complex comparison
          isCorrect = userAnswer.trim() === question.correct_answer.trim();
          break;

        default:
          isCorrect = false;
      }

      newChecks[key] = isCorrect;
      if (isCorrect) correctCount++;
    });

    setCheckedAnswers(newChecks);
    setScore(correctCount);
    setAutoGraded(true);

    if (correctCount > 0 && test.answers) {
      toast.success(
        `Đã tự động chấm: ${correctCount}/${test.answers.length} câu đúng`,
      );
    }
  };

  // Update position when prop changes
  useEffect(() => {
    setModalPosition(position);
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - modalPosition.x,
      y: e.clientY - modalPosition.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Boundary checks
    const boundedX = Math.max(0, Math.min(newX, window.innerWidth - 1000));
    const boundedY = Math.max(0, Math.min(newY, window.innerHeight - 700));

    const newPosition = { x: boundedX, y: boundedY };
    setModalPosition(newPosition);
    if (onPositionChange) {
      onPositionChange(newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const handleAnswerCheck = (
    questionId: number,
    subIndex: number,
    isCorrect: boolean,
  ) => {
    const key = `${questionId}_${subIndex}`;
    setCheckedAnswers((prev) => ({
      ...prev,
      [key]: isCorrect,
    }));

    setTimeout(calculateScoreFromChecks, 100);
  };

  const calculateScoreFromChecks = () => {
    if (!test?.answers) return 0;

    const totalQuestions = test.answers.length;
    const correctCount = Object.values(checkedAnswers).filter(Boolean).length;

    const calculatedScore = correctCount;
    setScore(calculatedScore);

    return calculatedScore;
  };

  const handleSubmit = async () => {
    if (!test) return;

    if (!feedback.trim()) {
      toast.error("Vui lòng nhập phản hồi cho học viên");
      return;
    }

    const finalScore = score || calculateScoreFromChecks() || 0;

    try {
      await onSubmitFeedback(test.id, feedback.trim(), finalScore);
      toast.success("Đã gửi phản hồi thành công");
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Lỗi khi gửi phản hồi");
    }
  };

  const handleDelete = async () => {
    if (!test) return;

    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa bài test này? Hành động này không thể hoàn tác.",
    );

    if (!confirmed) return;

    try {
      await onDeleteTest(test.id);
      toast.success("Đã xóa bài test thành công");
      onClose();
    } catch (error) {
      console.error("Error deleting test:", error);
      toast.error("Lỗi khi xóa bài test");
    }
  };

  const getQuestionData = (questionId: number): QuestionData | undefined => {
    return questionsData.find((q) => q.id === questionId);
  };

  const getCorrectAnswerForSubQuestion = (
    question: QuestionData,
    subIndex: number,
  ): string => {
    if (question.type === "fill_blank") {
      const answers = question.correct_answer.split(";");
      return subIndex < answers.length ? answers[subIndex].trim() : "";
    }
    return question.correct_answer;
  };

  // Tính điểm và hiển thị
  useEffect(() => {
    if (test?.answers && Object.keys(checkedAnswers).length > 0) {
      calculateScoreFromChecks();
    }
  }, [checkedAnswers]);

  if (!isOpen || !test) return null;

  // Group answers by questionId
  const groupedAnswers =
    test.answers?.reduce(
      (groups, answer) => {
        const key = answer.questionId;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(answer);
        return groups;
      },
      {} as Record<number, TestAnswer[]>,
    ) || {};

  const totalQuestions = test.answers?.length || 0;
  const checkedCount = Object.keys(checkedAnswers).length;
  const correctCount = Object.values(checkedAnswers).filter(Boolean).length;
  const progressPercentage =
    totalQuestions > 0 ? (checkedCount / totalQuestions) * 100 : 0;

  return (
    <div
      className="modal-container draggable-modal"
      style={{
        position: "fixed",
        left: `${modalPosition.x}px`,
        top: `${modalPosition.y}px`,
        zIndex: 1001,
      }}
    >
      {/* Modal Header - Draggable area */}
      <div
        className="modal-header draggable-header"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div className="modal-header-content">
          <h2 className="modal-title">
            <MessageSquare size={24} />
            Chấm điểm bài test
            {isLoading && (
              <span className="loading-badge">Đang tải đáp án...</span>
            )}
          </h2>
          <div className="modal-subtitle-section">
            <div className="user-info">
              <User size={16} />
              <span>{test.userName || `User ${test.userId}`}</span>
              <span className="email-text">{test.userEmail}</span>
            </div>
            <div className="lesson-info">
              <BookOpen size={16} />
              <span>
                Bài {test.lessonId}: {test.lessonTitle}
              </span>
            </div>
            <div className="time-info">
              <Clock size={16} />
              <span>
                Nộp lúc: {new Date(test.submittedAt).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="close-button">
          <X size={24} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-header">
          <h3>Tiến độ chấm điểm</h3>
          <span className="progress-text">
            {checkedCount}/{totalQuestions} câu đã chấm
            {autoGraded && (
              <span className="auto-grade-badge">(Đã tự động chấm)</span>
            )}
          </span>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="progress-stats">
          <div className="stat-item">
            <Check size={16} className="stat-icon correct" />
            <span className="stat-count correct">{correctCount}</span>
            <span className="stat-label">Đúng</span>
          </div>
          <div className="stat-item">
            <XCircle size={16} className="stat-icon incorrect" />
            <span className="stat-count incorrect">
              {checkedCount - correctCount}
            </span>
            <span className="stat-label">Sai</span>
          </div>
          <div className="stat-item">
            <AlertCircle size={16} className="stat-icon pending" />
            <span className="stat-count pending">
              {totalQuestions - checkedCount}
            </span>
            <span className="stat-label">Chưa chấm</span>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        <button
          onClick={fetchCorrectAnswers}
          className="view-answers-button"
          disabled={isLoading}
        >
          <Eye size={16} />
          {isLoading ? "Đang tải..." : "Tải đáp án đúng từ Database"}
        </button>
        <button
          onClick={() => autoGradeAnswers(questionsData)}
          className="auto-grade-button"
          disabled={questionsData.length === 0}
        >
          <CheckCircle size={16} />
          Chấm điểm tự động
        </button>
      </div>

      {/* Error message */}
      {fetchError && (
        <div className="error-section">
          <div className="error-message">
            <AlertCircle size={20} />
            <div>
              <strong>Lỗi khi tải đáp án:</strong>
              <p>{fetchError}</p>
              <small>Đang thử kết nối đến API...</small>
            </div>
            <button onClick={fetchCorrectAnswers} className="retry-button">
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Questions Section - HIỂN THỊ ĐẦY ĐỦ THÔNG TIN */}
      <div className="questions-section">
        <div className="section-header">
          <h3 className="section-title">Chi tiết bài làm</h3>
          <div className="scoring-info">
            <HelpCircle size={16} />
            <span>Hiển thị đầy đủ đáp án học viên và đáp án đúng</span>
          </div>
        </div>

        <div className="questions-list">
          {Object.entries(groupedAnswers).map(([questionId, answers]) => {
            const questionNum = parseInt(questionId);
            const questionData = getQuestionData(questionNum);

            return (
              <div key={questionId} className="question-card expanded">
                <div className="question-header">
                  <div className="question-header-left">
                    <span className="question-number">Câu {questionNum}</span>
                    <span className="question-type">
                      {questionData?.type === "fill_blank"
                        ? "Điền vào chỗ trống"
                        : questionData?.type === "multiple_choice"
                          ? "Trắc nghiệm"
                          : "Sắp xếp"}
                    </span>
                    <span className="question-parts">
                      {answers.length} phần
                    </span>
                  </div>
                </div>

                <div className="question-content">
                  {/* Hiển thị câu hỏi */}
                  {questionData && (
                    <div className="question-text-section">
                      <h4 className="section-subtitle">Nội dung câu hỏi:</h4>
                      <div className="question-text">
                        {questionData.text.split("\n").map((line, idx) => (
                          <div key={idx} className="question-line">
                            {line}
                            {idx < questionData.text.split("\n").length - 1 && (
                              <br />
                            )}
                          </div>
                        ))}
                      </div>

                      {questionData.example && (
                        <div className="question-example">
                          <strong>Ví dụ:</strong> {questionData.example}
                        </div>
                      )}

                      {questionData.explanation && (
                        <div className="question-explanation">
                          <strong>Giải thích:</strong>{" "}
                          {questionData.explanation}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hiển thị từng phần trả lời */}
                  <div className="answers-list">
                    {answers.map((answer, index) => {
                      const key = `${answer.questionId}_${answer.subQuestionIndex}`;
                      const isChecked = checkedAnswers[key] !== undefined;
                      const isCorrect = checkedAnswers[key];
                      const questionData = getQuestionData(answer.questionId);
                      const correctAnswer = questionData
                        ? getCorrectAnswerForSubQuestion(
                            questionData,
                            answer.subQuestionIndex,
                          )
                        : answer.correctAnswer || "";

                      return (
                        <div key={index} className="answer-item detailed">
                          <div className="answer-header">
                            <span className="part-label">
                              Phần {answer.subQuestionIndex + 1}
                            </span>
                            <div className="answer-comparison">
                              <div className="comparison-item">
                                <span className="comparison-label">
                                  Học viên:
                                </span>
                                <span
                                  className={`user-answer ${isChecked && !isCorrect ? "incorrect-text" : ""}`}
                                >
                                  {answer.userAnswer || "(Chưa trả lời)"}
                                </span>
                              </div>
                              <div className="comparison-item">
                                <span className="comparison-label">
                                  Đáp án đúng:
                                </span>
                                <span className="correct-answer">
                                  {correctAnswer}
                                </span>
                              </div>
                            </div>
                            <div className="check-buttons">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAnswerCheck(
                                    answer.questionId,
                                    answer.subQuestionIndex,
                                    true,
                                  );
                                }}
                                className={`check-button ${isChecked && isCorrect ? "active-correct" : ""}`}
                              >
                                <Check size={16} />
                                <span>Đúng</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAnswerCheck(
                                    answer.questionId,
                                    answer.subQuestionIndex,
                                    false,
                                  );
                                }}
                                className={`check-button ${isChecked && !isCorrect ? "active-incorrect" : ""}`}
                              >
                                <XCircle size={16} />
                                <span>Sai</span>
                              </button>
                            </div>
                          </div>

                          <div className="answer-info">
                            <div className="answer-status">
                              <span className="status-label">Trạng thái:</span>
                              <span
                                className={`status-badge ${isChecked ? (isCorrect ? "status-correct" : "status-incorrect") : "status-unchecked"}`}
                              >
                                {isChecked
                                  ? isCorrect
                                    ? "✓ Đã chấm Đúng"
                                    : "✗ Đã chấm Sai"
                                  : "Chưa chấm"}
                              </span>

                              {/* Hiển thị kết quả so sánh */}
                              {answer.userAnswer && correctAnswer && (
                                <span className="comparison-result">
                                  {answer.userAnswer.trim() ===
                                  correctAnswer.trim() ? (
                                    <span className="match-correct">
                                      ✓ Khớp đáp án
                                    </span>
                                  ) : (
                                    <span className="match-incorrect">
                                      ✗ Không khớp
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>

                            {/* Hiển thị chi tiết so sánh */}
                            {answer.userAnswer &&
                              correctAnswer &&
                              answer.userAnswer.trim() !==
                                correctAnswer.trim() && (
                                <div className="comparison-detail">
                                  <div className="detail-row">
                                    <span>Đáp án học viên:</span>
                                    <code className="answer-detail incorrect-detail">
                                      "{answer.userAnswer}"
                                    </code>
                                  </div>
                                  <div className="detail-row">
                                    <span>Đáp án đúng:</span>
                                    <code className="answer-detail correct-detail">
                                      "{correctAnswer}"
                                    </code>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score Summary */}
      <div className="score-summary">
        <div className="score-info">
          <h3>
            <Star size={20} />
            Điểm số
          </h3>
          <div className="score-display">
            <span className="score-value">{score !== null ? score : 0}</span>
            <span className="score-max">/{totalQuestions} điểm</span>
          </div>
          <div className="score-percentage">
            (
            {totalQuestions > 0
              ? Math.round(((score || 0) / totalQuestions) * 100)
              : 0}
            %)
          </div>
        </div>
        <div className="score-actions">
          <button
            onClick={calculateScoreFromChecks}
            className="calculate-button"
          >
            Tính điểm từ chấm thủ công
          </button>
          <button
            onClick={() => {
              // Auto mark all as correct
              if (test?.answers) {
                const newChecks: Record<string, boolean> = {};
                test.answers.forEach((answer) => {
                  const key = `${answer.questionId}_${answer.subQuestionIndex}`;
                  newChecks[key] = true;
                });
                setCheckedAnswers(newChecks);
                calculateScoreFromChecks();
                toast.success("Đã chấm tất cả câu là ĐÚNG");
              }
            }}
            className="mark-all-correct-button"
          >
            Chấm tất cả là Đúng
          </button>
          <button
            onClick={() => {
              // Auto mark all as incorrect
              if (test?.answers) {
                const newChecks: Record<string, boolean> = {};
                test.answers.forEach((answer) => {
                  const key = `${answer.questionId}_${answer.subQuestionIndex}`;
                  newChecks[key] = false;
                });
                setCheckedAnswers(newChecks);
                calculateScoreFromChecks();
                toast.success("Đã chấm tất cả câu là SAI");
              }
            }}
            className="mark-all-incorrect-button"
          >
            Chấm tất cả là Sai
          </button>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="feedback-section">
        <h3>
          <MessageSquare size={20} />
          Phản hồi của Admin
        </h3>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Nhập phản hồi chi tiết cho học viên (nhận xét về bài làm, gợi ý cải thiện, lời khen...)"
          className="feedback-textarea"
          rows={4}
        />

        {test.feedback && test.feedbackAt && (
          <div className="previous-feedback">
            <strong>Phản hồi trước:</strong>
            <p>{test.feedback}</p>
            <small>
              Lúc: {new Date(test.feedbackAt).toLocaleString("vi-VN")}
            </small>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={handleDelete} className="delete-button">
          <XSquare size={16} />
          Xóa bài test
        </button>
        <div className="submit-buttons">
          <button onClick={onClose} className="cancel-button">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!feedback.trim()}
            className="submit-button"
          >
            <Send size={16} />
            Gửi phản hồi ({score !== null ? score : 0} điểm)
          </button>
        </div>
      </div>

      <style>{`
        .modal-container {
          background: white;
          border-radius: 1rem;
          box-shadow:
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(0, 0, 0, 0.05);
          width: 1000px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          pointer-events: auto;
          min-width: 800px;
          min-height: 600px;
        }

        .loading-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          margin-left: 10px;
        }

        .auto-grade-badge {
          background: #10b981;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          margin-left: 10px;
        }

        .draggable-header {
          user-select: none;
        }

        .modal-header {
          padding: 1.25rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-header-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex: 1;
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .modal-subtitle-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .user-info,
        .lesson-info,
        .time-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .email-text {
          font-style: italic;
          opacity: 0.8;
        }

        .close-button {
          color: white;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          padding: 0.5rem;
          transition: background-color 0.2s;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .progress-section {
          padding: 1.25rem 1.5rem;
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .progress-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.125rem;
        }

        .progress-text {
          font-size: 0.875rem;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .progress-bar-container {
          height: 0.5rem;
          background: #e5e7eb;
          border-radius: 9999px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
          border-radius: 9999px;
          transition: width 0.3s ease;
        }

        .progress-stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stat-icon {
          border-radius: 50%;
          padding: 0.25rem;
        }

        .stat-icon.correct {
          color: #10b981;
          background: #dcfce7;
        }

        .stat-icon.incorrect {
          color: #ef4444;
          background: #fee2e2;
        }

        .stat-icon.pending {
          color: #f59e0b;
          background: #fef3c7;
        }

        .stat-count {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .stat-count.correct {
          color: #10b981;
        }

        .stat-count.incorrect {
          color: #ef4444;
        }

        .stat-count.pending {
          color: #f59e0b;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .header-actions {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .view-answers-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }

        .view-answers-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-1px);
        }

        .view-answers-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .auto-grade-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }

        .auto-grade-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          transform: translateY(-1px);
        }

        .auto-grade-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-section {
          padding: 1rem 1.5rem;
          background: #fef2f2;
          border-bottom: 1px solid #fecaca;
        }

        .error-message {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          color: #dc2626;
          font-size: 0.875rem;
        }

        .error-message div {
          flex: 1;
        }

        .error-message strong {
          display: block;
          margin-bottom: 4px;
        }

        .error-message p {
          margin: 0 0 4px 0;
        }

        .error-message small {
          color: #9ca3af;
        }

        .retry-button {
          padding: 0.5rem 1rem;
          background: #dc2626;
          color: white;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
          white-space: nowrap;
        }

        .retry-button:hover {
          background: #b91c1c;
        }

        .questions-section {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .section-header {
          margin-bottom: 1.5rem;
        }

        .section-title {
          margin: 0 0 0.5rem 0;
          color: #1f2937;
          font-size: 1.125rem;
        }

        .scoring-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: #f0f9ff;
          color: #0369a1;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          border-left: 3px solid #0ea5e9;
        }

        .questions-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .question-card {
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          overflow: hidden;
          background: white;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .question-card.expanded {
          border-color: #dbeafe;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
        }

        .question-header {
          padding: 1rem 1.25rem;
          background: #f9fafb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e5e7eb;
        }

        .question-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .question-number {
          padding: 0.375rem 0.875rem;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 9999px;
          min-width: 70px;
          text-align: center;
        }

        .question-type {
          padding: 0.25rem 0.75rem;
          background: #f3f4f6;
          color: #4b5563;
          font-size: 0.75rem;
          font-weight: 500;
          border-radius: 0.375rem;
        }

        .question-parts {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .question-content {
          padding: 1.5rem;
          background: white;
        }

        .question-text-section {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          border-left: 4px solid #3b82f6;
        }

        .section-subtitle {
          margin: 0 0 0.75rem 0;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .question-text {
          font-size: 0.875rem;
          color: #1f2937;
          line-height: 1.6;
          white-space: pre-wrap;
          margin-bottom: 0.75rem;
        }

        .question-line {
          margin-bottom: 0.5rem;
        }

        .question-example {
          padding: 0.75rem;
          background: #fefce8;
          border-radius: 0.375rem;
          margin-top: 0.75rem;
          font-size: 0.875rem;
          color: #854d0e;
          border-left: 3px solid #eab308;
        }

        .question-explanation {
          padding: 0.75rem;
          background: #f0f9ff;
          border-radius: 0.375rem;
          margin-top: 0.75rem;
          font-size: 0.875rem;
          color: #0369a1;
          border-left: 3px solid #0ea5e9;
        }

        .answers-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .answer-item.detailed {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1.25rem;
          background: #fafafa;
          transition: all 0.2s;
        }

        .answer-item.detailed:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .answer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .part-label {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
          min-width: 80px;
        }

        .answer-comparison {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .comparison-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .comparison-label {
          font-weight: 500;
          color: #6b7280;
          font-size: 0.75rem;
          min-width: 100px;
        }

        .user-answer {
          font-weight: 500;
          color: #1f2937;
          font-size: 0.875rem;
          background: white;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          border: 1px solid #d1d5db;
          word-break: break-word;
        }

        .incorrect-text {
          color: #dc2626;
          background: #fef2f2;
          border-color: #fca5a5;
        }

        .correct-answer {
          font-weight: 600;
          color: #059669;
          font-size: 0.875rem;
          background: #f0fdf4;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          border: 1px solid #86efac;
          word-break: break-word;
        }

        .check-buttons {
          display: flex;
          gap: 0.5rem;
          min-width: 180px;
        }

        .check-button {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.875rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.2s;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid transparent;
          cursor: pointer;
          flex: 1;
          justify-content: center;
        }

        .check-button.active-correct {
          background: #dcfce7;
          color: #166534;
          border-color: #86efac;
        }

        .check-button.active-incorrect {
          background: #fee2e2;
          color: #991b1b;
          border-color: #fca5a5;
        }

        .check-button:hover:not(.active-correct):not(.active-incorrect) {
          background: #e5e7eb;
        }

        .answer-info {
          padding-top: 1rem;
          border-top: 1px solid #f3f4f6;
        }

        .answer-status {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }

        .status-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-correct {
          background: #dcfce7;
          color: #166534;
        }

        .status-incorrect {
          background: #fee2e2;
          color: #991b1b;
        }

        .status-unchecked {
          background: #f3f4f6;
          color: #6b7280;
        }

        .comparison-result {
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
        }

        .match-correct {
          background: #dcfce7;
          color: #166534;
        }

        .match-incorrect {
          background: #fef3c7;
          color: #92400e;
        }

        .comparison-detail {
          background: white;
          border-radius: 0.5rem;
          padding: 1rem;
          border: 1px solid #e5e7eb;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .detail-row:last-child {
          margin-bottom: 0;
        }

        .answer-detail {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 0.75rem;
          word-break: break-word;
        }

        .incorrect-detail {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .correct-detail {
          background: #f0fdf4;
          color: #059669;
          border: 1px solid #86efac;
        }

        .score-summary {
          padding: 1.5rem;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border-top: 1px solid #e5e7eb;
        }

        .score-info h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 0.5rem 0;
          color: #1e40af;
          font-size: 1.125rem;
        }

        .score-display {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
          margin-bottom: 0.25rem;
        }

        .score-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1e40af;
        }

        .score-max {
          font-size: 1.5rem;
          color: #3b82f6;
        }

        .score-percentage {
          font-size: 1rem;
          color: #6b7280;
        }

        .score-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        .calculate-button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .calculate-button:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-1px);
        }

        .mark-all-correct-button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .mark-all-correct-button:hover {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
          transform: translateY(-1px);
        }

        .mark-all-incorrect-button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .mark-all-incorrect-button:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          transform: translateY(-1px);
        }

        .feedback-section {
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .feedback-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-size: 1.125rem;
        }

        .feedback-textarea {
          width: 100%;
          padding: 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.75rem;
          resize: none;
          transition: all 0.2s;
          font-family: inherit;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          min-height: 100px;
        }

        .feedback-textarea:focus {
          outline: none;
          border-color: transparent;
          box-shadow:
            0 0 0 2px #3b82f6,
            0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .previous-feedback {
          padding: 1rem;
          background: #f3f4f6;
          border-radius: 0.5rem;
          border-left: 4px solid #9ca3af;
        }

        .previous-feedback strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .previous-feedback p {
          margin: 0 0 0.5rem 0;
          color: #4b5563;
          font-size: 0.875rem;
        }

        .previous-feedback small {
          color: #9ca3af;
          font-size: 0.75rem;
        }

        .action-buttons {
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f9fafb;
        }

        .delete-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }

        .delete-button:hover {
          background: #fecaca;
        }

        .submit-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .cancel-button {
          padding: 0.75rem 1.5rem;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.2s;
          cursor: pointer;
        }

        .cancel-button:hover {
          background: #f3f4f6;
        }

        .submit-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }

        .submit-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          transform: translateY(-1px);
        }

        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default AdminTestDetailModal;
