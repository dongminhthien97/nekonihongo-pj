// UserMiniTestSubmissions.tsx - Phiên bản cải tiến
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

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/mini-test/submissions");

      // Xử lý response
      const data = res.data?.data || res.data || [];
      const normalized = data.map((s: any) => ({
        id: s.id,
        lesson_id: s.lesson_id,
        lesson_title: s.lesson_title || `Bài ${s.lesson_id}`,
        answers: Array.isArray(s.answers)
          ? s.answers
          : Object.values(s.answers || {}),
        submitted_at: s.submitted_at || s.created_at,
        feedback: s.feedback,
        feedback_at: s.feedback_at,
        status: s.status || "pending",
        score: s.score,
        total_questions: s.total_questions || s.answers?.length || 0,
      }));

      setSubmissions(normalized);
    } catch (err: any) {
      console.error("Error fetching submissions:", err);
      toast.error("Không tải được bài nộp");
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
      await api.delete(`/user/mini-test/submission/${id}`);
      toast.success("Đã xóa bài nộp!");
      fetchSubmissions();
      if (selected?.id === id) setSelected(null);
    } catch {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-xl text-purple-600 mt-4">Đang tải bài nộp...</p>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Bài Mini Test của tôi
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý và xem kết quả các bài test đã làm
              </p>
            </div>
            <div className="ml-auto flex gap-2">
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
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
              {submissions.reduce((acc, s) => acc + (s.score || 0), 0) /
                (submissions.filter((s) => s.score).length || 1)}
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
                : "Hãy làm bài test để có bài nộp nhé!"}
            </p>
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
                        {new Date(sub.submitted_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Số câu:</span>
                      <span className="font-medium">{sub.total_questions}</span>
                    </div>
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
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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
                      {new Date(sub.submitted_at).toLocaleDateString("vi-VN")}
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
                  <p className="text-gray-600">
                    Nộp ngày:{" "}
                    {new Date(selected.submitted_at).toLocaleString("vi-VN")}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Answers */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Câu trả lời của bạn</h3>
                <div className="space-y-4">
                  {selected.answers.map((answer, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="font-medium mb-2">
                        Câu {answer.question_id}
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        {answer.user_answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              {selected.feedback && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">
                    Phản hồi từ giáo viên
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-blue-500">💬</div>
                      <div>
                        <p className="font-medium mb-2">
                          Ngày feedback:{" "}
                          {selected.feedback_at
                            ? new Date(selected.feedback_at).toLocaleDateString(
                                "vi-VN",
                              )
                            : "N/A"}
                        </p>
                        <p className="text-gray-700">{selected.feedback}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between">
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Xóa bài nộp
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
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
