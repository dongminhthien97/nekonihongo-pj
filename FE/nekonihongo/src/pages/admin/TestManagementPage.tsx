// pages/admin/TestManagementPage.tsx
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
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../../api/auth";
import { NekoLoading } from "../../components/NekoLoading";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

// Định nghĩa interface UserTest
interface UserTest {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  lesson_id: number;
  lesson_title: string;
  score: number | null;
  status: "pending" | "reviewed" | "returned";
  admin_feedback: string | null;
  completed_at: string;
  reviewed_at: string | null;
  test_data: {
    answers: Record<string, any>;
    time_spent?: number;
    submitted_at?: string;
  };
}

interface TestManagementPageProps {
  onNavigate: (
    page: string,
    params?: { category?: string; level?: string }
  ) => void;
}

export function TestManagementPage({ onNavigate }: TestManagementPageProps) {
  const { user } = useAuth(); // Lấy user từ context
  const [tests, setTests] = useState<UserTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<UserTest | null>(null);
  const [feedback, setFeedback] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("all");
  const [search, setSearch] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (!user) {
      // Không đăng nhập → về login
      onNavigate("login");
      return;
    }
    if (user.role !== "ADMIN") {
      // Đăng nhập nhưng không phải admin → về landing hoặc dashboard user
      toast.error("Bạn không có quyền truy cập trang quản trị 😿");
      onNavigate("landing"); // hoặc "mypage" nếu là user
      return;
    }
    // Nếu là admin → tiếp tục fetch data
    fetchTests();
    fetchUnreadCount();
  }, [user, onNavigate]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/admin/grammar-tests?filter=${filter}&search=${search}`
      );
      setTests(response.data.data || []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Session hết hạn → về login
        toast.error("Phiên đăng nhập hết hạn 😿");
        onNavigate("login");
      } else {
        toast.error("Không tải được danh sách bài test 😿");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/admin/notifications/unread-count");
      setUnreadCount(response.data.count || 0);
    } catch (error: any) {
      if (error.response?.status === 401) {
        onNavigate("login");
      }
    }
  };

  const handleReviewTest = (test: UserTest) => {
    setSelectedTest(test);
    setFeedback(test.admin_feedback || "");
    setShowDetail(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedTest || !feedback.trim()) return;

    try {
      await api.post(`/admin/grammar-tests/${selectedTest.id}/review`, {
        feedback: feedback,
        status: "reviewed",
      });

      // Gửi thông báo cho user
      await api.post("/notifications", {
        user_id: selectedTest.user_id,
        type: "test_reviewed",
        title: `Phản hồi bài test - Bài ${selectedTest.lesson_id}`,
        message: `Admin đã phản hồi bài test của bạn. Nhấn để xem chi tiết.`,
        related_id: selectedTest.id,
      });

      fetchTests();
      fetchUnreadCount();
      setShowDetail(false);
      setSelectedTest(null);
      setFeedback("");
      toast.success("Đã gửi phản hồi thành công! ✅");
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi gửi phản hồi 😿"
      );
    }
  };

  const handleDeleteTest = async (testId: number) => {
    if (!confirm("Bạn có chắc muốn xóa bài test này?")) return;

    try {
      await api.delete(`/admin/grammar-tests/${testId}`);
      fetchTests();
      toast.success("Đã xóa bài test thành công! ✅");
    } catch (error: any) {
      console.error("Error deleting test:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa bài test 😿"
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/admin/notifications/mark-all-read");
      setUnreadCount(0);
      toast.success("Đã đánh dấu tất cả là đã đọc! ✅");
    } catch (error: any) {
      console.error("Error marking as read:", error);
      toast.error("Có lỗi xảy ra khi đánh dấu đã đọc 😿");
    }
  };

  // Nếu không phải admin hoặc chưa load → không render gì (guard đã redirect)
  if (!user || user.role !== "ADMIN") {
    return null; // hoặc return <NekoLoading /> trong lúc redirect
  }

  if (loading) return <NekoLoading message="Đang tải bài test..." />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý Mini Test
              </h1>
              <p className="text-gray-600 mt-2">
                Xem và phản hồi bài test của học viên
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={markAllAsRead}
                  className="relative p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
                >
                  <Bell className="w-6 h-6 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Tất cả ({tests.length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                  filter === "pending"
                    ? "bg-orange-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Clock size={16} />
                Chờ duyệt ({tests.filter((t) => t.status === "pending").length})
              </button>
              <button
                onClick={() => setFilter("reviewed")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                  filter === "reviewed"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <CheckCircle size={16} />
                Đã duyệt ({tests.filter((t) => t.status === "reviewed").length})
              </button>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Tìm theo tên học viên hoặc bài học..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Test List */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Học viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bài học
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Điểm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {test.user_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {test.user_email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">Bài {test.lesson_id}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {test.lesson_title}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          test.score && test.score >= 5
                            ? "bg-green-100 text-green-800"
                            : test.score
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {test.score || "Chưa chấm"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit ${
                          test.status === "pending"
                            ? "bg-orange-100 text-orange-800"
                            : test.status === "reviewed"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {test.status === "pending" ? (
                          <>
                            <Clock size={12} />
                            Chờ duyệt
                          </>
                        ) : test.status === "reviewed" ? (
                          <>
                            <CheckCircle size={12} />
                            Đã duyệt
                          </>
                        ) : (
                          <>
                            <MessageSquare size={12} />
                            Đã trả
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(test.completed_at).toLocaleDateString("vi-VN")}
                      <br />
                      <span className="text-xs text-gray-400">
                        {new Date(test.completed_at).toLocaleTimeString(
                          "vi-VN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReviewTest(test)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Xem và phản hồi"
                        >
                          <MessageSquare size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteTest(test.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Xóa bài test"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {tests.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có bài test nào</p>
            <p className="text-sm text-gray-400 mt-2">
              Học viên chưa nộp bài test nào cho các bài học ngữ pháp
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">
                    Bài test của {selectedTest.user_name}
                  </h2>
                  <p className="text-gray-600">
                    Bài {selectedTest.lesson_id}: {selectedTest.lesson_title}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDetail(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    <EyeOff size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Thông tin chung */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Thông tin chung</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Học viên</p>
                    <p className="font-medium">
                      {selectedTest.user_name} ({selectedTest.user_email})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Thời gian nộp</p>
                    <p className="font-medium">
                      {new Date(selectedTest.completed_at).toLocaleString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Điểm số</p>
                    <p
                      className={`font-bold text-lg ${
                        selectedTest.score && selectedTest.score >= 5
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {selectedTest.score || "Chưa chấm"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedTest.status === "pending"
                          ? "bg-orange-100 text-orange-800"
                          : selectedTest.status === "reviewed"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {selectedTest.status === "pending"
                        ? "Chờ duyệt"
                        : selectedTest.status === "reviewed"
                        ? "Đã duyệt"
                        : "Đã trả"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hiển thị câu hỏi và câu trả lời */}
              <div className="space-y-6 mb-8">
                <h3 className="text-lg font-semibold">Chi tiết bài làm</h3>
                {selectedTest.test_data?.answers &&
                  Object.entries(selectedTest.test_data.answers).map(
                    ([questionId, answer]: [string, any]) => (
                      <div
                        key={questionId}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition"
                      >
                        <p className="font-medium mb-2">Câu hỏi {questionId}</p>
                        <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                          {typeof answer === "string"
                            ? answer
                            : JSON.stringify(answer, null, 2)}
                        </div>
                      </div>
                    )
                  )}
              </div>

              {/* Thời gian làm bài */}
              {selectedTest.test_data?.time_spent && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Thời gian làm bài</p>
                  <p className="font-medium">
                    {Math.floor(selectedTest.test_data.time_spent / 60)} phút{" "}
                    {selectedTest.test_data.time_spent % 60} giây
                  </p>
                </div>
              )}

              {/* Feedback Area */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">
                  Phản hồi của Admin
                </h3>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Nhập phản hồi chi tiết cho học viên (đúng/sai, gợi ý cải thiện, lời khen...)"
                  className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setShowDetail(false)}
                    className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={!feedback.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                  >
                    <Send size={16} />
                    Gửi phản hồi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
