// pages/user/MyTestsPage.tsx
import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  MessageSquare,
  Trash2,
  Eye,
  Download,
  Bell,
} from "lucide-react";
import api from "../../api/auth";
import { NekoLoading } from "../../components/NekoLoading";

interface UserTest {
  id: number;
  lesson_id: number;
  lesson_title: string;
  score: number;
  status: "pending" | "reviewed" | "returned";
  admin_feedback: string;
  completed_at: string;
  reviewed_at: string | null;
  test_data: any;
}
interface MyTestsPageProps {
  onNavigate: (
    page: string,
    params?: { category?: string; level?: string }
  ) => void;
}
export function MyTestsPage({ onNavigate }: MyTestsPageProps) {
  const [tests, setTests] = useState<UserTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<UserTest | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("all");
  const [search, setSearch] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchTests();
    fetchUnreadCount();
  }, [filter, search]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/user/grammar-tests?filter=${filter}&search=${search}`
      );
      setTests(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/user/notifications/unread-count");
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleViewDetail = (test: UserTest) => {
    setSelectedTest(test);
    setShowDetail(true);
  };

  const handleDeleteTest = async (testId: number) => {
    if (!confirm("Bạn có chắc muốn xóa bài test này?")) return;

    try {
      await api.delete(`/user/grammar-tests/${testId}`);
      fetchTests();
    } catch (error) {
      console.error("Error deleting test:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/user/notifications/mark-all-read");
      fetchUnreadCount();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const downloadTest = (test: UserTest) => {
    const content = `
Bài test: ${test.lesson_title}
Thời gian: ${new Date(test.completed_at).toLocaleString("vi-VN")}
Điểm: ${test.score || "Chưa chấm"}
Trạng thái: ${
      test.status === "pending"
        ? "Chờ duyệt"
        : test.status === "reviewed"
        ? "Đã duyệt"
        : "Đã trả"
    }
Phản hồi của Admin: ${test.admin_feedback || "Chưa có phản hồi"}

Chi tiết bài làm:
${JSON.stringify(test.test_data, null, 2)}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-bai-${test.lesson_id}-${
      new Date(test.completed_at).toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) return <NekoLoading message="Đang tải bài test của bạn..." />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bài test của tôi
              </h1>
              <p className="text-gray-600 mt-2">
                Xem lịch sử và kết quả bài test
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={markAllAsRead}
                  className="relative p-2 bg-white rounded-full shadow"
                >
                  <Bell className="w-6 h-6 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
                className={`px-4 py-2 rounded-lg ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                Tất cả ({tests.length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  filter === "pending"
                    ? "bg-orange-600 text-white"
                    : "bg-white text-gray-700"
                }`}
              >
                <Clock size={16} />
                Chờ duyệt ({tests.filter((t) => t.status === "pending").length})
              </button>
              <button
                onClick={() => setFilter("reviewed")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  filter === "reviewed"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700"
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
                  placeholder="Tìm theo tên bài học..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Test List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Bài {test.lesson_id}
                    </h3>
                    <p className="text-gray-600 mt-1 truncate">
                      {test.lesson_title}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      test.status === "pending"
                        ? "bg-orange-100 text-orange-800"
                        : test.status === "reviewed"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {test.status === "pending"
                      ? "Chờ duyệt"
                      : test.status === "reviewed"
                      ? "Đã duyệt"
                      : "Đã trả"}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Điểm số:</span>
                    <span
                      className={`font-bold ${
                        test.score >= 5 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {test.score || "Chưa chấm"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Thời gian:</span>
                    <span className="font-medium">
                      {new Date(test.completed_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  {test.reviewed_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phản hồi:</span>
                      <span className="font-medium">
                        {new Date(test.reviewed_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetail(test)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <Eye size={18} />
                    Xem chi tiết
                  </button>
                  <button
                    onClick={() => downloadTest(test)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Tải xuống"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteTest(test.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tests.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Bạn chưa làm bài test nào</p>
            <p className="text-sm text-gray-400 mt-2">
              Hãy vào bài học và làm mini test để cải thiện trình độ!
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
                    Bài test - Bài {selectedTest.lesson_id}
                  </h2>
                  <p className="text-gray-600">{selectedTest.lesson_title}</p>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Test Info */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <p className="text-lg font-semibold mt-1">
                    {selectedTest.status === "pending"
                      ? "🕒 Chờ duyệt"
                      : selectedTest.status === "reviewed"
                      ? "✅ Đã duyệt"
                      : "↩️ Đã trả"}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Điểm số</p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      selectedTest.score >= 5
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedTest.score || "Chưa chấm"}
                  </p>
                </div>
              </div>

              {/* Admin Feedback */}
              {selectedTest.admin_feedback && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare size={20} />
                    Phản hồi từ Admin
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {selectedTest.admin_feedback}
                    </p>
                    {selectedTest.reviewed_at && (
                      <p className="text-sm text-gray-500 mt-2">
                        Phản hồi lúc:{" "}
                        {new Date(selectedTest.reviewed_at).toLocaleString(
                          "vi-VN"
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Test Details */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Chi tiết bài làm</h3>
                <div className="space-y-4">
                  {selectedTest.test_data?.answers &&
                    Object.entries(selectedTest.test_data.answers).map(
                      ([questionId, answer]: [string, any]) => (
                        <div key={questionId} className="border rounded-lg p-4">
                          <p className="font-medium mb-2">
                            Câu hỏi {questionId}
                          </p>
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-gray-700 font-mono">
                              {typeof answer === "string"
                                ? answer
                                : JSON.stringify(answer)}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="text-sm text-gray-500 border-t pt-4">
                <p>
                  Thời gian nộp:{" "}
                  {new Date(selectedTest.completed_at).toLocaleString("vi-VN")}
                </p>
                {selectedTest.test_data?.time_spent && (
                  <p className="mt-1">
                    Thời gian làm bài:{" "}
                    {Math.floor(selectedTest.test_data.time_spent / 60)} phút{" "}
                    {selectedTest.test_data.time_spent % 60} giây
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                onClick={() => downloadTest(selectedTest)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 flex items-center gap-2"
              >
                <Download size={16} />
                Tải xuống
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
