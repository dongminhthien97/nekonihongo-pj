// src/pages/user/UserMiniTestSubmissions.tsx (trang lưu trữ mini test của user)
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
      setSubmissions(res.data || []);
    } catch {
      toast.error("Không tải được bài nộp 😿");
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

  if (loading)
    return <div className="p-8 text-center">Đang tải bài nộp...</div>;

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

        {submissions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-600">Chưa có bài nộp nào 😺</p>
            <p className="text-gray-500 mt-4">
              Hãy làm mini test trong các bài ngữ pháp để có bài nộp nhé!
            </p>
          </div>
        ) : (
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
                      {s.status === "feedbacked"
                        ? "Đã feedback"
                        : "Chờ feedback"}
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
        )}
      </div>

      {/* DETAIL MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Chi tiết bài nộp - Bài {selected.lesson_id}
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-3xl"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <p className="text-lg text-gray-600">
                Nộp ngày:{" "}
                {new Date(selected.submitted_at).toLocaleString("vi-VN")}
              </p>
              {selected.feedback_at && (
                <p className="text-lg text-green-600 font-bold mt-2">
                  Feedback ngày:{" "}
                  {new Date(selected.feedback_at).toLocaleString("vi-VN")}
                </p>
              )}
            </div>

            <div className="space-y-6 mb-8">
              <h3 className="text-2xl font-bold">Câu trả lời của bạn</h3>
              {selected.answers.map((a, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                  <p className="font-bold text-lg">Câu {idx + 1}:</p>
                  <p className="mt-2 text-gray-800">
                    {a.user_answer || "(Chưa trả lời)"}
                  </p>
                </div>
              ))}
            </div>

            {selected.feedback && (
              <div className="p-6 bg-green-50 rounded-2xl border-2 border-green-200">
                <h3 className="text-2xl font-bold text-green-800 mb-4">
                  Feedback từ Admin 🎉
                </h3>
                <p className="text-lg text-gray-800 whitespace-pre-wrap">
                  {selected.feedback}
                </p>
              </div>
            )}

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
