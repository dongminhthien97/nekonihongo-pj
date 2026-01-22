// UserMiniTestSubmissions.tsx - FIXED VERSION (Disable lesson details fetch)
import { useState, useEffect } from "react";
import api from "../../api/auth";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  Eye,
  Trash2,
  FileText,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
} from "lucide-react";

interface Submission {
  id: number;
  lesson_id: number;
  lesson_title: string;
  answers: { question_id: number; user_answer: string }[];
  submitted_at: string;
  feedback: string | null;
  feedback_at: string | null;
  status: "pending" | "feedbacked" | "reviewed";
  score?: number;
  total_questions?: number;
  time_spent?: number;
}

export function UserMiniTestSubmissions({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setDebugInfo("Đang tải dữ liệu...");

      console.log("🔄 [DEBUG] Bắt đầu fetch submissions");
      const res = await api.get("/user/mini-test/submissions");

      console.log("✅ [DEBUG] API Response status:", res.status);
      console.log(
        "📦 [DEBUG] Full response data:",
        JSON.stringify(res.data, null, 2),
      );

      // Xử lý response
      let rawData: any[] = [];

      if (Array.isArray(res.data)) {
        rawData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        rawData = res.data.data;
      } else if (res.data?.success && Array.isArray(res.data.data)) {
        rawData = res.data.data;
      } else if (res.data && typeof res.data === "object") {
        // Thử tìm array trong object
        const keys = Object.keys(res.data);
        const arrayKey = keys.find((key) => Array.isArray(res.data[key]));
        if (arrayKey) {
          rawData = res.data[arrayKey];
        } else {
          rawData = [res.data];
        }
      }

      console.log("📊 [DEBUG] Raw data items:", rawData.length);
      console.log(
        "📊 [DEBUG] First raw item:",
        rawData[0] ? JSON.stringify(rawData[0], null, 2) : "No data",
      );

      // Đặc biệt kiểm tra answers field
      if (rawData.length > 0 && rawData[0].answers) {
        console.log(
          "🔍 [DEBUG] Answers field type:",
          typeof rawData[0].answers,
        );
        console.log("🔍 [DEBUG] Answers field value:", rawData[0].answers);

        // Kiểm tra xem có phải là string JSON không
        if (typeof rawData[0].answers === "string") {
          console.log("🔍 [DEBUG] Answers is a string, trying to parse...");
          try {
            const parsed = JSON.parse(rawData[0].answers);
            console.log("🔍 [DEBUG] Parsed answers:", parsed);
            console.log("🔍 [DEBUG] Parsed type:", typeof parsed);
            console.log("🔍 [DEBUG] Is array?", Array.isArray(parsed));
          } catch (e) {
            console.error("🔍 [DEBUG] Failed to parse answers string:", e);
          }
        }
      }

      // Normalize dữ liệu với xử lý đặc biệt cho answers
      const normalized = rawData
        .map((s: any, index: number) => {
          console.log(`📝 [DEBUG] Processing submission ${s.id || index}:`, {
            id: s.id,
            lessonId: s.lesson_id || s.lessonId,
            answers: s.answers,
            answersType: typeof s.answers,
            answersLength: Array.isArray(s.answers) ? s.answers.length : "N/A",
          });

          // Xử lý answers - QUAN TRỌNG: Backend có thể trả về string JSON
          let answers: { question_id: number; user_answer: string }[] = [];

          if (s.answers) {
            // Case 1: Nếu answers là array
            if (Array.isArray(s.answers)) {
              answers = s.answers
                .filter((ans: any) => ans != null)
                .map((ans: any) => ({
                  question_id: Number(ans.question_id || ans.questionId || 0),
                  user_answer: String(
                    ans.user_answer ||
                      ans.userAnswer ||
                      ans.answer ||
                      ans ||
                      "",
                  ),
                }))
                .filter((ans: { question_id: number }) => ans.question_id > 0);
            }
            // Case 2: Nếu answers là string JSON
            else if (typeof s.answers === "string") {
              console.log(
                `🔄 [DEBUG] Submission ${s.id}: Parsing answers as JSON string`,
              );
              console.log(
                `🔄 [DEBUG] Answers string:`,
                s.answers.substring(0, 200) +
                  (s.answers.length > 200 ? "..." : ""),
              );

              try {
                const parsed = JSON.parse(s.answers);

                // Nếu parsed là array
                if (Array.isArray(parsed)) {
                  answers = parsed
                    .filter((ans: any) => ans != null)
                    .map((ans: any) => ({
                      question_id: Number(
                        ans.question_id || ans.questionId || 0,
                      ),
                      user_answer: String(
                        ans.user_answer || ans.userAnswer || ans.answer || "",
                      ),
                    }))
                    .filter((ans) => ans.question_id > 0);
                }
                // Nếu parsed là object (key-value format)
                else if (typeof parsed === "object" && parsed !== null) {
                  console.log(
                    `🔄 [DEBUG] Submission ${s.id}: Parsed as object, converting to array`,
                  );
                  answers = Object.entries(parsed)
                    .map(([key, value]: [string, any]) => {
                      let questionId = 0;
                      let userAnswer = "";

                      if (value && typeof value === "object") {
                        // Format: {"1": {"question_id": 1, "user_answer": "A"}}
                        questionId = Number(
                          value.question_id ||
                            value.questionId ||
                            key.replace("question_", "").replace("q", ""),
                        );
                        userAnswer = String(
                          value.user_answer ||
                            value.userAnswer ||
                            value.answer ||
                            "",
                        );
                      } else {
                        // Format: {"1": "A"} hoặc {"question_1": "A"}
                        questionId = Number(
                          key.replace("question_", "").replace("q", ""),
                        );
                        userAnswer = String(value || "");
                      }

                      return {
                        question_id: questionId || 0,
                        user_answer: userAnswer,
                      };
                    })
                    .filter((ans) => ans.question_id > 0);
                }
              } catch (parseError) {
                console.error(
                  `❌ [DEBUG] Error parsing JSON string for submission ${s.id}:`,
                  parseError,
                );
                console.error(`❌ [DEBUG] Problematic JSON string:`, s.answers);
              }
            }
            // Case 3: Nếu answers là object trực tiếp
            else if (typeof s.answers === "object" && s.answers !== null) {
              console.log(
                `🔄 [DEBUG] Submission ${s.id}: Answers is object, converting to array`,
              );
              answers = Object.entries(s.answers)
                .map(([key, value]: [string, any]) => {
                  let questionId = 0;
                  let userAnswer = "";

                  if (value && typeof value === "object") {
                    questionId = Number(
                      value.question_id ||
                        value.questionId ||
                        key.replace("question_", "").replace("q", ""),
                    );
                    userAnswer = String(
                      value.user_answer ||
                        value.userAnswer ||
                        value.answer ||
                        "",
                    );
                  } else {
                    questionId = Number(
                      key.replace("question_", "").replace("q", ""),
                    );
                    userAnswer = String(value || "");
                  }

                  return {
                    question_id: questionId || 0,
                    user_answer: userAnswer,
                  };
                })
                .filter((ans) => ans.question_id > 0);
            }
          }

          console.log(
            `📊 [DEBUG] Submission ${s.id}: Parsed ${answers.length} answers`,
          );
          if (answers.length > 0) {
            console.log(`📊 [DEBUG] Sample answer:`, answers[0]);
          }

          // Xác định lesson_title - Sử dụng fallback nếu không có
          let lessonTitle =
            s.lesson_title ||
            s.lesson?.title ||
            s.lesson?.name ||
            `Bài ${s.lesson_id || s.lessonId || "N/A"}`;

          const submission: Submission = {
            id: s.id || s.submission_id || index + 1,
            lesson_id: s.lesson_id || s.lessonId || s.lesson?.id || 0,
            lesson_title: lessonTitle,
            answers: answers.sort((a, b) => a.question_id - b.question_id),
            submitted_at:
              s.submitted_at ||
              s.submittedAt ||
              s.created_at ||
              s.createdAt ||
              new Date().toISOString(),
            feedback: s.feedback || s.admin_feedback || null,
            feedback_at:
              s.feedback_at || s.feedbackAt || s.feedbackDate || null,
            status: (s.status || "pending") as
              | "pending"
              | "feedbacked"
              | "reviewed",
            score: s.score || s.total_score || undefined,
            total_questions:
              s.total_questions || s.question_count || answers.length || 0,
            time_spent: s.time_spent || s.timeSpent || undefined,
          };

          console.log(`✅ [DEBUG] Final submission ${submission.id}:`, {
            id: submission.id,
            lesson_id: submission.lesson_id,
            lesson_title: submission.lesson_title,
            answers_count: submission.answers.length,
            status: submission.status,
            has_feedback: !!submission.feedback,
          });

          return submission;
        })
        .filter((s) => s.lesson_id > 0 && s.id > 0);

      console.log(
        "🎉 [DEBUG] Total submissions after normalization:",
        normalized.length,
      );

      if (normalized.length > 0) {
        console.log("🎉 [DEBUG] First normalized submission details:");
        const firstSub = normalized[0];
        console.log("  ID:", firstSub.id);
        console.log("  Lesson ID:", firstSub.lesson_id);
        console.log("  Lesson Title:", firstSub.lesson_title);
        console.log("  Answers count:", firstSub.answers.length);
        console.log("  Status:", firstSub.status);
        console.log("  First 3 answers:", firstSub.answers.slice(0, 3));
      }

      setDebugInfo(`Đã tải ${normalized.length} bài nộp`);
      setSubmissions(normalized);
    } catch (err: any) {
      console.error("❌ [DEBUG] Error fetching submissions:", err);

      if (err.response) {
        console.error("❌ [DEBUG] Response error:", {
          status: err.response.status,
          data: err.response.data,
        });
        setDebugInfo(`Lỗi ${err.response.status}`);

        // Hiển thị thông báo lỗi cụ thể
        if (err.response.status === 404) {
          toast.error("Không tìm thấy endpoint!");
        } else if (err.response.status === 500) {
          toast.error("Lỗi server. Vui lòng thử lại sau!");
        }
      } else if (err.request) {
        console.error("❌ [DEBUG] No response:", err.request);
        setDebugInfo("Không nhận được phản hồi");
        toast.error("Không thể kết nối đến server!");
      } else {
        console.error("❌ [DEBUG] Setup error:", err.message);
        setDebugInfo(`Lỗi: ${err.message}`);
        toast.error("Lỗi kết nối!");
      }

      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.lesson_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.lesson_id.toString().includes(searchTerm);

    const matchesFilter = filterStatus === "all" || sub.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa bài nộp này?")) return;

    try {
      console.log("🗑️ [DEBUG] Deleting submission:", id);
      await api.delete(`/user/mini-test/submission/${id}`);
      toast.success("Đã xóa bài nộp!");
      fetchSubmissions();
      if (selected?.id === id) setSelected(null);
    } catch (error) {
      console.error("❌ [DEBUG] Delete error:", error);
      toast.error("Xóa thất bại!");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "feedbacked":
      case "reviewed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "feedbacked":
      case "reviewed":
        return "Đã chấm";
      case "pending":
        return "Chờ chấm";
      default:
        return "Không xác định";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  // Hàm để test backend response
  const testBackendResponse = async () => {
    console.log("🧪 [TEST] Testing backend response format...");
    try {
      const testRes = await api.get("/user/mini-test/submissions");
      console.log("🧪 [TEST] Response structure:", Object.keys(testRes.data));
      console.log(
        "🧪 [TEST] Full response:",
        JSON.stringify(testRes.data, null, 2),
      );

      if (testRes.data?.data?.[0]?.answers) {
        const answers = testRes.data.data[0].answers;
        console.log("🧪 [TEST] Answers type:", typeof answers);
        console.log("🧪 [TEST] Answers value:", answers);

        if (typeof answers === "string") {
          console.log("🧪 [TEST] Answers is string, trying to parse...");
          try {
            const parsed = JSON.parse(answers);
            console.log("🧪 [TEST] Parsed successfully:", parsed);
            console.log("🧪 [TEST] Parsed type:", typeof parsed);
            console.log("🧪 [TEST] Is array?", Array.isArray(parsed));
          } catch (e) {
            console.error("🧪 [TEST] Parse failed:", e);
          }
        }
      }
    } catch (error) {
      console.error("🧪 [TEST] Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-xl text-purple-600 mt-4">Đang tải bài nộp...</p>
          {debugInfo && (
            <p className="text-sm text-gray-500 mt-2">{debugInfo}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => onNavigate("user")}
              className="p-2 bg-white rounded-full shadow hover:shadow-md transition"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">
                Bài Mini Test của tôi
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý và xem kết quả các bài test đã làm
              </p>
              <div className="mt-2 flex items-center gap-3">
                {debugInfo && (
                  <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded">
                    {debugInfo}
                  </div>
                )}
                <button
                  onClick={testBackendResponse}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  [Test Backend]
                </button>
                <button
                  onClick={() =>
                    console.log("📊 [DEBUG] Current submissions:", submissions)
                  }
                  className="text-xs text-purple-500 hover:text-purple-700"
                >
                  [Xem Data]
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-purple-100 text-purple-600" : "bg-white text-gray-600"}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${viewMode === "list" ? "bg-purple-100 text-purple-600" : "bg-white text-gray-600"}`}
              >
                List
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white rounded-xl p-4 shadow mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm bài học..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-lg bg-white"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ chấm</option>
                  <option value="feedbacked">Đã chấm</option>
                  <option value="reviewed">Đã xem xét</option>
                </select>
                <button
                  onClick={fetchSubmissions}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Làm mới
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-3xl font-bold text-purple-600">
              {submissions.length}
            </div>
            <div className="text-gray-600">Tổng bài nộp</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-3xl font-bold text-green-600">
              {
                submissions.filter(
                  (s) => s.status === "feedbacked" || s.status === "reviewed",
                ).length
              }
            </div>
            <div className="text-gray-600">Đã chấm</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-3xl font-bold text-orange-600">
              {submissions.filter((s) => s.status === "pending").length}
            </div>
            <div className="text-gray-600">Chờ chấm</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-3xl font-bold text-blue-600">
              {submissions.filter((s) => s.score).length > 0
                ? (
                    submissions.reduce((acc, s) => acc + (s.score || 0), 0) /
                    submissions.filter((s) => s.score).length
                  ).toFixed(1)
                : "0"}
            </div>
            <div className="text-gray-600">Điểm trung bình</div>
          </div>
        </div>

        {/* Submissions List/Grid */}
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">Không tìm thấy bài nộp nào</p>
            <p className="text-gray-500 mt-2">
              {searchTerm
                ? "Thử tìm kiếm với từ khóa khác"
                : submissions.length === 0
                  ? "Bạn chưa có bài nộp nào. Hãy làm bài test để bắt đầu!"
                  : "Không có bài nộp nào phù hợp với bộ lọc"}
            </p>
            <button
              onClick={fetchSubmissions}
              className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Thử tải lại
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                        Bài {sub.lesson_id}
                      </span>
                      <h3 className="text-xl font-bold text-gray-800 mt-2">
                        {sub.lesson_title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(sub.status)}
                      <span className="text-sm font-medium">
                        {getStatusText(sub.status)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ngày nộp:</span>
                      <span className="font-medium">
                        {formatDate(sub.submitted_at)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Số câu:</span>
                      <span className="font-medium">{sub.total_questions}</span>
                    </div>
                    {sub.time_spent && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Thời gian:</span>
                        <span className="font-medium">
                          {Math.floor(sub.time_spent / 60)}:
                          {String(sub.time_spent % 60).padStart(2, "0")}
                        </span>
                      </div>
                    )}
                    {sub.score !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Điểm:</span>
                        <span
                          className={`font-bold ${sub.score >= 5 ? "text-green-600" : "text-red-600"}`}
                        >
                          {sub.score}/{sub.total_questions}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelected(sub)}
                      className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Xem chi tiết ({sub.answers.length} câu)
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Xóa bài nộp"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Bài học</th>
                  <th className="px-6 py-3 text-left">Trạng thái</th>
                  <th className="px-6 py-3 text-left">Điểm</th>
                  <th className="px-6 py-3 text-left">Ngày nộp</th>
                  <th className="px-6 py-3 text-left">Số câu</th>
                  <th className="px-6 py-3 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">Bài {sub.lesson_id}</div>
                        <div className="text-sm text-gray-600">
                          {sub.lesson_title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(sub.status)}
                        {getStatusText(sub.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {sub.score !== undefined ? (
                        <span
                          className={`font-bold ${sub.score >= 5 ? "text-green-600" : "text-red-600"}`}
                        >
                          {sub.score}/{sub.total_questions}
                        </span>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {formatDate(sub.submitted_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{sub.answers.length}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelected(sub)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          Xem
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">
                    Bài {selected.lesson_id}: {selected.lesson_title}
                  </h2>
                  <div className="text-gray-600 space-y-1 mt-2">
                    <p>Nộp ngày: {formatDate(selected.submitted_at)}</p>
                    {selected.time_spent && (
                      <p>
                        Thời gian làm bài:{" "}
                        {Math.floor(selected.time_spent / 60)} phút{" "}
                        {selected.time_spent % 60} giây
                      </p>
                    )}
                    <p>Trạng thái: {getStatusText(selected.status)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Answers */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Câu trả lời của bạn</h3>
                  <span className="text-sm text-gray-500">
                    {selected.answers.length} câu hỏi
                  </span>
                </div>
                {selected.answers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>Không có câu trả lời nào được ghi nhận</p>
                    <p className="text-sm mt-1">Có thể do:</p>
                    <ul className="text-xs text-gray-400 mt-1 text-left max-w-md mx-auto">
                      <li>• Backend chưa xử lý đúng dữ liệu answers</li>
                      <li>• Dữ liệu answers trong database bị lỗi</li>
                      <li>• Frontend không parse được format của answers</li>
                    </ul>
                    <button
                      onClick={() =>
                        console.log(
                          "🔍 [DEBUG] Selected submission raw:",
                          selected,
                        )
                      }
                      className="mt-3 text-sm text-blue-500 hover:text-blue-700"
                    >
                      [Xem debug data]
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selected.answers.map((answer, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-purple-600">
                              Câu {answer.question_id}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              #{index + 1}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            ID: {answer.question_id}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                          {answer.user_answer || "(Không có câu trả lời)"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Feedback */}
              {selected.feedback && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">
                    Phản hồi từ giáo viên
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-blue-500 mt-1" />
                      <div className="flex-1">
                        {selected.feedback_at && (
                          <p className="text-sm text-blue-700 mb-2">
                            Ngày feedback: {formatDate(selected.feedback_at)}
                          </p>
                        )}
                        <div className="text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border">
                          {selected.feedback}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between pt-6 border-t">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (confirm("Bạn có chắc muốn xóa bài nộp này?")) {
                        handleDelete(selected.id);
                      }
                    }}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa bài nộp
                  </button>
                  <button
                    onClick={() =>
                      console.log("🔍 [DEBUG] Full submission data:", selected)
                    }
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm border"
                  >
                    Debug Data
                  </button>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
