import { useState } from "react";
import { Navigation } from "../../components/Navigation";
import { Footer } from "../../components/Footer";
import { Background } from "../../components/Background";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  level: number;
  totalScore: number;
  streak: number;
  joinDate: string;
  avatar: string;
}

interface UserProgress {
  userId: number;
  topic: string;
  studied: number;
  total: number;
  score: number;
}
interface DashboardAdminProps {
  onNavigate: (page: string) => void;
}

export function DashboardAdmin({ onNavigate }: DashboardAdminProps) {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "Trúc Chan",
      email: "truc@neko.jp",
      role: "user",
      level: 12,
      totalScore: 2450,
      streak: 15,
      joinDate: "2024-01-15",
      avatar:
        "https://ih1.redbubble.net/image.5481873298.3314/st,small,507x507-pad,600x600,f8f8f8.jpg",
    },
    {
      id: 2,
      name: "Sakura Yuki",
      email: "sakura@neko.jp",
      role: "user",
      level: 8,
      totalScore: 1650,
      streak: 7,
      joinDate: "2024-02-20",
      avatar: "https://i.imgur.com/Q4FfVmL.jpeg",
    },
    {
      id: 3,
      name: "Hana Tanaka",
      email: "hana@neko.jp",
      role: "user",
      level: 15,
      totalScore: 3200,
      streak: 30,
      joinDate: "2023-12-01",
      avatar: "https://i.imgur.com/Q4FfVmL.jpeg",
    },
  ]);

  const [selectedUser, setSelectedUser] = useState<User | null>(users[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  const [userProgress] = useState<UserProgress[]>([
    { userId: 1, topic: "Hiragana", studied: 46, total: 46, score: 98 },
    { userId: 1, topic: "Katakana", studied: 42, total: 46, score: 85 },
    { userId: 1, topic: "Kanji N5", studied: 67, total: 100, score: 72 },
    { userId: 2, topic: "Hiragana", studied: 40, total: 46, score: 82 },
    { userId: 2, topic: "Katakana", studied: 30, total: 46, score: 75 },
    { userId: 3, topic: "Hiragana", studied: 46, total: 46, score: 100 },
    { userId: 3, topic: "Katakana", studied: 46, total: 46, score: 98 },
    { userId: 3, topic: "Kanji N5", studied: 95, total: 100, score: 92 },
  ]);

  const handleEdit = (user: User) => {
    setEditForm(user);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditForm({
      name: "",
      email: "",
      role: "user",
      level: 1,
      totalScore: 0,
      streak: 0,
      joinDate: new Date().toISOString().split("T")[0],
      avatar: "https://via.placeholder.com/100?text=New",
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (isCreating) {
      const newUser: User = {
        id: Math.max(...users.map((u) => u.id)) + 1,
        ...editForm,
      } as User;
      setUsers([...users, newUser]);
      setSelectedUser(newUser);
    } else {
      setUsers(
        users.map((u) => (u.id === editForm.id ? (editForm as User) : u))
      );
      setSelectedUser(editForm as User);
    }
    setIsEditing(false);
    setIsCreating(false);
    setEditForm({});
  };

  const handleDelete = (userId: number) => {
    if (window.confirm("Bạn có chắc muốn xóa user này?")) {
      setUsers(users.filter((u) => u.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(users[0] || null);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const currentProgress = selectedUser
    ? userProgress.filter((p) => p.userId === selectedUser.id)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-4xl text-indigo-800">Admin Dashboard 👑</h1>
          <button
            onClick={handleLogout}
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
                onClick={handleCreate}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
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
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://i.imgur.com/Q4FfVmL.jpeg";
                          }}
                        />
                      </td>
                      <td className="p-3 text-indigo-800">{user.name}</td>
                      <td className="p-3 text-gray-600">{user.email}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {user.level}
                        </span>
                      </td>
                      <td className="p-3 text-center text-pink-600">
                        {user.totalScore}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(user);
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(user.id);
                            }}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit/Create Form */}
            {(isEditing || isCreating) && (
              <div className="mt-6 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                <h3 className="text-xl text-indigo-700 mb-4">
                  {isCreating ? "Tạo User Mới" : "Chỉnh sửa User"}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Tên:
                    </label>
                    <input
                      type="text"
                      value={editForm.name || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Email:
                    </label>
                    <input
                      type="email"
                      value={editForm.email || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Level:
                    </label>
                    <input
                      type="number"
                      value={editForm.level || 1}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          level: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Điểm:
                    </label>
                    <input
                      type="number"
                      value={editForm.totalScore || 0}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          totalScore: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">
                      Avatar URL:
                    </label>
                    <input
                      type="text"
                      value={editForm.avatar || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, avatar: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    💾 Lưu
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setIsCreating(false);
                      setEditForm({});
                    }}
                    className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                  >
                    ❌ Hủy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - User Progress */}
          <div className="bg-white rounded-2xl shadow-xl p-6 overflow-auto">
            <h2 className="text-2xl text-indigo-700 mb-6">
              Tiến độ: {selectedUser?.name || "Chọn user"}
            </h2>

            {selectedUser && (
              <>
                {/* User Summary Card */}
                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-xl mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-lg"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://i.imgur.com/Q4FfVmL.jpeg";
                      }}
                    />
                    <div>
                      <h3 className="text-2xl text-indigo-800">
                        {selectedUser.name}
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
                        {selectedUser.totalScore}
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
                          className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-xl border-2 border-indigo-100"
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
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
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
