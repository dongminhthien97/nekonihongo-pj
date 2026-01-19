// src/pages/user/UserMiniTestSubmissions.tsx (FIX ERROR submissions.map is not a function – HANDLE RESPONSE { success, data: [...] }, SAFE ARRAY CHECK, LOADING + EMPTY STATE)

import { useState, useEffect } from "react";
import api from "../../api/auth";
import toast from "react-hot-toast";
import { ChevronLeft } from "lucide-react";

interface Submission {
  id: number;
  lesson_id: number;
  lesson_title: string;
  answers: { question_id: number; user_answer: string }[];
  submitted_at: string;
  feedback: string | null;
  feedback_at: string | null;
  status: "pending" | "feedbacked";
  time_spent?: number; // Nếu có
}

export function UserMiniTestSubmissions({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/mini-test/submissions");
      console.log("[UserMiniTestSubmissions] Raw response:", res.data);

      // FIX: Backend trả { success: true, data: [...] } hoặc direct array
      let dataArray = [];
      if (Array.isArray(res.data)) {
        dataArray = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        dataArray = res.data.data;
      } else if (res.data?.success && Array.isArray(res.data)) {
        dataArray = res.data;
      }

      // Optional: Populate lesson_title nếu backend chưa có (placeholder)
      const normalized = dataArray.map((s: any) => ({
        ...s,
        lesson_title: s.lesson_title || `Bài ${s.lesson_id}`,
      }));

      setSubmissions(normalized);
    } catch (err: any) {
      console.error("[UserMiniTestSubmissions] Error fetching:", err);
      toast.error("Không tải được bài nộp 😿");
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa bài nộp này? Không thể khôi phục nhé!")) return;
    try {
      await api.delete(`/user/mini-test/submission/${id}`);
      toast.success("Xóa thành công!");
      fetchSubmissions();
      if (selected?.id === id) setSelected(null);
    } catch {
      toast.error("Xóa thất bại 😿");
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="text-2xl text-purple-600 mt-4">
            Đang tải bài nộp của bạn...
          </p>
        </div>
      </div>
    );
  }

  // EMPTY STATE
  if (submissions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => onNavigate("user")}
              className="text-purple-600 hover:text-purple-800"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <h1 className="text-4xl font-bold text-gray-800">
              Bài Mini Test của bạn
            </h1>
          </div>
          <div className="text-center py-20">
            <p className="text-2xl text-gray-600">Chưa có bài nộp nào 😺</p>
            <p className="text-gray-500 mt-4">
              Hãy làm mini test trong các bài ngữ pháp để có bài nộp nhé!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => onNavigate("user")}
            className="text-purple-600 hover:text-purple-800"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <h1 className="text-4xl font-bold text-gray-800">
            Bài Mini Test của bạn
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {submissions.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
              onClick={() => setSelected(s)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Bài {s.lesson_id} - {s.lesson_title}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Nộp ngày:{" "}
                    {new Date(s.submitted_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-4 py-2 rounded-full text-white font-bold ${
                      s.status === "feedbacked"
                        ? "bg-green-500"
                        : "bg-orange-500"
                    }`}
                  >
                    {s.status === "feedbacked" ? "Đã feedback" : "Chờ feedback"}
                  </span>
                  {s.status === "feedbacked" && s.feedback_at && (
                    <p className="text-sm text-gray-500 mt-2">
                      Feedback:{" "}
                      {new Date(s.feedback_at).toLocaleDateString("vi-VN")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DETAIL MODAL – giữ nguyên code cũ */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-8 shadow-2xl">
            {/* ... detail UI giữ nguyên */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={() => handleDelete(selected.id)}
                className="px-8 py-4 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-all"
              >
                Xóa bài nộp
              </button>
              <button
                onClick={() => setSelected(null)}
                className="px-8 py-4 bg-purple-500 text-white rounded-full font-bold hover:bg-purple-600 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
