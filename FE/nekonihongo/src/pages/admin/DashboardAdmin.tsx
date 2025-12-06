import { useEffect, useState } from "react";
import { Footer } from "../../components/Footer";
import api from "../../api/auth";

interface User {
  id: number;
  username: string;
  fullName?: string;
  email: string;
  role: "USER" | "ADMIN";
  level: number;
  points: number;
  streak?: number;
  joinDate: string;
  avatarUrl?: string;
  vocabularyProgress?: number;
  kanjiProgress?: number;
  grammarProgress?: number;
  exerciseProgress?: number;
  password?: string;
}
interface DashboardAdminProps {
  onNavigate: (page: string) => void;
}

export function DashboardAdmin({ onNavigate }: DashboardAdminProps) {
  const PLACEHOLDER_AVATAR =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100%' height='100%' fill='%23e0e7ff'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='12' fill='%234336ca'>New</text></svg>";
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<User>>({});
  const [error, setError] = useState("");

  // LẤY DANH SÁCH USER
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      const userList: User[] = res.data.data || [];
      setUsers(userList);
      setSelectedUser(userList[0] || null);
    } catch (err: any) {
      setError("Không thể tải danh sách user");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCreate = async () => {
    // Kiểm tra bắt buộc
    if (!form.username?.trim()) {
      alert("Tên đăng nhập không được để trống!");
      return;
    }
    if (!form.email?.trim()) {
      alert("Email không được để trống!");
      return;
    }
    if (!form.email.includes("@")) {
      alert("Email không hợp lệ!");
      return;
    }

    try {
      // Gửi đúng format backend mong đợi
      await api.post("/admin/users", {
        username: form.username.trim(),
        email: form.email.trim(),
        fullName: form.fullName?.trim() || null,
        avatarUrl: form.avatarUrl?.trim() || null,
        password: form.password?.trim() || "123456", // mặc định nếu trống
        role: form.role || "USER",
        level: form.level || 1,
        points: form.points || 0,
      });

      alert("Tạo user thành công! Mèo mới đã xuất hiện!");
      setIsCreating(false);
      setForm({});
      fetchUsers(); // reload danh sách
    } catch (err: any) {
      const msg = err.response?.data?.message || "Tạo user thất bại";
      alert(msg);
    }
  };

  const handleSaveEdit = async () => {
    if (!form.id) return;
    if (!form.username?.trim() || !form.email?.trim()) {
      alert("Tên và email không được để trống!");
      return;
    }

    try {
      await api.put(`/admin/users/${form.id}`, {
        username: form.username.trim(),
        email: form.email.trim(),
        fullName: form.fullName?.trim() || null,
        avatarUrl: form.avatarUrl?.trim() || null,
        role: form.role || "USER",
        level: form.level || 1,
        points: form.points || 0,
      });

      alert("Cập nhật thành công!");
      setIsEditing(false);
      setForm({});
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Cập nhật thất bại");
    }
  };

  // XÓA USER
  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa user này thật chứ?")) return;
    try {
      await api.delete(`/admin/users/${id}`); // DÙNG api
      alert("Xóa thành công!");
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Xóa thất bại");
    }
  };

  const handleBack = () => {
    onNavigate("landing"); // Dùng onNavigate như hệ thống của bạn
  };
  // THÊM GẦN ĐẦU FILE, SAU useState
  const [userProgress, setUserProgress] = useState<any[]>([]);

  // THAY ĐỔI useEffect – LẤY CẢ PROGRESS CỦA TẤT CẢ USER
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/admin/users"); // API trả về đầy đủ progress

        const userList: User[] = res.data?.data || res.data || [];

        setUsers(userList);
        setSelectedUser(userList[0] || null);

        // TẠO PROGRESS DATA THẬT TỪ DỮ LIỆU THẬT TRONG DB
        const progressList = userList
          .map((user: any) => [
            {
              userId: user.id,
              topic: "Từ vựng",
              studied: user.vocabularyProgress || 0,
              total: 500,
              score: Math.round(((user.vocabularyProgress || 0) / 500) * 100),
            },
            {
              userId: user.id,
              topic: "Kanji",
              studied: user.kanjiProgress || 0,
              total: 300,
              score: Math.round(((user.kanjiProgress || 0) / 300) * 100),
            },
            {
              userId: user.id,
              topic: "Ngữ pháp",
              studied: user.grammarProgress || 0,
              total: 150,
              score: Math.round(((user.grammarProgress || 0) / 150) * 100),
            },
            {
              userId: user.id,
              topic: "Bài tập",
              studied: user.exerciseProgress || 0,
              total: 200,
              score: Math.round(((user.exerciseProgress || 0) / 200) * 100),
            },
          ])
          .flat();

        setUserProgress(progressList);
      } catch (err: any) {
        console.error("Lỗi:", err);
        setError("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // TÍNH TIẾN ĐỘ CỦA USER ĐƯỢC CHỌN
  const currentProgress = selectedUser
    ? userProgress.filter((p) => p.userId === selectedUser.id)
    : [];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-3xl">
        Đang tải...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-2xl">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-4xl text-indigo-800">Admin Dashboard 👑</h1>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Đăng xuất
          </button>
        </div>
        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          {/* LEFT COLUMN - User Management */}
          <div className="bg-white rounded-2xl shadow-xl p-6 overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl text-indigo-700">Quản lý người dùng</h2>
              <button
                onClick={handleSaveCreate}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium shadow-md"
              >
                ➕ Thêm User
              </button>
            </div>

            {/* User List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-indigo-100">
                  <tr>
                    <th className="p-3 text-left">Avatar</th>
                    <th className="p-3 text-left">Tên</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-center">Level</th>
                    <th className="p-3 text-center">Điểm</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className={`border-b hover:bg-indigo-50 cursor-pointer transition ${
                        selectedUser?.id === user.id ? "bg-indigo-100" : ""
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="p-3">
                        <img
                          src={user.avatarUrl || PLACEHOLDER_AVATAR}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://i.imgur.com/Q4FfVmL.jpeg";
                          }}
                        />
                      </td>
                      <td className="p-3 text-indigo-800 font-medium">
                        {user.username}
                      </td>
                      <td className="p-3 text-gray-600">{user.email}</td>
                      <td className="p-3 text-center">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-bold">
                          {user.level}
                        </span>
                      </td>
                      <td className="p-3 text-center text-pink-600 font-bold">
                        {user.points.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEdit();
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md"
                            title="Sửa"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(user.id);
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
                            title="Xóa"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit/Create Form – GIỮ NGUYÊN STYLE ĐẸP LUNG LINH */}
            {(isEditing || isCreating) && (
              <div className="mt-6 p-6 bg-blue-50 rounded-xl border-2 border-blue-200 shadow-lg">
                <h3 className="text-xl font-bold text-indigo-700 mb-4">
                  {isCreating ? "Tạo User Mới" : "Chỉnh sửa User"}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1 font-medium">
                      Tên đăng nhập:
                    </label>
                    <input
                      type="text"
                      value={editForm.username || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, username: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 outline-none transition"
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1 font-medium">
                      Email:
                    </label>
                    <input
                      type="email"
                      value={editForm.email || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 outline-none transition"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1 font-medium">
                      Level:
                    </label>
                    <input
                      type="number"
                      value={editForm.level || 1}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          level: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 outline-none transition"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1 font-medium">
                      Điểm:
                    </label>
                    <input
                      type="number"
                      value={editForm.points || 0}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          points: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 outline-none transition"
                      min="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-700 mb-1 font-medium">
                      Avatar URL:
                    </label>
                    <input
                      type="text"
                      value={editForm.avatarUrl || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, avatarUrl: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 outline-none transition"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  {isCreating && (
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-700 mb-1 font-medium">
                        Mật khẩu (để trống = 123456):
                      </label>
                      <input
                        type="text"
                        value={editForm.password || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, password: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 outline-none transition"
                        placeholder="Mật khẩu"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={isCreating ? handleSaveCreate : handleSaveEdit}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white text-lg font-bold rounded-lg hover:bg-indigo-700 transition shadow-xl"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setIsCreating(false);
                      setEditForm({});
                    }}
                    className="flex-1 px-6 py-3 bg-gray-400 text-white text-lg font-bold rounded-lg hover:bg-gray-500 transition shadow-xl"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - User Progress */}
          <div className="bg-white rounded-2xl shadow-xl p-6 overflow-auto">
            <h2 className="text-2xl text-indigo-700 mb-6">
              Tiến độ: {selectedUser?.username || "Chọn user"}
            </h2>

            {selectedUser && (
              <>
                {/* User Summary Card */}
                <div className="bg-linear-to-r from-indigo-100 to-purple-100 p-6 rounded-xl mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={selectedUser.avatarUrl || PLACEHOLDER_AVATAR}
                      alt={selectedUser.username}
                      className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-lg"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://i.imgur.com/Q4FfVmL.jpeg";
                      }}
                    />
                    <div>
                      <h3 className="text-2xl text-indigo-800">
                        {selectedUser.username}
                      </h3>
                      <p className="text-gray-600">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl text-purple-600">
                        {selectedUser.level}
                      </div>
                      <div className="text-xs text-gray-600">Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl text-pink-600">
                        {selectedUser.points}
                      </div>
                      <div className="text-xs text-gray-600">Điểm</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl text-orange-600">
                        {selectedUser.streak}
                      </div>
                      <div className="text-xs text-gray-600">Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-blue-600">
                        {selectedUser.joinDate}
                      </div>
                      <div className="text-xs text-gray-600">Tham gia</div>
                    </div>
                  </div>
                </div>

                {/* Progress List */}
                <div className="space-y-4">
                  {currentProgress.length > 0 ? (
                    currentProgress.map((item, index) => {
                      const percentage = (item.studied / item.total) * 100;
                      return (
                        <div
                          key={index}
                          className="bg-linear-to-r from-indigo-50 to-purple-50 p-5 rounded-xl border-2 border-indigo-100"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg text-indigo-800">
                              {item.topic}
                            </h3>
                            <span className="text-xl text-pink-600">
                              {item.score} điểm
                            </span>
                          </div>

                          <div className="mb-2">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>
                                {item.studied} / {item.total} từ
                              </span>
                              <span>{Math.round(percentage)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div
                                className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex gap-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${
                                  i < Math.floor(item.score / 20)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-500 py-12">
                      Không có dữ liệu tiến độ cho user này
                    </div>
                  )}
                </div>
              </>
            )}

            {!selectedUser && (
              <div className="text-center text-gray-500 py-12">
                Chọn một user để xem tiến độ
              </div>
            )}
          </div>
          <Footer />
          <style>{`
  body, html, #__next, .min-h-screen {
    background: linear-gradient(to bottom right, 
                #f8fafc,   /* slate-50   */
                #eff6ff,   /* blue-50    */
                #eef2ff);  /* indigo-50 
    min-height: 100vh;
  }
  .min-h-screen {
    background: linear-gradient(to bottom right, 
                #f8fafc, 
                #eff6ff, 
                #eef2ff);
    background-attachment: fixed;
  }
    /* Màu chữ indigo-800 chính xác như Tailwind */
  .text-indigo-800 { color: #4338ca; }

  /* Một vài tông indigo thường dùng thêm (tuỳ chọn) */
  .text-indigo-700 { color: #4f46e5; }
  .text-indigo-600 { color: #6366f1; }
  .text-indigo-500 { color: #818cf8; }
  .text-indigo-400 { color: #a5b4fc; }

  /* Màu nền indigo */
  .bg-indigo-800 { background-color: #4338ca; }
  .bg-indigo-600 { background-color: #6366f1; }
  .bg-indigo-500 { background-color: #818cf8; }

  /* Border indigo */
  .border-indigo-800 { border-color: #4338ca; }
  .border-indigo-600 { border-color: #6366f1; }

  /* Hover nhanh */
  .hover\\:text-indigo-800:hover { color: #4338ca; }
  .hover\\:bg-indigo-800:hover { background-color: #4338ca; }
  /* Đỏ chuẩn Tailwind red-500 */
  .bg-red-500 {
    background-color: #ef4444;
  }

  /* Hover chuyển sang red-600 */
  .hover\\:bg-red-600:hover {
    background-color: #dc2626;
  }

  /* Transition mượt 200ms (giống Tailwind mặc định) */
  .transition-red {
    transition: background-color 200ms ease-in-out;
  }

  /* Nếu muốn dùng 1 class gọn hơn */
  .btn-red {
    background-color: #ef4444;
    transition: background-color 200ms ease-in-out;
  }
  .btn-red:hover {
    background-color: #dc2626;
  }
  /* Xanh lá chuẩn Tailwind */
  .bg-green-500 {
    background-color: #22c55e;  /* green-500 */
  }

  .hover\\:bg-green-600:hover {
    background-color: #16a34a;  /* green-600 */
  }

  /* Transition mượt (giống Tailwind mặc định) */
  .transition-green {
    transition: background-color 200ms ease-in-out;
  }

  /* Class gọn 1 dòng nếu bạn thích */
  .btn-green {
    background-color: #22c55e;
    transition: background-color 200ms ease-in-out;
  }
  .btn-green:hover {
    background-color: #16a34a;
  }

  /* Indigo-100 chính xác như Tailwind */
  .bg-indigo-100 {
    background-color: #e0e7ff;
  }

  /* Một vài tông liên quan thường dùng cùng */
  .bg-indigo-50  { background-color: #eef2ff; }
  .bg-indigo-200 { background-color: #c7d2fe; }
  .bg-indigo-300 { background-color: #a5b4fc; }

  /* Text + border indigo-100 */
  .text-indigo-100 { color: #e0e7ff; }
  .border-indigo-100 { border-color: #e0e7ff; }

  /* Hover nếu cần */
  .hover\\:bg-indigo-100:hover { background-color: #e0e7ff; }
  bg-indigo-50.hover { background-color: #eef2ff; }

  /* Màu chữ purple-700 chuẩn Tailwind */
  .text-purple-700 {
    color: #7c3aed;   /* #7c3aed */
  }

  /* Các tông purple hay đi kèm (tuỳ chọn thêm) */
  .text-purple-600 { color: #9333ea; }
  .text-purple-500 { color: #a855f7; }
  .text-purple-800 { color: #6d28d9; }
  .text-purple-900 { color: #5b21b6; }

  /* Nền + border nếu cần */
  .bg-purple-700   { background-color: #7c3aed; }
  .border-purple-700 { border-color: #7c3aed; }

  /* Hover text */
  .hover\\:text-purple-700:hover { color: #7c3aed; }

  /* Màu chữ pink-600 chuẩn Tailwind */
  .text-pink-600 {
    color: #ec4899;
  }

  /* Các tông pink thường dùng kèm (tuỳ chọn) */
  .text-pink-500 { color: #f43f5e; }
  .text-pink-700 { color: #db2777; }
  .text-pink-800 { color: #be185d; }
  .text-pink-400 { color: #f472b6; }
  .text-pink-300 { color: #f9a8d4; }

  /* Hover nếu cần */
  .hover\\:text-pink-600:hover {
    color: #ec4899;
  }
    /* Xanh dương chuẩn Tailwind */
  .bg-blue-500 {
    background-color: #3b82f6;   /* blue-500 */
  }

  .hover\\:bg-blue-600:hover {
    background-color: #2563eb;   /* blue-600 */
  }

  /* Transition mượt (200ms như Tailwind mặc định) */
  .transition-blue {
    transition: background-color 200ms ease-in-out;
  }

  /* Class gộp siêu gọn (dùng 1 class duy nhất) */
  .btn-blue {
    background-color: #3b82f6;
    transition: background-color 200ms ease-in-out;
  }
  .btn-blue:hover {
    background-color: #2563eb;
  }
`}</style>
        </div>
      </div>
    </div>
  );
}
