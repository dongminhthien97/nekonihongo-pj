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
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import api from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

// Cập nhật TestAnswer interface
interface TestAnswer {
  questionId: number;
  userAnswer: string;
  isCorrect?: boolean;
  correctAnswer?: string;
  allCorrectAnswers?: string;
  subQuestionIndex: number; // <-- BỎ DẤU "?" để thành required
  points?: number;
  maxPoints?: number;
  explanation?: string;
  questionType?: string;
  questionText?: string;
  originalAnswer?: string;
}

// Thay đổi từ 3 trạng thái thành 2 trạng thái
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

interface Question {
  id: number;
  lesson_id: number;
  type: "fill_blank" | "multiple_choice" | "rearrange";
  text: string;
  options: string[];
  correct_answer: string;
  points: number;
  explanation: string;
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
  const [evaluatedAnswers, setEvaluatedAnswers] = useState<TestAnswer[]>([]);
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const [questionsData, setQuestionsData] = useState<any>(null);

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

  const closeAllModals = () => {
    setShowDetail(false);
    setSelectedTest(null);
    setFeedback("");
    setScore(null);
    setEvaluatedAnswers([]);
    setCalculatedScore(null);
    setExpandedQuestions([]);
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

      let backendData: any[] = [];

      if (response.data.data && Array.isArray(response.data.data)) {
        backendData = response.data.data;
      } else if (Array.isArray(response.data)) {
        backendData = response.data;
      } else {
        console.warn("[TestManagement] Unexpected data format:", response.data);
        backendData = [];
      }

      console.log(
        "[TestManagement] Raw backend data samples:",
        backendData.slice(0, 3).map((item) => ({
          id: item.id,
          status: item.status,
          feedback: item.feedback,
          score: item.score,
          feedbackAt: item.feedbackAt,
          answers: item.answers,
        })),
      );

      const mappedTests: UserTest[] = backendData.map((item: any) => {
        // Parse answers từ database format
        let answers: TestAnswer[] = [];

        if (item.answers) {
          try {
            // Debug format answers
            console.log(
              `[fetchTests] Raw answers for submission ${item.id}:`,
              item.answers,
            );

            // TH1: Nếu answers là JSON string
            if (typeof item.answers === "string") {
              const parsed = JSON.parse(item.answers);
              console.log(
                `[fetchTests] Parsed JSON for submission ${item.id}:`,
                parsed,
              );

              // Convert từ JSON format thành mảng TestAnswer[]
              const testAnswers: TestAnswer[] = [];

              Object.entries(parsed).forEach(
                ([questionIdStr, answerValues]) => {
                  const questionId = parseInt(questionIdStr);

                  if (Array.isArray(answerValues)) {
                    // Mỗi phần tử trong array là một sub-answer
                    answerValues.forEach((value: any, index: number) => {
                      testAnswers.push({
                        questionId: questionId,
                        userAnswer: String(value),
                        subQuestionIndex: index,
                        originalAnswer: JSON.stringify(value),
                      });
                    });
                  } else {
                    // Single answer
                    testAnswers.push({
                      questionId: questionId,
                      userAnswer: String(answerValues),
                      subQuestionIndex: 0,
                      originalAnswer: String(answerValues),
                    });
                  }
                },
              );

              answers = testAnswers;
            }
            // TH2: Nếu answers đã là array
            else if (Array.isArray(item.answers)) {
              answers = item.answers.map((ans: any, index: number) => ({
                questionId: ans.questionId || ans.question_id || index + 1,
                userAnswer:
                  ans.userAnswer ||
                  ans.user_answer ||
                  ans.answer ||
                  String(ans),
                isCorrect: ans.isCorrect || ans.is_correct || undefined,
                correctAnswer:
                  ans.correctAnswer || ans.correct_answer || undefined,
                subQuestionIndex: ans.subQuestionIndex || 0,
                originalAnswer: JSON.stringify(ans),
              }));
            }
            // TH3: Nếu answers đã là object (không phải string)
            else if (typeof item.answers === "object") {
              const testAnswers: TestAnswer[] = [];

              Object.entries(item.answers).forEach(
                ([questionIdStr, answerValues]) => {
                  const questionId = parseInt(questionIdStr);

                  if (Array.isArray(answerValues)) {
                    answerValues.forEach((value: any, index: number) => {
                      testAnswers.push({
                        questionId: questionId,
                        userAnswer: String(value),
                        subQuestionIndex: index,
                        originalAnswer: JSON.stringify(value),
                      });
                    });
                  } else {
                    testAnswers.push({
                      questionId: questionId,
                      userAnswer: String(answerValues),
                      subQuestionIndex: 0,
                      originalAnswer: String(answerValues),
                    });
                  }
                },
              );

              answers = testAnswers;
            }
          } catch (e) {
            console.error(
              `[fetchTests] Error parsing answers for submission ${item.id}:`,
              e,
            );
          }
        }

        console.log(
          `[fetchTests] Processed answers for submission ${item.id}:`,
          answers,
        );

        // Xác định status đúng - CHỈ 2 TRẠNG THÁI
        let status: "pending" | "feedbacked" = "pending";

        console.log(`Submission ${item.id}:`, {
          rawStatus: item.status,
          feedback: item.feedback,
          score: item.score,
          feedbackAt: item.feedbackAt,
        });

        if (item.status) {
          const statusStr = String(item.status).toLowerCase();
          if (statusStr === "feedbacked") {
            status = "feedbacked";
          } else if (statusStr === "pending") {
            status = "pending";
          } else {
            // Nếu status không hợp lệ, dựa vào feedback/score
            if (item.feedback || item.score !== null) {
              status = "feedbacked";
            } else {
              status = "pending";
            }
          }
        } else {
          // Nếu không có status field, dựa vào feedback và score
          if (item.feedback || item.score !== null) {
            status = "feedbacked";
          } else {
            status = "pending";
          }
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
          score: item.score !== undefined ? item.score : null,
          status: status,
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

      console.log("[TestManagement] Status breakdown:", {
        total: mappedTests.length,
        pending: mappedTests.filter((t) => t.status === "pending").length,
        feedbacked: mappedTests.filter((t) => t.status === "feedbacked").length,
      });

      // Filter by status if needed
      let filteredTests = mappedTests;
      if (filter === "feedbacked") {
        filteredTests = mappedTests.filter((t) => t.status === "feedbacked");
      } else if (filter === "pending") {
        filteredTests = mappedTests.filter((t) => t.status === "pending");
      }

      setTests(filteredTests);

      // Fetch user info
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

          let fallbackData: any[] = [];
          if (response.data.data && Array.isArray(response.data.data)) {
            fallbackData = response.data.data;
          } else if (Array.isArray(response.data)) {
            fallbackData = response.data;
          }

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

  const handleReviewTest = async (test: UserTest) => {
    setSelectedTest(test);
    setFeedback(test.feedback || "");
    setScore(test.score ?? null);
    setShowDetail(true);

    // Fetch questions để debug
    const questions = await fetchQuestionsForLesson(test.lessonId);

    // Tính điểm tự động
    await calculateAutoScore(test);
  };

  const calculateSimpleScore = (answers: TestAnswer[]): number => {
    if (!answers || answers.length === 0) return 0;

    // Với format từ database, chúng ta cần xử lý đặc biệt
    if (answers.length === 1 && typeof answers[0].userAnswer === "string") {
      try {
        const answersJson = JSON.parse(answers[0].userAnswer as string);
        let totalAnswers = 0;
        let correctAnswers = 0;

        // Đây là logic đơn giản, cần điều chỉnh theo thực tế
        Object.entries(answersJson).forEach(([questionIdStr, answerValues]) => {
          const questionId = parseInt(questionIdStr);

          if (Array.isArray(answerValues)) {
            totalAnswers += answerValues.length;
            // Giả sử một số câu trả lời đúng
            correctAnswers += Math.floor(answerValues.length / 2);
          }
        });

        return totalAnswers > 0
          ? Math.round((correctAnswers / totalAnswers) * 100) / 10
          : 0;
      } catch (e) {
        console.error("Error in calculateSimpleScore:", e);
        return 0;
      }
    }

    return 0;
  };

  const handleCancelReview = () => {
    if (
      confirm("Bạn có muốn hủy việc chấm điểm? Thay đổi sẽ không được lưu.")
    ) {
      closeAllModals();
    }
  };

  const fetchQuestionsForLesson = async (lessonId: number) => {
    try {
      const response = await api.get(`/admin/questions/lesson/${lessonId}`);
      console.log(
        `[fetchQuestionsForLesson] Questions for lesson ${lessonId}:`,
        response.data,
      );
      setQuestionsData(response.data);
      return response.data;
    } catch (error) {
      console.error(
        `[fetchQuestionsForLesson] Error for lesson ${lessonId}:`,
        error,
      );
      return null;
    }
  };

  const calculateAutoScore = async (test: UserTest) => {
    try {
      const result = await calculateScoreFromAnswers(
        test.answers || [],
        test.lessonId,
      );

      setEvaluatedAnswers(result.evaluatedAnswers);
      setCalculatedScore(result.score);
      setScore(result.score);

      setSelectedTest({
        ...test,
        answers: result.evaluatedAnswers,
      });

      // Auto expand all questions
      const questionIds = result.evaluatedAnswers.map((a) => a.questionId);
      setExpandedQuestions([...new Set(questionIds)]);

      toast.success(
        `Đã tính điểm tự động: ${result.score}/${result.maxPossibleScore} điểm (${result.percentage}%)`,
      );
    } catch (error) {
      console.error("Error calculating score:", error);
      toast.error("Không thể tính điểm tự động 😿");

      const fallbackScore = calculateSimpleScore(test.answers || []);
      setCalculatedScore(fallbackScore);
      setScore(fallbackScore);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedTest || !feedback.trim()) {
      toast.error("Vui lòng nhập phản hồi cho học viên 😿");
      return;
    }

    try {
      const payload: any = {
        feedback: feedback.trim(),
        score: score !== null ? score : 0,
      };

      console.log("Submitting feedback payload:", payload);

      const response = await api.post(
        `/admin/mini-test/submission/${selectedTest.id}/feedback`,
        payload,
      );

      if (response.data.success) {
        try {
          await api.post("/notifications", {
            user_id: selectedTest.userId,
            type: "test_reviewed",
            title: `Phản hồi bài Mini Test - Bài ${selectedTest.lessonId}`,
            message: `Giáo viên đã chấm điểm bài test của bạn: ${payload.score} điểm. Hãy kiểm tra phản hồi chi tiết!`,
            related_id: selectedTest.id,
          });
        } catch (notifError) {
          console.warn("Notification failed:", notifError);
        }

        fetchTests();
        fetchUnreadCount();

        closeAllModals();

        toast.success(
          `Đã gửi phản hồi và chấm điểm ${payload.score} thành công! ✅`,
        );
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error("Error submitting feedback:", error);

      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }

      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi gửi phản hồi 😿",
      );
    }
  };
  const questionMapping: Record<number, { realId: number; subIndex: number }> =
    {
      // Câu hỏi 7: 5 phần (ID thực: 7)
      1: { realId: 7, subIndex: 0 },
      2: { realId: 7, subIndex: 1 },
      3: { realId: 7, subIndex: 2 },
      4: { realId: 7, subIndex: 3 },
      5: { realId: 7, subIndex: 4 },

      // Câu hỏi 8: 4 phần (ID thực: 8)
      6: { realId: 8, subIndex: 0 },
      7: { realId: 8, subIndex: 1 },
      8: { realId: 8, subIndex: 2 },
      9: { realId: 8, subIndex: 3 },

      // Câu hỏi 9: 6 phần (ID thực: 9)
      10: { realId: 9, subIndex: 0 },
      11: { realId: 9, subIndex: 1 },
      12: { realId: 9, subIndex: 2 },
      13: { realId: 9, subIndex: 3 },
      14: { realId: 9, subIndex: 4 },
      15: { realId: 9, subIndex: 5 },
    };

  const parseUserAnswersForEvaluation = (answers: TestAnswer[]): any[] => {
    const parsedAnswers: any[] = [];

    console.log("[parseUserAnswersForEvaluation] Raw answers input:", answers);

    if (!answers || answers.length === 0) {
      console.log("[parseUserAnswersForEvaluation] No answers to parse");
      return parsedAnswers;
    }

    console.log(
      `[parseUserAnswersForEvaluation] Total answers: ${answers.length}`,
    );

    // Process each answer
    answers.forEach((answer, index) => {
      console.log(
        `[parseUserAnswersForEvaluation] Processing answer ${index}:`,
        {
          questionId: answer.questionId,
          userAnswer: answer.userAnswer,
          subQuestionIndex: answer.subQuestionIndex,
          originalAnswer: answer.originalAnswer,
        },
      );

      // Skip if no userAnswer
      if (!answer.userAnswer && answer.userAnswer !== "") {
        console.log(
          `[parseUserAnswersForEvaluation] Skipping answer ${index} - no userAnswer`,
        );
        return;
      }

      // Map ID logic (1-15) sang ID thực (7-9) để gửi đến backend
      const mapping = questionMapping[answer.questionId];

      if (mapping) {
        parsedAnswers.push({
          questionId: mapping.realId, // Sử dụng ID thực từ database (7, 8, 9)
          userAnswer: String(answer.userAnswer).trim(),
          subQuestionIndex: mapping.subIndex, // Sub-index tương ứng
        });

        console.log(
          `[parseUserAnswersForEvaluation] Mapped ${answer.questionId} -> ${mapping.realId}.${mapping.subIndex}`,
        );
      } else {
        // Fallback: sử dụng ID gốc nếu không có mapping
        console.warn(
          `[parseUserAnswersForEvaluation] No mapping for question ID ${answer.questionId}, using original`,
        );
        parsedAnswers.push({
          questionId: answer.questionId,
          userAnswer: String(answer.userAnswer).trim(),
          subQuestionIndex: answer.subQuestionIndex || 0,
        });
      }
    });

    console.log(
      "[parseUserAnswersForEvaluation] Final parsed answers:",
      parsedAnswers,
    );
    console.log(
      `[parseUserAnswersForEvaluation] Total parsed answers: ${parsedAnswers.length}`,
    );

    return parsedAnswers;
  };

  const calculateScoreFromAnswers = async (
    answers: TestAnswer[],
    lessonId: number,
  ): Promise<{
    score: number;
    maxPossibleScore: number;
    percentage: number;
    evaluatedAnswers: TestAnswer[];
  }> => {
    if (!answers || answers.length === 0) {
      return {
        score: 0,
        maxPossibleScore: 0,
        percentage: 0,
        evaluatedAnswers: [],
      };
    }

    try {
      // Parse câu trả lời
      const parsedUserAnswers = parseUserAnswersForEvaluation(answers);

      // Debug: fetch câu hỏi từ lesson để kiểm tra
      try {
        const questionsResponse = await api.get(
          `/admin/questions/lesson/${lessonId}`,
        );
        console.log(
          "[calculateScoreFromAnswers] Questions in lesson:",
          questionsResponse.data,
        );
      } catch (questionsError) {
        console.error(
          "[calculateScoreFromAnswers] Error fetching questions:",
          questionsError,
        );
      }

      // Log để debug
      console.log("[calculateScoreFromAnswers] Sending to backend:", {
        lessonId,
        userAnswers: parsedUserAnswers,
      });

      // Gọi API đánh giá
      const response = await api.post("/admin/questions/evaluate-answers", {
        lessonId: lessonId,
        userAnswers: parsedUserAnswers,
      });

      console.log(
        "[calculateScoreFromAnswers] Backend response:",
        response.data,
      );

      if (response.data.success) {
        const evaluatedAnswers: TestAnswer[] =
          response.data.evaluatedAnswers.map((item: any) => {
            const formattedAnswer: TestAnswer = {
              questionId: item.questionId,
              userAnswer: item.userAnswer,
              isCorrect: item.isCorrect,
              correctAnswer: item.correctAnswer,
              allCorrectAnswers: item.allCorrectAnswers,
              subQuestionIndex: item.subQuestionIndex,
              points: item.points,
              maxPoints: item.maxPoints,
              explanation: item.explanation,
              questionType: item.questionType,
              questionText: item.questionText,
            };

            if (item.questionType === "fill_blank" && item.allCorrectAnswers) {
              try {
                const correctAnswersArray = item.allCorrectAnswers
                  .split(";")
                  .map((a: string) => a.trim());
                formattedAnswer.correctAnswer =
                  correctAnswersArray[item.subQuestionIndex || 0];
              } catch (e) {
                console.error("Error parsing allCorrectAnswers:", e);
              }
            }

            return formattedAnswer;
          });

        return {
          score: response.data.totalScore,
          maxPossibleScore: response.data.maxPossibleScore,
          percentage: response.data.percentage,
          evaluatedAnswers: evaluatedAnswers,
        };
      } else {
        console.error(
          "[calculateScoreFromAnswers] Backend error:",
          response.data,
        );
        throw new Error(response.data.message || "Evaluation failed");
      }
    } catch (error: any) {
      console.error("[calculateScoreFromAnswers] Error:", error);

      // Debug chi tiết hơn
      console.error("[calculateScoreFromAnswers] Answers input:", answers);
      console.error("[calculateScoreFromAnswers] Lesson ID:", lessonId);

      // Fallback: tính điểm đơn giản
      const fallbackScore = calculateSimpleScore(answers);
      const maxPossibleScore = answers.length * 10;

      return {
        score: fallbackScore,
        maxPossibleScore: maxPossibleScore,
        percentage: Math.round((fallbackScore / maxPossibleScore) * 100),
        evaluatedAnswers: answers.map((a, index) => ({
          ...a,
          questionId: index + 1, // Gán ID tạm
          isCorrect: false,
          points: 0,
          maxPoints: 10,
          correctAnswer: "N/A",
        })),
      };
    }
  };

  const toggleQuestionExpand = (questionId: number) => {
    if (expandedQuestions.includes(questionId)) {
      setExpandedQuestions(expandedQuestions.filter((id) => id !== questionId));
    } else {
      setExpandedQuestions([...expandedQuestions, questionId]);
    }
  };

  const toggleAllQuestions = () => {
    if (!selectedTest?.answers) return;

    const allQuestionIds = [
      ...new Set(selectedTest.answers.map((a) => a.questionId)),
    ];

    if (expandedQuestions.length === allQuestionIds.length) {
      setExpandedQuestions([]);
    } else {
      setExpandedQuestions(allQuestionIds);
    }
  };

  // Hàm map question type theo ID
  // Hàm map question type theo ID logic (1-15)
  const getQuestionTypeById = (questionId: number): string => {
    // Dựa trên mapping:
    // ID 1-5: câu hỏi 7 (fill_blank)
    // ID 6-9: câu hỏi 8 (fill_blank)
    // ID 10-15: câu hỏi 9 (multiple_choice)

    if (questionId >= 1 && questionId <= 5) {
      return "fill_blank";
    } else if (questionId >= 6 && questionId <= 9) {
      return "fill_blank";
    } else if (questionId >= 10 && questionId <= 15) {
      return "multiple_choice";
    }

    return "unknown";
  };

  // Hàm lấy số phần của câu hỏi
  const getQuestionPartsCount = (questionId: number): number => {
    const partsMap: Record<number, number> = {
      7: 5, // Question ID 7 có 5 ô trống
      8: 4, // Question ID 8 có 4 ô trống
      9: 6, // Question ID 9 có 6 lựa chọn
    };

    return partsMap[questionId] || 1;
  };

  // Hàm lấy question text từ questionsData
  const getQuestionTextById = (questionId: number): string => {
    if (!questionsData?.data) return "";

    const question = questionsData.data.find((q: any) => q.id === questionId);
    return question?.text || "";
  };

  const getQuestionTypeLabel = (type?: string) => {
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

  const getAnswerStatus = (isCorrect?: boolean) => {
    if (isCorrect === undefined) return "unknown";
    return isCorrect ? "correct" : "incorrect";
  };

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
                {tests.filter((t) => t.status === "feedbacked").length})
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
                    {tests.filter((t) => t.status === "feedbacked").length}
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
                                    : "status-reviewed"
                                }`}
                              >
                                {test.status === "pending" ? (
                                  <>
                                    <Clock className="status-icon" />
                                    Chờ duyệt
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="status-icon" />
                                    Đã phản hồi
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
                  onClick={closeAllModals}
                  className="modal-close-button"
                  title="Đóng"
                >
                  <EyeOff className="close-icon" />
                </button>
              </div>
            </div>

            <div className="modal-content">
              {/* Mapping Warning */}
              {selectedTest.answers &&
                selectedTest.answers.some((a) => a.questionId < 7) && (
                  <div className="mapping-warning">
                    <p className="warning-text">
                      <X size={16} />
                      Cảnh báo: Có thể có vấn đề mapping ID câu hỏi
                    </p>
                  </div>
                )}

              {/* Answers Section */}
              <div className="answers-section">
                <div className="answers-header">
                  <div>
                    <h3 className="answers-title">Chi tiết bài làm</h3>
                    <p className="answers-count">
                      {selectedTest.answers?.length ?? 0} câu hỏi
                    </p>
                  </div>
                  <div className="answers-actions">
                    <button
                      onClick={toggleAllQuestions}
                      className="toggle-all-button"
                    >
                      {expandedQuestions.length ===
                      new Set(selectedTest.answers?.map((a) => a.questionId))
                        .size
                        ? "Thu gọn tất cả"
                        : "Mở rộng tất cả"}
                    </button>
                  </div>
                </div>

                {selectedTest.answers && selectedTest.answers.length > 0 ? (
                  <div className="answers-list">
                    {/* Group by questionId */}
                    {Array.from(
                      new Set(selectedTest.answers.map((a) => a.questionId)),
                    )
                      .sort((a, b) => a - b)
                      .map((questionId) => {
                        const questionAnswers = selectedTest.answers!.filter(
                          (a) => a.questionId === questionId,
                        );
                        const isExpanded =
                          expandedQuestions.includes(questionId);
                        const questionType = getQuestionTypeById(questionId);
                        const partsCount = getQuestionPartsCount(questionId);
                        const questionText = getQuestionTextById(questionId);

                        // Calculate score for this question
                        const totalPoints = questionAnswers.reduce(
                          (sum, a) => sum + (a.points || 0),
                          0,
                        );
                        const maxPoints = partsCount * 10; // Assuming 10 points per part

                        // Determine if all parts are correct
                        const allCorrect = questionAnswers.every(
                          (a) => a.isCorrect === true,
                        );
                        const someCorrect = questionAnswers.some(
                          (a) => a.isCorrect === true,
                        );

                        return (
                          <div key={questionId} className="question-card">
                            <div
                              className="question-header"
                              onClick={() => toggleQuestionExpand(questionId)}
                            >
                              <div className="question-header-info">
                                <span className="question-number">
                                  Câu hỏi {questionId}
                                  {partsCount > 1 && ` (${partsCount} phần)`}
                                </span>
                                <span
                                  className={`question-type ${questionType}`}
                                >
                                  {getQuestionTypeLabel(questionType)}
                                </span>
                                <span className="question-points">
                                  {totalPoints}/{maxPoints} điểm
                                </span>
                                <span
                                  className={`question-status ${
                                    allCorrect
                                      ? "correct"
                                      : someCorrect
                                        ? "partial"
                                        : "incorrect"
                                  }`}
                                >
                                  {allCorrect ? (
                                    <>
                                      <Check size={14} /> Đúng
                                    </>
                                  ) : someCorrect ? (
                                    <>
                                      <Check size={14} /> Một phần
                                    </>
                                  ) : (
                                    <>
                                      <X size={14} /> Sai
                                    </>
                                  )}
                                </span>
                              </div>
                              <div className="question-header-actions">
                                <span className="expand-icon">
                                  {isExpanded ? (
                                    <ChevronUp size={18} />
                                  ) : (
                                    <ChevronDown size={18} />
                                  )}
                                </span>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="question-content">
                                {questionText && (
                                  <div className="question-text">
                                    <p className="text-label">Câu hỏi:</p>
                                    <div className="text-content">
                                      {questionText}
                                    </div>
                                  </div>
                                )}

                                {/* Hiển thị từng phần của câu hỏi */}
                                {questionAnswers.map((answer, index) => {
                                  const evaluatedAnswer = evaluatedAnswers.find(
                                    (a) =>
                                      a.questionId === answer.questionId &&
                                      a.subQuestionIndex ===
                                        answer.subQuestionIndex,
                                  );

                                  return (
                                    <div key={index} className="answer-detail">
                                      {questionAnswers.length > 1 && (
                                        <div className="sub-question-label">
                                          Phần {answer.subQuestionIndex + 1}
                                        </div>
                                      )}

                                      <div className="answer-comparison">
                                        <div className="answer-item">
                                          <p className="answer-label">
                                            Học viên trả lời:
                                          </p>
                                          <div
                                            className={`answer-value ${
                                              answer.isCorrect
                                                ? "correct"
                                                : answer.isCorrect === false
                                                  ? "incorrect"
                                                  : "unknown"
                                            }`}
                                          >
                                            {answer.userAnswer ||
                                              "(Không có câu trả lời)"}
                                          </div>
                                        </div>

                                        <div className="answer-item">
                                          <p className="answer-label">
                                            Đáp án đúng:
                                          </p>
                                          <div className="answer-value correct">
                                            {answer.correctAnswer ||
                                              evaluatedAnswer?.correctAnswer ||
                                              "(Đang tải...)"}
                                          </div>
                                        </div>
                                      </div>

                                      {(answer.explanation ||
                                        evaluatedAnswer?.explanation) && (
                                        <div className="answer-explanation">
                                          <p className="explanation-label">
                                            Giải thích:
                                          </p>
                                          <p className="explanation-text">
                                            {answer.explanation ||
                                              evaluatedAnswer?.explanation}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
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
                        Nhập điểm số cho bài test này:
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
                        <span className="score-max">/ 10 điểm</span>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (!selectedTest) return;
                        await calculateAutoScore(selectedTest);
                      }}
                      className="auto-score-button"
                    >
                      Tính điểm tự động
                    </button>
                  </div>
                </div>
              )}

              {calculatedScore !== null && (
                <div className="score-summary">
                  <div>
                    <p className="score-summary-label">Điểm đã tính tự động</p>
                    <p className="score-summary-value">
                      {calculatedScore} điểm
                    </p>
                    {selectedTest.answers && (
                      <p className="score-summary-percentage">
                        ({Math.round((calculatedScore / 10) * 100)}
                        %)
                      </p>
                    )}
                  </div>
                  <div className="score-actions">
                    <button
                      onClick={() => setScore(calculatedScore)}
                      className="apply-score-button"
                    >
                      Áp dụng điểm này
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
                      onClick={handleCancelReview}
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
        /* Debug Section */
        .debug-section {
          margin: 1rem 0;
          padding: 1rem;
          background: #f3f4f6;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }

        .debug-section summary {
          cursor: pointer;
          font-weight: 600;
          color: #374151;
          padding: 0.5rem;
        }

        .debug-content {
          margin-top: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 0.25rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .debug-row {
          margin-bottom: 1rem;
        }

        .debug-row strong {
          display: block;
          margin-bottom: 0.25rem;
          color: #6b7280;
        }

        .debug-row ul {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }

        .debug-row li {
          font-size: 0.875rem;
          color: #4b5563;
          margin-bottom: 0.25rem;
        }

        .debug-row pre {
          background: #f9fafb;
          padding: 0.75rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          overflow-x: auto;
          margin: 0.5rem 0;
        }

        /* Thêm style mới cho cấu trúc hiển thị câu hỏi */
        .answers-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .toggle-all-button {
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          color: #4b5563;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .toggle-all-button:hover {
          background: #e5e7eb;
        }
        
        .question-card {
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: all 0.2s;
        }
        
        .question-card:hover {
          border-color: #93c5fd;
        }
        
        .question-header {
          padding: 1rem;
          background: #f9fafb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .question-header:hover {
          background: #f3f4f6;
        }
        
        .question-header-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        
        .question-number {
          padding: 0.25rem 0.75rem;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 9999px;
        }
        
        .question-type {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
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
          font-weight: 500;
        }
        
        .question-status {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .question-status.correct {
          background: #dcfce7;
          color: #166534;
        }
        
        .question-status.partial {
          background: #fef3c7;
          color: #92400e;
        }
        
        .question-status.incorrect {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .question-status.unknown {
          background: #f3f4f6;
          color: #6b7280;
        }
        
        .expand-icon {
          color: #9ca3af;
        }
        
        .question-content {
          padding: 1rem;
          background: white;
          border-top: 1px solid #e5e7eb;
        }
        
        .question-text {
          margin-bottom: 1rem;
        }
        
        .text-label {
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }
        
        .text-content {
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          white-space: pre-wrap;
          font-size: 0.875rem;
          line-height: 1.5;
        }
        
        .answers-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .answer-detail {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1rem;
        }
        
        .sub-question-label {
          padding: 0.25rem 0.5rem;
          background: #f3f4f6;
          color: #6b7280;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          margin-bottom: 0.75rem;
          display: inline-block;
        }
        
        .answer-comparison {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        @media (max-width: 768px) {
          .answer-comparison {
            grid-template-columns: 1fr;
          }
        }
        
        .answer-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .answer-label {
          font-weight: 500;
          color: #374151;
          font-size: 0.875rem;
        }
        
        .answer-value {
          padding: 0.75rem;
          border-radius: 0.5rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.875rem;
          word-break: break-word;
        }
        
        .answer-value.correct {
          background: #dcfce7;
          border: 1px solid #86efac;
          color: #166534;
        }
        
        .answer-value.incorrect {
          background: #fee2e2;
          border: 1px solid #fca5a5;
          color: #dc2626;
        }
        
        .answer-value.unknown {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          color: #1f2937;
        }
        
        .answer-explanation {
          margin-top: 1rem;
          padding: 0.75rem;
          background: #f0f9ff;
          border: 1px solid #7dd3fc;
          border-radius: 0.5rem;
        }
        
        .explanation-label {
          font-weight: 500;
          color: #0369a1;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }
        
        .explanation-text {
          color: #0c4a6e;
          font-size: 0.875rem;
          line-height: 1.5;
        }
        
        .score-summary {
          padding: 1rem;
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-radius: 0.75rem;
          margin: 1rem 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .score-summary-label {
          font-weight: 600;
          color: #1e40af;
          font-size: 0.875rem;
        }
        
        .score-summary-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e40af;
          margin: 0.25rem 0;
        }
        
        .score-summary-percentage {
          font-size: 0.875rem;
          color: #3b82f6;
          margin: 0;
        }
        
        .score-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .apply-score-button {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .apply-score-button:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-1px);
        }

        /* Thêm CSS mới */
        .mapping-warning {
          padding: 0.75rem;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #fcd34d;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .mapping-info {
          padding: 0.75rem;
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          border: 1px solid #86efac;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .warning-text, .info-text {
          margin: 0;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .warning-text {
          color: #92400e;
        }
        
        .info-text {
          color: #166534;
        }
        
        .score-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border: 1px solid #93c5fd;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .score-summary-label {
          font-size: 0.875rem;
          color: #1e40af;
          margin: 0 0 0.25rem 0;
        }
        
        .score-summary-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e40af;
          margin: 0;
        }
        
        .score-summary-percentage {
          font-size: 0.875rem;
          color: #3b82f6;
          margin: 0.25rem 0 0 0;
        }
        
        .apply-score-button {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .apply-score-button:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-1px);
        }
        
        /* Các style khác giữ nguyên từ code trước */
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
          max-height: 70vh;
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
