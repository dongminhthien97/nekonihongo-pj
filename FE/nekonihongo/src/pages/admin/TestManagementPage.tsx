// src/pages/Admin/TestManagementPage.tsx
import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  MessageSquare,
  Trash2,
  Send,
  Bell,
  EyeOff,
  User,
  BookOpen,
  Star,
  RefreshCw,
} from "lucide-react";
import api from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

interface TestAnswer {
  questionId: number;
  userAnswer: string;
  isCorrect?: boolean;
  correctAnswer?: string;
}

interface UserTest {
  id: number;
  userId: number;
  userName?: string;
  userEmail?: string;
  lessonId: number;
  lessonTitle?: string;
  score?: number | null;
  status: "pending" | "feedbacked" | "reviewed";
  feedback: string | null;
  feedbackAt: string | null;
  submittedAt: string;
  answers?: TestAnswer[];
  timeSpent?: number;
}

interface TestManagementPageProps {
  onNavigate: (
    page: string,
    params?: { category?: string; level?: string },
  ) => void;
}

export function TestManagementPage({ onNavigate }: TestManagementPageProps) {
  const { user } = useAuth();

  const [tests, setTests] = useState<UserTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<UserTest | null>(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "feedbacked">(
    "pending",
  );
  const [search, setSearch] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [userInfoMap, setUserInfoMap] = useState<
    Record<number, { name: string; email: string }>
  >({});

  useEffect(() => {
    if (!user) {
      onNavigate("login");
      return;
    }
    if (user.role !== "ADMIN") {
      toast.error("Bạn không có quyền truy cập trang quản trị 😿");
      onNavigate("landing");
      return;
    }
    fetchTests();
    fetchUnreadCount();
  }, [user, onNavigate, filter]);

  useEffect(() => {
    if (search) {
      fetchTestsWithSearch();
    }
  }, [search]);

  const fetchUserInfo = async (userIds: number[]) => {
    try {
      const uniqueIds = [...new Set(userIds)];
      const userPromises = uniqueIds.map((id) =>
        api.get(`/admin/users/${id}`).catch(() => null),
      );

      const responses = await Promise.all(userPromises);
      const userMap: Record<number, { name: string; email: string }> = {};

      responses.forEach((res, index) => {
        if (res && res.data) {
          userMap[uniqueIds[index]] = {
            name:
              res.data.data?.fullName ||
              res.data.data?.username ||
              `User ${uniqueIds[index]}`,
            email: res.data.data?.email || "N/A",
          };
        }
      });

      setUserInfoMap((prev) => ({ ...prev, ...userMap }));
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const fetchTests = async () => {
    console.log("[TestManagement] Fetching tests...");
    try {
      setLoading(true);

      let url = "/admin/mini-test/submissions";
      if (filter === "pending") {
        url = "/admin/mini-test/pending";
      } else if (filter === "feedbacked") {
        url = "/admin/mini-test/submissions";
      }

      const response = await api.get(url);
      console.log("[TestManagement] Tests response:", response.data);

      const backendData = response.data.data || response.data || [];

      const mappedTests: UserTest[] = backendData.map((item: any) => {
        let answers: TestAnswer[] = [];
        if (item.answers && typeof item.answers === "string") {
          try {
            const parsed = JSON.parse(item.answers);
            if (Array.isArray(parsed)) {
              answers = parsed.map((ans: any) => ({
                questionId: ans.questionId || ans.question_id || 0,
                userAnswer:
                  ans.userAnswer ||
                  ans.user_answer ||
                  ans.answer ||
                  String(ans),
                isCorrect: ans.isCorrect || ans.is_correct || undefined,
                correctAnswer:
                  ans.correctAnswer || ans.correct_answer || undefined,
              }));
            } else if (typeof parsed === "object") {
              answers = Object.entries(parsed).map(([key, value]) => ({
                questionId: parseInt(key) || 0,
                userAnswer:
                  typeof value === "string" ? value : JSON.stringify(value),
                isCorrect: undefined,
                correctAnswer: undefined,
              }));
            }
          } catch (e) {
            console.error("Error parsing answers:", e);
          }
        } else if (Array.isArray(item.answers)) {
          answers = item.answers.map((ans: any) => ({
            questionId: ans.questionId || ans.question_id || 0,
            userAnswer:
              ans.userAnswer || ans.user_answer || ans.answer || String(ans),
            isCorrect: ans.isCorrect || ans.is_correct || undefined,
            correctAnswer: ans.correctAnswer || ans.correct_answer || undefined,
          }));
        }

        return {
          id: item.id,
          userId: item.userId || item.user_id,
          userName:
            item.userName ||
            item.user_name ||
            `User ${item.userId || item.user_id}`,
          userEmail: item.userEmail || item.user_email || "N/A",
          lessonId: item.lessonId || item.lesson_id,
          lessonTitle:
            item.lessonTitle ||
            item.lesson_title ||
            `Bài ${item.lessonId || item.lesson_id}`,
          score: item.score || null,
          status: item.status || "pending",
          feedback: item.feedback || item.admin_feedback || null,
          feedbackAt: item.feedbackAt || item.feedback_at || null,
          submittedAt:
            item.submittedAt ||
            item.submitted_at ||
            item.created_at ||
            new Date().toISOString(),
          answers: answers,
          timeSpent: item.timeSpent || item.time_spent || 0,
        };
      });

      let filteredTests = mappedTests;
      if (filter === "feedbacked") {
        filteredTests = mappedTests.filter(
          (t) => t.status === "feedbacked" || t.status === "reviewed",
        );
      }

      setTests(filteredTests);

      const userIds = filteredTests
        .filter((t) => !userInfoMap[t.userId])
        .map((t) => t.userId);

      if (userIds.length > 0) {
        fetchUserInfo(userIds);
      }
    } catch (error: any) {
      console.error("[TestManagement] Error fetching tests:", error);

      if (error.response?.status === 404) {
        try {
          const response = await api.get("/admin/mini-test");
          console.log("Fallback response:", response.data);

          const fallbackData = response.data.data || response.data || [];
          const mappedTests: UserTest[] = fallbackData.map((item: any) => ({
            id: item.id,
            userId: item.userId || 0,
            userName: `User ${item.userId || 0}`,
            userEmail: "N/A",
            lessonId: item.lessonId || 0,
            lessonTitle: `Bài ${item.lessonId || 0}`,
            score: null,
            status: "pending",
            feedback: null,
            feedbackAt: null,
            submittedAt: new Date().toISOString(),
            answers: [],
            timeSpent: 0,
          }));

          setTests(mappedTests);
        } catch (fallbackError) {
          toast.error("Không thể kết nối đến server mini-test 😿");
          setTests([]);
        }
      } else {
        toast.error(
          error.response?.data?.message || "Lỗi khi tải danh sách bài test",
        );
        setTests([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTestsWithSearch = async () => {
    console.log("Searching for:", search);
    fetchTests();
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/admin/mini-test/pending-count");
      setUnreadCount(response.data.count || response.data || 0);
    } catch (error: any) {
      if (error.response?.status === 401) {
        onNavigate("login");
      }
      console.error("Error fetching unread count:", error);
      setUnreadCount(0);
    }
  };

  const handleReviewTest = (test: UserTest) => {
    setSelectedTest(test);
    setFeedback(test.feedback || "");
    setScore(test.score ?? null);
    setShowDetail(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedTest || !feedback.trim()) return;

    try {
      await api.post(
        `/admin/mini-test/submission/${selectedTest.id}/feedback`,
        {
          feedback: feedback,
          score: score || undefined,
        },
      );

      try {
        await api.post("/notifications", {
          user_id: selectedTest.userId,
          type: "test_reviewed",
          title: `Phản hồi bài Mini Test - Bài ${selectedTest.lessonId}`,
          message: `Giáo viên đã phản hồi bài test của bạn. Hãy kiểm tra để xem chi tiết!`,
          related_id: selectedTest.id,
        });
      } catch (notifError) {
        console.warn("Notification failed:", notifError);
      }

      fetchTests();
      fetchUnreadCount();

      setShowDetail(false);
      setSelectedTest(null);
      setFeedback("");
      setScore(null);

      toast.success("Đã gửi phản hồi thành công! ✅");
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi gửi phản hồi 😿",
      );
    }
  };

  const handleDeleteTest = async (testId: number) => {
    if (
      !confirm(
        "Bạn có chắc muốn xóa bài test này? Hành động này không thể hoàn tác.",
      )
    )
      return;

    try {
      await api.delete(`/admin/mini-test/submission/${testId}`);
      fetchTests();
      toast.success("Đã xóa bài test thành công! ✅");
    } catch (error: any) {
      console.error("Error deleting test:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa bài test 😿",
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/admin/mini-test/mark-all-read");
      setUnreadCount(0);
      toast.success("Đã đánh dấu tất cả là đã đọc! ✅");
    } catch (error) {
      console.error("Error marking all as read:", error);
      setUnreadCount(0);
      toast.success("Đã đánh dấu tất cả là đã đọc! ✅");
    }
  };

  const calculateScoreFromAnswers = (answers: TestAnswer[]) => {
    if (!answers || answers.length === 0) return 0;
    const correctAnswers = answers.filter((a) => a.isCorrect === true).length;
    if (correctAnswers > 0) return correctAnswers;
    return answers.length;
  };

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  const filteredTests = search
    ? tests.filter(
        (test) =>
          test.userName?.toLowerCase().includes(search.toLowerCase()) ||
          test.lessonTitle?.toLowerCase().includes(search.toLowerCase()) ||
          test.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
          test.lessonId.toString().includes(search),
      )
    : tests;

  return (
    <div className="test-management-page">
      <div className="page-container">
        {/* Header Section */}
        <div className="header-section">
          <div className="header-content">
            <div>
              <h1 className="page-title">Quản lý Mini Test</h1>
              <p className="page-subtitle">
                Xem và phản hồi bài test của học viên
              </p>
            </div>
            <div className="header-actions">
              <div className="notification-button-wrapper">
                <button
                  onClick={markAllAsRead}
                  className="notification-button"
                  title="Đánh dấu tất cả đã đọc"
                >
                  <Bell className="notification-icon" />
                  {unreadCount > 0 && (
                    <span className="notification-badge">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
              </div>
              <button onClick={fetchTests} className="refresh-button">
                <RefreshCw className="refresh-icon" />
                Làm mới
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="filter-search-section">
            <div className="filter-buttons">
              <button
                onClick={() => setFilter("all")}
                className={`filter-button ${filter === "all" ? "filter-button-active" : ""}`}
              >
                <Filter className="filter-icon" />
                Tất cả ({tests.length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`filter-button ${filter === "pending" ? "filter-button-active" : ""}`}
              >
                <Clock className="filter-icon" />
                Chờ duyệt ({tests.filter((t) => t.status === "pending").length})
              </button>
              <button
                onClick={() => setFilter("feedbacked")}
                className={`filter-button ${filter === "feedbacked" ? "filter-button-active" : ""}`}
              >
                <CheckCircle className="filter-icon" />
                Đã phản hồi (
                {
                  tests.filter(
                    (t) => t.status === "feedbacked" || t.status === "reviewed",
                  ).length
                }
                )
              </button>
            </div>
            <div className="search-container">
              <div className="search-input-wrapper">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Tìm theo tên học viên, email hoặc bài học..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner">
              <div className="spinner-circle"></div>
              <div className="spinner-icon">
                <BookOpen className="book-icon" />
              </div>
            </div>
            <p className="loading-text">Đang tải bài test...</p>
            <p className="loading-subtext">Vui lòng đợi trong giây lát</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="stats-container">
              <div className="stat-card stat-card-total">
                <div>
                  <p className="stat-label">Tổng bài nộp</p>
                  <p className="stat-value">{tests.length}</p>
                </div>
                <div className="stat-icon-wrapper">
                  <BookOpen className="stat-icon" />
                </div>
              </div>
              <div className="stat-card stat-card-pending">
                <div>
                  <p className="stat-label">Chờ duyệt</p>
                  <p className="stat-value">
                    {tests.filter((t) => t.status === "pending").length}
                  </p>
                </div>
                <div className="stat-icon-wrapper">
                  <Clock className="stat-icon" />
                </div>
              </div>
              <div className="stat-card stat-card-reviewed">
                <div>
                  <p className="stat-label">Đã duyệt</p>
                  <p className="stat-value">
                    {
                      tests.filter(
                        (t) =>
                          t.status === "feedbacked" || t.status === "reviewed",
                      ).length
                    }
                  </p>
                </div>
                <div className="stat-icon-wrapper">
                  <CheckCircle className="stat-icon" />
                </div>
              </div>
            </div>

            {/* Test List */}
            {filteredTests.length > 0 ? (
              <div className="test-table-container">
                <div className="table-wrapper">
                  <table className="test-table">
                    <thead className="table-header">
                      <tr>
                        <th className="table-header-cell">
                          <div className="header-cell-content">
                            <User className="header-icon" />
                            Học viên
                          </div>
                        </th>
                        <th className="table-header-cell">
                          <div className="header-cell-content">
                            <BookOpen className="header-icon" />
                            Bài học
                          </div>
                        </th>
                        <th className="table-header-cell">
                          <div className="header-cell-content">
                            <Star className="header-icon" />
                            Điểm
                          </div>
                        </th>
                        <th className="table-header-cell">Trạng thái</th>
                        <th className="table-header-cell">Thời gian</th>
                        <th className="table-header-cell">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {filteredTests.map((test) => {
                        const userInfo = userInfoMap[test.userId] || {};
                        const displayName = userInfo.name || test.userName;
                        const displayEmail = userInfo.email || test.userEmail;

                        return (
                          <tr key={test.id} className="table-row">
                            <td className="table-cell">
                              <div className="user-info">
                                <p className="user-name">{displayName}</p>
                                <p className="user-email">{displayEmail}</p>
                              </div>
                            </td>
                            <td className="table-cell">
                              <div className="lesson-info">
                                <p className="lesson-id">Bài {test.lessonId}</p>
                                <p className="lesson-title">
                                  {test.lessonTitle}
                                </p>
                              </div>
                            </td>
                            <td className="table-cell">
                              <span
                                className={`score-badge ${
                                  test.score != null
                                    ? (test.score ?? 0) >= 5
                                      ? "score-good"
                                      : "score-poor"
                                    : "score-unscored"
                                }`}
                              >
                                {test.score ?? "Chưa chấm"}
                              </span>
                            </td>
                            <td className="table-cell">
                              <span
                                className={`status-badge ${
                                  test.status === "pending"
                                    ? "status-pending"
                                    : test.status === "feedbacked" ||
                                        test.status === "reviewed"
                                      ? "status-reviewed"
                                      : "status-other"
                                }`}
                              >
                                {test.status === "pending" ? (
                                  <>
                                    <Clock className="status-icon" />
                                    Chờ duyệt
                                  </>
                                ) : test.status === "feedbacked" ||
                                  test.status === "reviewed" ? (
                                  <>
                                    <CheckCircle className="status-icon" />
                                    Đã phản hồi
                                  </>
                                ) : (
                                  <>
                                    <MessageSquare className="status-icon" />
                                    Đã trả
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="table-cell">
                              <div className="time-info">
                                <p className="date-text">
                                  {new Date(
                                    test.submittedAt,
                                  ).toLocaleDateString("vi-VN")}
                                </p>
                                <p className="time-text">
                                  {new Date(
                                    test.submittedAt,
                                  ).toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                {test.timeSpent && test.timeSpent > 0 && (
                                  <p className="duration-text">
                                    {Math.floor(test.timeSpent / 60)}:
                                    {String(test.timeSpent % 60).padStart(
                                      2,
                                      "0",
                                    )}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="table-cell">
                              <div className="action-buttons">
                                <button
                                  onClick={() => handleReviewTest(test)}
                                  className="action-button action-button-review"
                                  title="Xem và phản hồi"
                                >
                                  <MessageSquare className="action-icon" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTest(test.id)}
                                  className="action-button action-button-delete"
                                  title="Xóa bài test"
                                >
                                  <Trash2 className="action-icon" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon-wrapper">
                  <MessageSquare className="empty-icon" />
                </div>
                <h3 className="empty-title">
                  {search
                    ? "Không tìm thấy bài test phù hợp"
                    : "Chưa có bài test nào"}
                </h3>
                <p className="empty-description">
                  {search
                    ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc tìm kiếm"
                    : "Học viên chưa nộp bài test nào cho các bài học ngữ pháp"}
                </p>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="clear-search-button"
                  >
                    Xóa bộ lọc tìm kiếm
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedTest && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div className="modal-header-content">
                <h2 className="modal-title">
                  Bài test của {selectedTest.userName}
                </h2>
                <p className="modal-subtitle">
                  Bài {selectedTest.lessonId}: {selectedTest.lessonTitle}
                </p>
                <div className="modal-info">
                  <span
                    className={`modal-status ${
                      selectedTest.status === "pending"
                        ? "modal-status-pending"
                        : "modal-status-reviewed"
                    }`}
                  >
                    {selectedTest.status === "pending"
                      ? "Chờ duyệt"
                      : "Đã phản hồi"}
                  </span>
                  <span className="modal-time">
                    Nộp lúc:{" "}
                    {new Date(selectedTest.submittedAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
              <div className="modal-header-actions">
                <button
                  onClick={() => setShowDetail(false)}
                  className="modal-close-button"
                  title="Đóng"
                >
                  <EyeOff className="close-icon" />
                </button>
              </div>
            </div>

            <div className="modal-content">
              {/* Answers Section */}
              <div className="answers-section">
                <div className="answers-header">
                  <h3 className="answers-title">Chi tiết bài làm</h3>
                  <span className="answers-count">
                    {selectedTest.answers?.length ?? 0} câu hỏi
                  </span>
                </div>

                {selectedTest.answers && selectedTest.answers.length > 0 ? (
                  <div className="answers-list">
                    {selectedTest.answers.map((answer, index) => (
                      <div key={index} className="answer-card">
                        <div className="answer-header">
                          <div className="answer-info">
                            <span className="question-number">
                              Câu {answer.questionId || index + 1}
                            </span>
                            {selectedTest.score != null &&
                              answer.isCorrect !== undefined && (
                                <span
                                  className={`answer-correctness ${
                                    answer.isCorrect
                                      ? "answer-correct"
                                      : "answer-incorrect"
                                  }`}
                                >
                                  {answer.isCorrect ? "✓ Đúng" : "✗ Sai"}
                                </span>
                              )}
                          </div>
                        </div>
                        <div className="answer-content">
                          <p className="answer-label">Câu trả lời:</p>
                          <div className="answer-text">
                            {answer.userAnswer || "(Không có câu trả lời)"}
                          </div>
                          {answer.correctAnswer && (
                            <div className="correct-answer">
                              <p className="correct-label">Đáp án đúng:</p>
                              <p className="correct-text">
                                {answer.correctAnswer}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-answers">
                    <MessageSquare className="no-answers-icon" />
                    <p className="no-answers-text">
                      Không có dữ liệu câu trả lời
                    </p>
                    <p className="no-answers-subtext">
                      Có thể bài test chưa được lưu đúng cách
                    </p>
                  </div>
                )}

                {/* Time Spent */}
                {selectedTest.timeSpent && selectedTest.timeSpent > 0 && (
                  <div className="time-spent-card">
                    <p className="time-label">Thời gian làm bài</p>
                    <p className="time-value">
                      {Math.floor(selectedTest.timeSpent / 60)}:
                      {String(selectedTest.timeSpent % 60).padStart(2, "0")}
                    </p>
                    <p className="time-detail">
                      ({Math.floor(selectedTest.timeSpent / 60)} phút{" "}
                      {selectedTest.timeSpent % 60} giây)
                    </p>
                  </div>
                )}
              </div>

              {/* Scoring Section */}
              {selectedTest.score == null && (
                <div className="scoring-section">
                  <h4 className="scoring-title">
                    <Star className="scoring-icon" />
                    Chấm điểm bài test
                  </h4>
                  <div className="scoring-content">
                    <div className="scoring-input-area">
                      <p className="scoring-instruction">
                        Nhập điểm số cho bài test này (0-
                        {selectedTest.answers?.length || 10} điểm):
                      </p>
                      <div className="score-input-group">
                        <input
                          type="number"
                          min="0"
                          max={selectedTest.answers?.length || 10}
                          value={score ?? ""}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 0) {
                              setScore(value);
                            } else {
                              setScore(null);
                            }
                          }}
                          placeholder="Nhập điểm"
                          className="score-input"
                        />
                        <span className="score-max">
                          / {selectedTest.answers?.length || 10} điểm
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const calculatedScore = calculateScoreFromAnswers(
                          selectedTest.answers || [],
                        );
                        setScore(calculatedScore);
                      }}
                      className="auto-score-button"
                    >
                      Tính điểm tự động
                    </button>
                  </div>
                </div>
              )}

              {/* Feedback Area */}
              <div className="feedback-section">
                <h3 className="feedback-title">
                  <MessageSquare className="feedback-icon" />
                  Phản hồi của Admin
                </h3>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Nhập phản hồi chi tiết cho học viên (đúng/sai, gợi ý cải thiện, lời khen...)"
                  className="feedback-textarea"
                  rows={4}
                />
                <div className="feedback-actions">
                  <div className="feedback-info">
                    {selectedTest.feedbackAt && (
                      <p className="previous-feedback">
                        Phản hồi trước:{" "}
                        {new Date(selectedTest.feedbackAt).toLocaleString(
                          "vi-VN",
                        )}
                      </p>
                    )}
                  </div>
                  <div className="feedback-buttons">
                    <button
                      onClick={() => setShowDetail(false)}
                      className="feedback-cancel-button"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSubmitFeedback}
                      disabled={!feedback.trim()}
                      className="feedback-submit-button"
                    >
                      <Send className="submit-icon" />
                      Gửi phản hồi {score != null && `(${score} điểm)`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Layout */
        .test-management-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%);
          padding: 1rem;
        }

        @media (min-width: 768px) {
          .test-management-page {
            padding: 1.5rem;
          }
        }

        .page-container {
          max-width: 1280px;
          margin: 0 auto;
        }

        /* Header Section */
        .header-section {
          margin-bottom: 2rem;
        }

        .header-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 768px) {
          .header-content {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .page-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .page-subtitle {
          color: #6b7280;
          margin-top: 0.5rem;
          margin-bottom: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .notification-button-wrapper {
          position: relative;
        }

        .notification-button {
          position: relative;
          padding: 0.75rem;
          background: white;
          border-radius: 9999px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.2s;
        }

        .notification-button:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          background: #f9fafb;
        }

        .notification-icon {
          width: 1.5rem;
          height: 1.5rem;
          color: #4b5563;
          transition: color 0.2s;
        }

        .notification-button:hover .notification-icon {
          color: #2563eb;
        }

        .notification-badge {
          position: absolute;
          top: -0.25rem;
          right: -0.25rem;
          background: #ef4444;
          color: white;
          font-size: 0.75rem;
          border-radius: 9999px;
          width: 1.5rem;
          height: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s infinite;
          box-shadow: 0 0 0 2px white;
        }

        .refresh-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.2s;
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
        }

        .refresh-button:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);
          transform: translateY(-1px);
        }

        .refresh-icon {
          width: 1rem;
          height: 1rem;
        }

        /* Filter & Search */
        .filter-search-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 768px) {
          .filter-search-section {
            flex-direction: row;
          }
        }

        .filter-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .filter-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          border-radius: 0.5rem;
          background: white;
          color: #374151;
          font-weight: 500;
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .filter-button:hover {
          background: #f3f4f6;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .filter-button-active {
          background: linear-gradient(135deg, var(--primary-from) 0%, var(--primary-to) 100%);
          color: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
        }

        .filter-icon {
          width: 1rem;
          height: 1rem;
        }

        .search-container {
          flex: 1;
        }

        .search-input-wrapper {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          width: 1.25rem;
          height: 1.25rem;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 1px solid #d1d5db;
          border-radius: 0.75rem;
          background: white;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: transparent;
          box-shadow: 0 0 0 2px #3b82f6, 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .search-input:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        /* Loading State */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem 0;
          text-align: center;
        }

        .loading-spinner {
          position: relative;
          margin-bottom: 1rem;
        }

        .spinner-circle {
          width: 4rem;
          height: 4rem;
          border: 4px solid #dbeafe;
          border-top-color: #3b82f6;
          border-radius: 9999px;
          animation: spin 1s linear infinite;
        }

        .spinner-icon {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .book-icon {
          width: 2rem;
          height: 2rem;
          color: #3b82f6;
        }

        .loading-text {
          color: #4b5563;
          font-weight: 500;
          margin-top: 1rem;
          margin-bottom: 0.25rem;
        }

        .loading-subtext {
          color: #9ca3af;
          font-size: 0.875rem;
        }

        /* Stats */
        .stats-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        @media (min-width: 768px) {
          .stats-container {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .stat-card {
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-card-total {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border-color: #bfdbfe;
        }

        .stat-card-pending {
          background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
          border-color: #fed7aa;
        }

        .stat-card-reviewed {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-color: #bbf7d0;
        }

        .stat-label {
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .stat-card-total .stat-label {
          color: #2563eb;
        }

        .stat-card-pending .stat-label {
          color: #ea580c;
        }

        .stat-card-reviewed .stat-label {
          color: #16a34a;
        }

        .stat-value {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .stat-icon-wrapper {
          padding: 0.75rem;
          border-radius: 0.75rem;
        }

        .stat-card-total .stat-icon-wrapper {
          background: #dbeafe;
        }

        .stat-card-pending .stat-icon-wrapper {
          background: #ffedd5;
        }

        .stat-card-reviewed .stat-icon-wrapper {
          background: #dcfce7;
        }

        .stat-icon {
          width: 2rem;
          height: 2rem;
        }

        .stat-card-total .stat-icon {
          color: #2563eb;
        }

        .stat-card-pending .stat-icon {
          color: #ea580c;
        }

        .stat-card-reviewed .stat-icon {
          color: #16a34a;
        }

        /* Test Table */
        .test-table-container {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .test-table {
          width: 100%;
          border-collapse: collapse;
        }

        .table-header {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
        }

        .table-header-cell {
          padding: 1rem 1.5rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        .header-cell-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .header-icon {
          width: 1rem;
          height: 1rem;
        }

        .table-body {
          border-top: 1px solid #e5e7eb;
        }

        .table-row {
          border-bottom: 1px solid #f3f4f6;
          transition: background-color 0.15s;
        }

        .table-row:hover {
          background: rgba(249, 250, 251, 0.5);
        }

        .table-cell {
          padding: 1rem 1.5rem;
          white-space: nowrap;
        }

        .user-info, .lesson-info, .time-info {
          min-width: 0;
        }

        .user-name, .lesson-id {
          font-weight: 600;
          color: #111827;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email, .lesson-title, .time-text, .duration-text {
          font-size: 0.875rem;
          color: #6b7280;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-name, .lesson-id {
          max-width: 180px;
        }

        .user-email, .lesson-title {
          max-width: 180px;
        }

        .score-badge {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          border: 1px solid;
        }

        .score-good {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          color: #166534;
          border-color: #86efac;
        }

        .score-poor {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #991b1b;
          border-color: #fca5a5;
        }

        .score-unscored {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          color: #374151;
          border-color: #d1d5db;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          border: 1px solid;
        }

        .status-pending {
          background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);
          color: #9a3412;
          border-color: #fdba74;
        }

        .status-reviewed {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          color: #166534;
          border-color: #86efac;
        }

        .status-other {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e40af;
          border-color: #93c5fd;
        }

        .status-icon {
          width: 0.75rem;
          height: 0.75rem;
        }

        .date-text {
          color: #111827;
          font-weight: 500;
        }

        .time-text {
          color: #6b7280;
          margin-top: 0.125rem;
        }

        .duration-text {
          color: #9ca3af;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .action-button {
          padding: 0.625rem;
          border-radius: 0.75rem;
          transition: all 0.2s;
        }

        .action-button:hover {
          transform: scale(1.05);
        }

        .action-button-review {
          color: #2563eb;
        }

        .action-button-review:hover {
          background: #dbeafe;
        }

        .action-button-delete {
          color: #dc2626;
        }

        .action-button-delete:hover {
          background: #fee2e2;
        }

        .action-icon {
          width: 1.125rem;
          height: 1.125rem;
          transition: transform 0.2s;
        }

        .action-button:hover .action-icon {
          transform: scale(1.1);
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 0;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .empty-icon-wrapper {
          display: inline-flex;
          padding: 1rem;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border-radius: 1rem;
          margin-bottom: 1rem;
        }

        .empty-icon {
          width: 4rem;
          height: 4rem;
          color: #60a5fa;
        }

        .empty-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .empty-description {
          color: #6b7280;
          max-width: 28rem;
          margin: 0 auto 1rem;
        }

        .clear-search-button {
          display: inline-block;
          padding: 0.5rem 1rem;
          color: #2563eb;
          font-weight: 500;
          background: #eff6ff;
          border-radius: 0.5rem;
          transition: color 0.2s, background-color 0.2s;
        }

        .clear-search-button:hover {
          color: #1d4ed8;
          background: #dbeafe;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 50;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-container {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          width: 100%;
          max-width: 64rem;
          max-height: 90vh;
          overflow: hidden;
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #f3f4f6;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .modal-header-content {
          flex: 1;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .modal-subtitle {
          color: #6b7280;
          margin: 0.25rem 0 0;
        }

        .modal-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .modal-status {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .modal-status-pending {
          background: #ffedd5;
          color: #9a3412;
        }

        .modal-status-reviewed {
          background: #dcfce7;
          color: #166534;
        }

        .modal-time {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .modal-header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .modal-close-button {
          padding: 0.625rem;
          color: #9ca3af;
          border-radius: 0.75rem;
          transition: all 0.2s;
        }

        .modal-close-button:hover {
          color: #4b5563;
          background: #f3f4f6;
          transform: scale(1.05);
        }

        .close-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .modal-content {
          padding: 1.5rem;
          overflow-y: auto;
          max-height: 60vh;
        }

        /* Answers Section */
        .answers-section {
          margin-bottom: 2rem;
        }

        .answers-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .answers-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .answers-count {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .answers-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .answer-card {
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 1rem;
          transition: all 0.2s;
        }

        .answer-card:hover {
          border-color: #93c5fd;
          background: rgba(219, 234, 254, 0.3);
        }

        .answer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .answer-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .question-number {
          padding: 0.25rem 0.75rem;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 9999px;
        }

        .answer-correctness {
          padding: 0.125rem 0.5rem;
          font-size: 0.75rem;
          border-radius: 9999px;
        }

        .answer-correct {
          background: #dcfce7;
          color: #166534;
        }

        .answer-incorrect {
          background: #fee2e2;
          color: #991b1b;
        }

        .answer-content {
          background: white;
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid #f3f4f6;
        }

        .answer-label {
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .answer-text {
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.875rem;
          color: #1f2937;
          word-break: break-word;
        }

        .correct-answer {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 0.5rem;
        }

        .correct-label {
          font-weight: 500;
          color: #166534;
          margin-bottom: 0.25rem;
        }

        .correct-text {
          color: #15803d;
          margin: 0;
        }

        .no-answers {
          text-align: center;
          padding: 2rem;
          background: #f9fafb;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
        }

        .no-answers-icon {
          width: 3rem;
          height: 3rem;
          color: #9ca3af;
          margin: 0 auto 0.75rem;
        }

        .no-answers-text {
          color: #6b7280;
          margin: 0;
        }

        .no-answers-subtext {
          color: #9ca3af;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .time-spent-card {
          padding: 1rem;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border: 1px solid #bfdbfe;
          border-radius: 0.75rem;
          margin-top: 1rem;
        }

        .time-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #2563eb;
          margin: 0;
        }

        .time-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e40af;
          margin: 0.25rem 0;
        }

        .time-detail {
          font-size: 0.875rem;
          color: #3b82f6;
          margin: 0;
        }

        /* Scoring Section */
        .scoring-section {
          margin-bottom: 1.5rem;
          padding: 1.25rem;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #fcd34d;
          border-radius: 0.75rem;
        }

        .scoring-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #92400e;
          margin: 0 0 0.75rem;
        }

        .scoring-icon {
          width: 1.125rem;
          height: 1.125rem;
        }

        .scoring-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: flex-start;
        }

        @media (min-width: 640px) {
          .scoring-content {
            flex-direction: row;
            align-items: center;
          }
        }

        .scoring-input-area {
          flex: 1;
        }

        .scoring-instruction {
          font-size: 0.875rem;
          color: #92400e;
          margin-bottom: 0.5rem;
        }

        .score-input-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .score-input {
          padding: 0.625rem 1rem;
          border: 1px solid #fbbf24;
          border-radius: 0.5rem;
          width: 8rem;
          background: white;
          transition: all 0.2s;
        }

        .score-input:focus {
          outline: none;
          border-color: transparent;
          box-shadow: 0 0 0 2px #f59e0b, 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .score-max {
          font-size: 0.875rem;
          color: #d97706;
        }

        .auto-score-button {
          padding: 0.625rem 1rem;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .auto-score-button:hover {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
          transform: translateY(-1px);
        }

        /* Feedback Section */
        .feedback-section {
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .feedback-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 1rem;
        }

        .feedback-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .feedback-textarea {
          width: 100%;
          padding: 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.75rem;
          resize: none;
          transition: all 0.2s;
          font-family: inherit;
        }

        .feedback-textarea:focus {
          outline: none;
          border-color: transparent;
          box-shadow: 0 0 0 2px #3b82f6, 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .feedback-textarea:hover {
          border-color: #9ca3af;
        }

        .feedback-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }

        @media (min-width: 640px) {
          .feedback-actions {
            flex-direction: row;
            justify-content: space-between;
          }
        }

        .feedback-info {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .previous-feedback {
          margin: 0;
        }

        .feedback-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .feedback-cancel-button {
          padding: 0.625rem 1.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          color: #374151;
          font-weight: 500;
          transition: all 0.2s;
          background: white;
        }

        .feedback-cancel-button:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .feedback-submit-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.2s;
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
        }

        .feedback-submit-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);
          transform: translateY(-1px);
        }

        .feedback-submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .submit-icon {
          width: 1rem;
          height: 1rem;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* CSS Variables */
        :root {
          --primary-from: #3b82f6;
          --primary-to: #2563eb;
          --pending-from: #ea580c;
          --pending-to: #c2410c;
          --success-from: #16a34a;
          --success-to: #15803d;
        }

        .filter-button-active[data-filter="all"] {
          --primary-from: #3b82f6;
          --primary-to: #2563eb;
        }

        .filter-button-active[data-filter="pending"] {
          --primary-from: #ea580c;
          --primary-to: #c2410c;
        }

        .filter-button-active[data-filter="feedbacked"] {
          --primary-from: #16a34a;
          --primary-to: #15803d;
        }
      `}</style>
    </div>
  );
}
