// components/MiniTestModal.tsx
import { useState, useEffect } from "react";
import { X, Send, Clock, AlertCircle } from "lucide-react";
import api from "../api/auth";

interface Question {
  id: number;
  lesson_id: number;
  example: string;
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
  const [timeLeft, setTimeLeft] = useState(600);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const [authError, setAuthError] = useState<boolean>(false);

  console.log("🚀 [MiniTestModal] Component mounted with props:", {
    isOpen,
    lessonId,
    lessonTitle,
    userId,
    timestamp: new Date().toISOString(),
  });

  // 1. Kiểm tra user đã làm test này chưa - API ĐANG HOẠT ĐỘNG TỐT
  useEffect(() => {
    const checkExistingTest = async () => {
      if (!isOpen || !lessonId) {
        console.log("⏸️ [checkExistingTest] Modal not open or no lessonId");
        return;
      }

      console.log(
        "🔍 [checkExistingTest] Starting check for lesson:",
        lessonId,
      );
      console.log("🔍 [checkExistingTest] User ID from props:", userId);

      // Kiểm tra token trước
      const token = localStorage.getItem("accessToken");
      console.log(
        "🔍 [checkExistingTest] Token exists in localStorage:",
        !!token,
      );
      console.log(
        "🔍 [checkExistingTest] Token first 20 chars:",
        token?.substring(0, 20) + "...",
      );

      try {
        console.log(
          "📤 [checkExistingTest] Calling API: GET /api/grammar-tests/check?lesson_id=" +
            lessonId,
        );
        const startTime = Date.now();

        const response = await api.get(
          `/grammar-tests/check?lesson_id=${lessonId}`,
        );

        const endTime = Date.now();
        console.log(
          "✅ [checkExistingTest] API call completed in",
          endTime - startTime,
          "ms",
        );
        console.log(
          "📥 [checkExistingTest] API Response status:",
          response.status,
        );
        console.log(
          "📥 [checkExistingTest] API Response data:",
          JSON.stringify(response.data, null, 2),
        );

        if (response.data.success) {
          setAlreadySubmitted(response.data.hasSubmitted === true);
          console.log(
            `📝 [checkExistingTest] User ${
              response.data.hasSubmitted ? "ĐÃ" : "CHƯA"
            } nộp bài`,
          );
          setAuthError(false);
          setApiError("");
        } else {
          console.warn(
            "⚠️ [checkExistingTest] API returned success=false:",
            response.data,
          );
          setAlreadySubmitted(false);
        }
      } catch (error: any) {
        const errorTime = Date.now();
        console.error("❌ [checkExistingTest] ERROR DETAILS:", {
          timestamp: new Date().toISOString(),
          errorType: error.constructor.name,
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          },
        });

        // Log chi tiết cho từng loại lỗi
        if (error.response?.status === 401) {
          console.error(
            "🔒 [checkExistingTest] AUTHENTICATION ERROR 401 - Unauthorized",
          );
          console.error("🔒 [checkExistingTest] This usually means:");
          console.error("🔒 [checkExistingTest] 1. Token missing or malformed");
          console.error("🔒 [checkExistingTest] 2. Token expired");
          console.error("🔒 [checkExistingTest] 3. User not authenticated");

          setAuthError(true);
          setApiError("Phiên đăng nhập không hợp lệ hoặc đã hết hạn");

          // KHÔNG redirect ngay, đợi 10s
          setTimeout(() => {
            console.log(
              "⏰ [checkExistingTest] 10 seconds passed, user can manually login if needed",
            );
          }, 10000);
        } else if (error.response?.status === 403) {
          console.error(
            "🚫 [checkExistingTest] FORBIDDEN ERROR 403 - No permission",
          );
          setApiError("Bạn không có quyền truy cập tính năng này");
        } else if (error.response?.status === 404) {
          console.error(
            "🔍 [checkExistingTest] NOT FOUND ERROR 404 - Endpoint not found",
          );
          setApiError("API endpoint không tồn tại");
        } else if (error.response?.status === 500) {
          console.error(
            "💥 [checkExistingTest] SERVER ERROR 500 - Internal server error",
          );
          setApiError("Lỗi server, vui lòng thử lại sau");
        } else if (!error.response) {
          console.error(
            "🌐 [checkExistingTest] NETWORK ERROR - No response from server",
          );
          console.error("🌐 [checkExistingTest] Check:", {
            network: "Is server running?",
            cors: "CORS policy issues?",
            url: "Is URL correct?",
          });
          setApiError("Không thể kết nối đến server");
        } else {
          console.error("❓ [checkExistingTest] UNKNOWN ERROR:", error);
          setApiError("Lỗi không xác định: " + (error.message || "Unknown"));
        }

        setAlreadySubmitted(false);
      }
    };

    if (isOpen) {
      console.log("🎬 [checkExistingTest] Modal opened, starting check...");
      checkExistingTest();
    } else {
      console.log("⏸️ [checkExistingTest] Modal closed");
    }
  }, [isOpen, lessonId, userId]);

  // 2. Fetch questions - CẦN SỬA ĐỂ PARSE ĐÚNG FORMAT DATABASE
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!isOpen || !lessonId) {
        console.log("⏸️ [fetchQuestions] Modal not open or no lessonId");
        return;
      }

      console.log("🔍 [fetchQuestions] Starting fetch for lesson:", lessonId);
      console.log("🔍 [fetchQuestions] Auth error state:", authError);

      // Nếu đã có lỗi auth, không fetch questions
      if (authError) {
        console.log("⏸️ [fetchQuestions] Skipping fetch due to auth error");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setApiError("");

        console.log(
          "📤 [fetchQuestions] Calling API: GET /api/grammar/mini-test/questions?lesson_id=" +
            lessonId,
        );
        console.log(
          "📤 [fetchQuestions] Full URL:",
          api.defaults.baseURL +
            `/grammar/mini-test/questions?lesson_id=${lessonId}`,
        );

        const startTime = Date.now();
        const response = await api.get(
          `/grammar/mini-test/questions?lesson_id=${lessonId}`,
        );
        const endTime = Date.now();

        console.log(
          "✅ [fetchQuestions] API call completed in",
          endTime - startTime,
          "ms",
        );
        console.log(
          "📥 [fetchQuestions] API Response status:",
          response.status,
        );
        console.log(
          "📥 [fetchQuestions] API Response headers:",
          response.headers,
        );
        console.log(
          "📥 [fetchQuestions] API Response data type:",
          typeof response.data,
        );
        console.log(
          "📥 [fetchQuestions] API Response data keys:",
          Object.keys(response.data || {}),
        );
        console.log(
          "📥 [fetchQuestions] API Response data:",
          JSON.stringify(response.data, null, 2),
        );

        if (response.data.success && response.data.data) {
          const questionsData = response.data.data;
          console.log(
            `📊 [fetchQuestions] Got ${questionsData.length} questions from API`,
          );

          // Parse data từ database format
          const formattedQuestions: Question[] = questionsData.map(
            (item: any, index: number) => {
              console.log(
                `🔍 [fetchQuestions] Parsing item ${index + 1}:`,
                JSON.stringify(item, null, 2),
              );

              // Từ database bạn cung cấp, format là:
              // question_text có thể chứa nhiều dòng với số và text
              // options là string phân cách bởi dấu chấm phẩy: "は;は;は;は;の"

              let optionsArray: string[] = [];

              // Parse options từ string "は;は;は;は;の" thành array
              if (item.options && typeof item.options === "string") {
                // Tách bằng dấu chấm phẩy hoặc dấu phẩy
                optionsArray = item.options
                  .split(/[;，,]/)
                  .map((opt: string) => opt.trim())
                  .filter(Boolean);
                console.log(
                  `🔍 [fetchQuestions] Parsed options from "${item.options}":`,
                  optionsArray,
                );
              } else if (Array.isArray(item.options)) {
                optionsArray = item.options;
                console.log(
                  `🔍 [fetchQuestions] Options already array:`,
                  optionsArray,
                );
              }

              // Tách question_text để lấy câu hỏi chính
              let questionText = item.question_text || "";
              console.log(
                `🔍 [fetchQuestions] Original question text:`,
                questionText,
              );

              // Nếu có nhiều dòng, lấy dòng đầu tiên hoặc xử lý
              if (questionText.includes("\n")) {
                const lines = questionText
                  .split("\n")
                  .filter((line: string) => line.trim());
                console.log(
                  `🔍 [fetchQuestions] Split into ${lines.length} lines:`,
                  lines,
                );

                // Tìm dòng có số 1) hoặc bắt đầu bằng chữ
                const mainLine = lines.find(
                  (line: string) =>
                    line.includes("１）") ||
                    line.includes("1)") ||
                    !line.includes("例"),
                );
                if (mainLine) {
                  questionText = mainLine.replace(/^[０-９）)]+/, "").trim();
                  console.log(
                    `🔍 [fetchQuestions] Found main line:`,
                    questionText,
                  );
                } else {
                  questionText = lines[0] || "";
                  console.log(
                    `🔍 [fetchQuestions] Using first line:`,
                    questionText,
                  );
                }
              }

              const formattedQuestion = {
                id: item.id || index + 1,
                lesson_id: item.lesson_id || lessonId,
                example: item.example || "",
                question_type: (item.question_type || "fill_blank") as any,
                question_text: questionText || "Câu hỏi ngữ pháp",
                options: optionsArray.length > 0 ? optionsArray : undefined,
                correct_answer: item.correct_answer || "",
                points: item.points || 5,
              };

              console.log(
                `🔍 [fetchQuestions] Formatted question ${index + 1}:`,
                formattedQuestion,
              );
              return formattedQuestion;
            },
          );

          console.log(
            "✅ [fetchQuestions] All formatted questions:",
            formattedQuestions,
          );
          setQuestions(formattedQuestions);

          // Initialize answers
          const initialAnswers: Record<number, any> = {};
          formattedQuestions.forEach((q: Question) => {
            if (q.question_type === "multiple_choice" && q.options) {
              initialAnswers[q.id] = "";
              console.log(
                `📝 [fetchQuestions] Initialized MCQ answer for question ${q.id}: ""`,
              );
            } else if (q.question_type === "fill_blank") {
              initialAnswers[q.id] = "";
              console.log(
                `📝 [fetchQuestions] Initialized fill blank answer for question ${q.id}: ""`,
              );
            } else if (q.question_type === "reorder" && q.options) {
              // Trộn ngẫu nhiên options cho câu hỏi reorder
              const shuffled = [...q.options].sort(() => Math.random() - 0.5);
              initialAnswers[q.id] = shuffled;
              console.log(
                `📝 [fetchQuestions] Initialized reorder answer for question ${q.id}:`,
                shuffled,
              );
            }
          });

          setAnswers(initialAnswers);
          console.log(
            "✅ [fetchQuestions] All initial answers:",
            initialAnswers,
          );
        } else {
          // Nếu không có data, thử lấy từ endpoint test hoặc tạo test data
          console.warn(
            "⚠️ [fetchQuestions] No data from API or success=false",
            response.data,
          );
          console.log(
            "⚠️ [fetchQuestions] Response data structure:",
            response.data,
          );
          generateTestQuestions();
        }
      } catch (error: any) {
        console.error("❌ [fetchQuestions] ERROR DETAILS:", {
          timestamp: new Date().toISOString(),
          errorType: error.constructor.name,
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          responseData: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
          },
        });

        if (error.response?.status === 401) {
          console.error(
            "🔒 [fetchQuestions] AUTH ERROR 401 when fetching questions",
          );
          console.error(
            "🔒 [fetchQuestions] Token might be valid for check API but not for questions API",
          );
          setAuthError(true);
          setApiError(
            "Không có quyền truy cập câu hỏi. Token có thể không hợp lệ cho endpoint này.",
          );

          // Đợi 10s trước khi cho phép user action
          setTimeout(() => {
            console.log(
              "⏰ [fetchQuestions] 10 seconds passed after auth error",
            );
          }, 10000);
        } else {
          // Fallback: tạo câu hỏi test nếu API lỗi
          console.log("⚠️ [fetchQuestions] Using fallback test questions");
          generateTestQuestions();
          setApiError(
            "Đang sử dụng dữ liệu mẫu. API: " +
              (error.message || "Lỗi kết nối"),
          );
        }
      } finally {
        console.log(
          "🏁 [fetchQuestions] Finished fetch, setting loading to false",
        );
        setLoading(false);
      }
    };

    // Hàm tạo câu hỏi test từ database structure
    const generateTestQuestions = () => {
      console.log(
        "⚠️ [fetchQuestions] Generating test questions from DB structure",
      );

      const testQuestions: Question[] = [
        {
          id: 1,
          lesson_id: lessonId,
          example: "例 1: あの方（は）どなたですか。",
          question_type: "fill_blank",
          question_text:
            "A：サントスさんはブラジル人です。マリアさん（　　）ブラジル人ですか。",
          options: ["は", "が", "の", "を"],
          correct_answer: "は",
          points: 5,
        },
        {
          id: 2,
          lesson_id: lessonId,
          example: "例 2: あなたは会社員ですか。…はい、会社員です。",
          question_type: "fill_blank",
          question_text:
            "カリナさんは学生ですか。…はい、＿＿＿＿＿＿＿＿＿＿＿",
          correct_answer: "学生です。",
          points: 4,
        },
        {
          id: 3,
          lesson_id: lessonId,
          example: "例 3: ［この、これ］は本です。",
          question_type: "multiple_choice",
          question_text: "それは［だれ、何］のかばんですか。",
          options: [
            "だれのかばんですか。",
            "日本語のテープです。",
            "いいえ、わたしのじゃありません。",
            "はい、それは新聞です。",
          ],
          correct_answer: "だれのかばんですか。",
          points: 5,
        },
      ];

      console.log(
        "✅ [generateTestQuestions] Created test questions:",
        testQuestions,
      );
      setQuestions(testQuestions);

      // Initialize answers
      const initialAnswers: Record<number, any> = {};
      testQuestions.forEach((q: Question) => {
        if (q.question_type === "multiple_choice" && q.options) {
          initialAnswers[q.id] = "";
        } else if (q.question_type === "fill_blank") {
          initialAnswers[q.id] = "";
        }
      });

      setAnswers(initialAnswers);
      console.log(
        "✅ [generateTestQuestions] Initial answers:",
        initialAnswers,
      );
    };

    if (isOpen) {
      console.log("🎬 [fetchQuestions] Modal opened, starting fetch...");
      fetchQuestions();
    } else {
      console.log("⏸️ [fetchQuestions] Modal closed, skipping fetch");
    }
  }, [isOpen, lessonId, authError]);

  // 3. Timer
  useEffect(() => {
    console.log("⏰ [Timer] State:", { isOpen, timeLeft, testSubmitted });

    if (!isOpen || timeLeft <= 0 || testSubmitted) {
      console.log("⏸️ [Timer] Stopped - condition not met");
      return;
    }

    console.log("▶️ [Timer] Starting timer...");
    const timer = setTimeout(() => {
      console.log("⏰ [Timer] Tick:", timeLeft - 1, "seconds left");
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => {
      console.log("⏸️ [Timer] Cleanup");
      clearTimeout(timer);
    };
  }, [timeLeft, isOpen, testSubmitted]);

  const handleAnswerChange = (questionId: number, value: any) => {
    console.log(
      "✏️ [handleAnswerChange] Question:",
      questionId,
      "Value:",
      value,
    );
    setAnswers((prev) => {
      const newAnswers = {
        ...prev,
        [questionId]: value,
      };
      console.log("📝 [handleAnswerChange] New answers state:", newAnswers);
      return newAnswers;
    });
  };

  const handleReorderChange = (questionId: number, items: string[]) => {
    console.log(
      "🔄 [handleReorderChange] Question:",
      questionId,
      "Items:",
      items,
    );
    setAnswers((prev) => {
      const newAnswers = {
        ...prev,
        [questionId]: items,
      };
      console.log("📝 [handleReorderChange] New answers state:", newAnswers);
      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    console.log("🚀 [handleSubmit] Starting submit process...");
    console.log("📊 [handleSubmit] Current answers:", answers);
    console.log("📊 [handleSubmit] Questions count:", questions.length);
    console.log("⏰ [handleSubmit] Time left:", timeLeft);

    if (Object.keys(answers).length === 0) {
      console.warn("⚠️ [handleSubmit] No answers provided");
      alert("Vui lòng hoàn thành tất cả câu hỏi!");
      return;
    }

    // Kiểm tra xem đã trả lời đủ câu chưa
    const answeredCount = Object.values(answers).filter(
      (a) => a && (Array.isArray(a) ? a.length > 0 : a !== ""),
    ).length;

    console.log(
      "📊 [handleSubmit] Answered:",
      answeredCount,
      "/",
      questions.length,
    );

    if (answeredCount < questions.length) {
      console.log(
        "❓ [handleSubmit] Not all questions answered, asking for confirmation",
      );
      if (
        !confirm(
          `Bạn mới trả lời ${answeredCount}/${questions.length} câu. Bạn có chắc muốn nộp bài không?`,
        )
      ) {
        console.log("⏸️ [handleSubmit] User cancelled submit");
        return;
      }
    }

    try {
      setSubmitting(true);
      console.log("⏳ [handleSubmit] Submitting...");

      // Chuẩn bị data để gửi
      const testData = {
        lesson_id: lessonId,
        answers: answers,
        time_spent: 600 - timeLeft,
        submitted_at: new Date().toISOString(),
      };

      console.log(
        "📤 [handleSubmit] Sending data:",
        JSON.stringify(testData, null, 2),
      );
      console.log(
        "📤 [handleSubmit] Calling API: POST /api/grammar-tests/submit",
      );

      const startTime = Date.now();
      const response = await api.post("/grammar-tests/submit", testData);
      const endTime = Date.now();

      console.log(
        "✅ [handleSubmit] Submit completed in",
        endTime - startTime,
        "ms",
      );
      console.log("📥 [handleSubmit] Submit response status:", response.status);
      console.log(
        "📥 [handleSubmit] Submit response data:",
        JSON.stringify(response.data, null, 2),
      );

      if (response.data.success) {
        console.log("🎉 [handleSubmit] Submit successful!");
        setTestSubmitted(true);

        // Gửi thông báo (tùy chọn)
        try {
          console.log("📤 [handleSubmit] Sending notification...");
          await api.post("/notifications", {
            user_id: userId,
            type: "test_submitted",
            title: `Bài test mới - Bài ${lessonId}`,
            message: `User đã nộp bài test cho bài ${lessonTitle}`,
            related_id: response.data.testId || response.data.submissionId,
          });
          console.log("✅ [handleSubmit] Notification sent");
        } catch (notifError) {
          console.warn(
            "⚠️ [handleSubmit] Notification error (non-critical):",
            notifError,
          );
        }
      } else {
        console.error(
          "❌ [handleSubmit] API returned success=false:",
          response.data,
        );
        throw new Error(response.data.message || "Submit failed");
      }
    } catch (error: any) {
      console.error("❌ [handleSubmit] ERROR DETAILS:", {
        timestamp: new Date().toISOString(),
        errorType: error.constructor.name,
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
        },
      });

      let errorMessage = "Lỗi khi nộp bài: ";

      if (error.response?.status === 401) {
        errorMessage += "Phiên đăng nhập hết hạn. ";
        console.error("🔒 [handleSubmit] AUTH ERROR 401 on submit");
        setAuthError(true);

        // Đợi 10s cho user đọc log
        setTimeout(() => {
          console.log(
            "⏰ [handleSubmit] 10 seconds passed after submit auth error",
          );
        }, 10000);
      } else if (error.response?.status === 400) {
        errorMessage += "Dữ liệu không hợp lệ. ";
      } else if (error.response?.status === 500) {
        errorMessage += "Lỗi server. ";
      } else if (!error.response) {
        errorMessage += "Không kết nối được server. ";
      }

      errorMessage +=
        error.response?.data?.message || error.message || "Unknown error";
      alert(errorMessage);
    } finally {
      console.log("🏁 [handleSubmit] Submit process finished");
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

  // Thêm hàm xử lý login manual (không auto redirect)
  const handleManualLogin = () => {
    console.log("🔐 [handleManualLogin] User manually choosing to login");
    console.log("🔐 [handleManualLogin] Current localStorage:", {
      accessToken: !!localStorage.getItem("accessToken"),
      refreshToken: !!localStorage.getItem("refreshToken"),
      nekoUser: localStorage.getItem("nekoUser"),
    });

    // Clear current auth data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("nekoUser");

    console.log("🔐 [handleManualLogin] Cleared localStorage");

    // Redirect sau khi user confirm
    setTimeout(() => {
      console.log("🔐 [handleManualLogin] Redirecting to login page after 1s");
      window.location.href = "/login";
    }, 1000);
  };

  console.log("🎨 [Render] Rendering component with state:", {
    isOpen,
    loading,
    alreadySubmitted,
    testSubmitted,
    authError,
    apiError,
    questionsCount: questions.length,
    answersCount: Object.keys(answers).length,
    timeLeft,
  });

  if (!isOpen) {
    console.log("🚫 [Render] Modal not open, returning null");
    return null;
  }

  if (alreadySubmitted) {
    console.log("📄 [Render] Showing already submitted screen");
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

  if (testSubmitted) {
    console.log("🎉 [Render] Showing test submitted success screen");
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

  // Hiển thị auth error screen riêng
  if (authError) {
    console.log("🔒 [Render] Showing auth error screen");
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Lỗi xác thực</h2>
            <button onClick={onClose} className="close-btn">
              <X size={20} />
            </button>
          </div>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold mb-2 text-red-600">
              Phiên đăng nhập có vấn đề
            </h3>
            <p className="text-gray-600 mb-4">
              {apiError || "Token xác thực không hợp lệ hoặc đã hết hạn."}
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <p className="text-sm text-gray-700 mb-2">
                <strong>📋 Để debug:</strong>
              </p>
              <ol className="text-sm text-gray-600 list-decimal pl-5 space-y-1">
                <li>Mở Developer Console (F12)</li>
                <li>Xem tab Console để xem log chi tiết</li>
                <li>Xem tab Network để kiểm tra request/response</li>
                <li>Kiểm tra status code của API call</li>
                <li>Log sẽ tự động hiển thị trong 10s</li>
              </ol>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Đóng
              </button>
              <button
                onClick={handleManualLogin}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Đăng nhập lại
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              ⏰ Log sẽ được giữ lại ít nhất 10 giây để bạn có thể đọc
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log("🎨 [Render] Showing main test interface");
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
                  {questions.length} câu hỏi •{" "}
                  {timeLeft <= 60 ? "Sắp hết giờ!" : "Đang làm bài"}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="close-btn"
              aria-label="Đóng modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                Đang tải câu hỏi từ bài {lessonId}...
              </p>
              <p className="text-sm text-gray-400 mt-2">
                (Kiểm tra Console nếu load quá lâu)
              </p>
            </div>
          ) : apiError && !authError ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-yellow-600">
                Thông báo
              </h3>
              <p className="text-gray-600 mb-4">{apiError}</p>
              <p className="text-sm text-gray-500">
                Vẫn có thể làm bài với dữ liệu mẫu
              </p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Chưa có câu hỏi</h3>
              <p className="text-gray-600 mb-4">
                Bài {lessonId}: "{lessonTitle}" chưa có câu hỏi mini test.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Quay lại
              </button>
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

                  {question.example && (
                    <div className="example-container mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium mb-1">
                        Ví dụ:
                      </p>
                      <p className="text-blue-700">{question.example}</p>
                    </div>
                  )}

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

                  {question.question_type === "reorder" && question.options && (
                    <div className="reorder-container">
                      <p className="text-sm text-gray-600 mb-2">
                        Kéo thả để sắp xếp đúng thứ tự:
                      </p>
                      <div className="reorder-items">
                        {(() => {
                          // Xử lý an toàn: đảm bảo luôn có array hợp lệ
                          let currentItems: string[] = [];

                          if (
                            answers[question.id] &&
                            Array.isArray(answers[question.id])
                          ) {
                            currentItems = answers[question.id] as string[];
                          } else if (
                            question.options &&
                            Array.isArray(question.options)
                          ) {
                            currentItems = [...question.options];
                          }

                          // Nếu vẫn rỗng, tạo array rỗng
                          if (!currentItems || currentItems.length === 0) {
                            currentItems = [];
                          }

                          return currentItems.map(
                            (item: string, itemIndex: number) => (
                              <div
                                key={itemIndex}
                                className="reorder-item"
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData(
                                    "text/plain",
                                    itemIndex.toString(),
                                  );
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const draggedIndex = parseInt(
                                    e.dataTransfer.getData("text/plain"),
                                  );
                                  const newItems = [...currentItems];
                                  const temp = newItems[draggedIndex];
                                  newItems[draggedIndex] = newItems[itemIndex];
                                  newItems[itemIndex] = temp;
                                  handleReorderChange(question.id, newItems);
                                }}
                              >
                                {item}
                              </div>
                            ),
                          );
                        })()}
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
                    (a) => a && (Array.isArray(a) ? a.length > 0 : a !== ""),
                  ).length
                }
                /{questions.length} • Thời gian: {formatTime(timeLeft)}
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
                  {timeLeft <= 0 ? "Nộp bài (hết giờ)" : "Nộp bài"}
                </>
              )}
            </button>
          </div>
          {timeLeft <= 60 && timeLeft > 0 && (
            <div className="mt-2 text-center text-red-600 font-medium">
              ⏰ Còn {timeLeft} giây!
            </div>
          )}
          {timeLeft <= 0 && (
            <div className="mt-2 text-center text-red-600 font-medium">
              ⏰ Thời gian đã hết! Vui lòng nộp bài.
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

        .example-container {
          background: #eff6ff;
          border-left: 4px solid #3b82f6;
          border-radius: 0.5rem;
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
