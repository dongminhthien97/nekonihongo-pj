// src/pages/User/MyPageUser.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Footer } from "../../components/Footer";
import api from "../../api/auth";
import type { User } from "../../types/User";

interface MyPageUserProps {
  onNavigate: (page: string) => void;
}

export function MyPageUser({ onNavigate }: MyPageUserProps) {
  const { user: authUser } = useAuth(); // Lấy user thật từ backend

  const PLACEHOLDER_AVATAR_128 =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='100%' height='100%' fill='%23f3e8ff'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='16' fill='%236b21a8' font-family='Arial, sans-serif'>Avatar</text></svg>";

  // State hiển thị – mặc định loading
  const [user, setUser] = useState<any>({
    name: "Đang tải mèo...",
    email: "",
    avatar: PLACEHOLDER_AVATAR_128,
    role: "USER",
    joinDate: "",
    level: 0,
    totalScore: 0,
    streak: 0,
    vocabularyProgress: 0,
    kanjiProgress: 0,
    grammarProgress: 0,
    exerciseProgress: 0,
  });

  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  // ĐỒNG BỘ DATA THẬT TỪ BACKEND
  useEffect(() => {
    if (authUser) {
      const joinDate = authUser.joinDate
        ? new Date(authUser.joinDate).toLocaleDateString("vi-VN")
        : "Chưa có";

      setUser({
        name: authUser.username || authUser.fullName || "Neko Chan",
        email: authUser.email || "",
        avatar: authUser.avatarUrl || PLACEHOLDER_AVATAR_128,
        role: authUser.role?.toUpperCase() || "USER",
        joinDate,
        level: authUser.level || 1,
        totalScore: authUser.points || 0,
        streak: authUser.streak || 0,
        vocabularyProgress: authUser.vocabularyProgress || 0,
        kanjiProgress: authUser.kanjiProgress || 0,
        grammarProgress: authUser.grammarProgress || 0,
        exerciseProgress: authUser.exerciseProgress || 0,
      });

      setAvatarUrl(authUser.avatarUrl || "");
    }
  }, [authUser]);

  // Tính toán tiến độ – dùng data thật
  const progressData = [
    { topic: "Từ vựng", studied: user.vocabularyProgress, total: 500 },
    { topic: "Kanji", studied: user.kanjiProgress, total: 300 },
    { topic: "Ngữ pháp", studied: user.grammarProgress, total: 150 },
    { topic: "Bài tập", studied: user.exerciseProgress, total: 200 },
  ];

  const avgProgress = Math.round(
    progressData.reduce((sum, p) => sum + (p.studied / p.total) * 100, 0) /
      progressData.length
  );

  const totalStudied = progressData.reduce((sum, p) => sum + p.studied, 0);

  const handleAvatarUpdate = async () => {
    if (!avatarUrl.trim()) {
      alert("Vui lòng nhập URL hợp lệ!");
      return;
    }

    // Use the shared API client which attaches the access token
    try {
      // Debug: log request info (no token printed)
      console.debug("Avatar PATCH request:", {
        url: (api.defaults.baseURL || "") + "/user/me/avatar",
        hasToken: !!localStorage.getItem("accessToken"),
        payload: { avatarUrl: avatarUrl.trim() },
      });

      const res = await api.patch("/user/me/avatar", {
        avatarUrl: avatarUrl.trim(),
      });

      const newAvatar =
        res.data?.data?.avatarUrl || res.data?.avatarUrl || avatarUrl.trim();

      // Update state
      setUser((prev: User) => ({
        ...prev,
        avatar: newAvatar,
      }));

      // Update localStorage (keep shape compatible with AuthContext)
      const saved = JSON.parse(localStorage.getItem("nekoUser") || "{}");
      localStorage.setItem(
        "nekoUser",
        JSON.stringify({ ...saved, avatarUrl: newAvatar })
      );

      setIsEditingAvatar(false);
    } catch (err: any) {
      // Provide clearer messages for 403 Forbidden and other cases
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message || err?.message;
      console.error("Avatar update error:", err?.response || err);

      if (status === 403) {
        alert(
          "Bạn không có quyền cập nhật avatar (Forbidden). Liên hệ quản trị viên."
        );
        return;
      }

      if (status === 400) {
        alert(serverMessage || "Avatar không hợp lệ. Vui lòng kiểm tra URL.");
        return;
      }

      alert("Không thể cập nhật avatar. Vui lòng thử lại sau.");
    }
  };

  const handleBack = () => {
    onNavigate("landing"); // Dùng onNavigate như hệ thống của bạn
  };

  if (!authUser) {
    return (
      <div className="min-h-screen bg-linear-to-br from-pink-100 to-purple-100 flex items-center justify-center">
        <p className="text-3xl text-purple-700">Đang tải thông tin mèo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-4xl text-purple-800">マイページ 🌸</h1>
          <button onClick={handleBack} className="btn-red">
            Quay lại
          </button>
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          {/* LEFT COLUMN - User Info */}
          <div className="bg-white rounded-2xl shadow-xl p-8 overflow-auto">
            <h2 className="text-2xl text-purple-700 mb-6">Thông tin cá nhân</h2>

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <img
                  src={user.avatar || PLACEHOLDER_AVATAR_128}
                  alt="Avatar"
                  className="avatar-circle mx-auto"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://wiki.leagueoflegends.com/en-us/images/Chibi_Yuumi_Yuubee_Tier_1.png?9a5ec";
                  }}
                />
                {/* <button
                  onClick={() => setIsEditingAvatar(true)}
                  className="floating-btn"
                  title="Thay đổi avatar"
                >
                  ✏️
                </button> */}
              </div>

              {isEditingAvatar && (
                <div className="mt-4 w-full">
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Dán URL avatar mới"
                    className="input-soft"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAvatarUpdate}
                      className="btn-purple btn-purple-shadow"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingAvatar(false);
                        setAvatarUrl(user.avatar);
                      }}
                      className="btn-gray btn-gray-shadow"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Details Table */}
            <table className="w-full">
              <tbody>
                <tr className="border-b-purple-100 pb-6 mb-6">
                  <td className="py-3 text-gray-600">👤Tên:</td>
                  <td className="py-3 text-purple-800">{user.name}</td>
                </tr>
                <tr className="border-b-purple-100 pb-6 mb-6">
                  <td className="py-3 text-gray-600">📧Email:</td>
                  <td className="py-3 text-purple-800">{user.email}</td>
                </tr>
                <tr className="border-b-purple-100 pb-6 mb-6">
                  <td className="py-3 text-gray-600">🎭Vai trò:</td>
                  <td className="py-3">
                    <span className="badge-blue">Học viên</span>
                  </td>
                </tr>
                <tr className="border-b-purple-100 pb-6 mb-6">
                  <td className="py-3 text-gray-600">📅Ngày tham gia:</td>
                  <td className="py-3 text-purple-800">{user.joinDate}</td>
                </tr>
                <tr className="border-b-purple-100 pb-6 mb-6">
                  <td className="py-3 text-gray-600">⭐Trình độ:</td>
                  <td className="py-3">
                    <span className="text-2xl text-purple-700">
                      {user.level}
                    </span>
                  </td>
                </tr>
                <tr className="border-b-purple-100 pb-6 mb-6">
                  <td className="py-3 text-gray-600">🎯 Tổng điểm:</td>
                  <td className="py-3">
                    <span className="text-2xl text-pink-600">
                      {user.totalScore}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-600">🔥Chuỗi:</td>
                  <td className="py-3">
                    <span className="text-2xl text-orange-500">
                      {user.streak} ngày
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="purple-gradient-box">
                <div className="text-3xl mb-2">📚</div>
                <div className="text-2xl text-purple-800">{totalStudied}</div>
                <div className="text-xs text-purple-600">Từ đã học</div>
              </div>
              <div className="purple-gradient-box">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-2xl text-pink-800">{avgProgress}%</div>
                <div className="text-xs text-pink-600">Tiến độ</div>
              </div>
              <div className="blue-gradient-box">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-2xl text-blue-800">
                  {Math.round(
                    progressData.reduce(
                      (sum, p) => sum + (p.studied / p.total) * 100,
                      0
                    ) / progressData.length
                  )}
                </div>
                <div className="text-xs text-blue-600">Điểm TB</div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Progress */}
          <div className="bg-white rounded-2xl shadow-xl p-8 overflow-auto">
            <h2 className="text-2xl text-purple-700 mb-6">Tiến độ học tập</h2>

            <div className="space-y-4">
              {progressData.map((item, index) => {
                const percentage = (item.studied / item.total) * 100;
                return (
                  <div key={index} className="cute-gradient-box">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg text-purple-800">{item.topic}</h3>
                      <span className="text-2xl text-pink-600">
                        {Math.round(percentage)} điểm
                      </span>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>
                          {item.studied} / {item.total} từ
                        </span>
                        <span>{Math.round(percentage)}%</span>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <div className="text-xs text-gray-500">
                        Độ thành thạo:
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < Math.floor(percentage / 20)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Achievement Section */}
            <div className="yellow-orange-section">
              <h3 className="text-xl text-orange-800 mb-4">
                Thành tích gần đây
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-2xl">🔥</span>
                  <span className="text-gray-700">
                    Streak {user.streak} ngày liên tục
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-2xl">⭐</span>
                  <span className="text-gray-700">Đạt Level {user.level}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* GIỮ NGUYÊN 100% STYLE CỦA BẠN */}
      <style>{`
        /* === TOÀN BỘ STYLE CỦA BẠN – KHÔNG THAY ĐỔI GÌ === */
        .btn-red { padding: 0.5rem 1.5rem; background-color: #ef4444; color: #fff; border-radius: 0.5rem; transition: all 0.2s ease; cursor: pointer; }
        .btn-red:hover { background-color: #dc2626; }
        .yellow-orange-section { margin-top: 2rem; padding: 1.5rem; background: linear-gradient(to right, #fefce8, #fff7ed); border-radius: 0.75rem; border: 2px solid #fef08a; }
        .text-gray-300 { color: #d1d5db; }
        .text-yellow-400 { color: #facc15; }
        .progress-bar-fill { height: 100%; background: linear-gradient(to right, #a855f7, #ec4899); border-radius: 9999px; transition: all 0.5s ease; }
        .progress-bar-container { width: 100%; background: #e5e7eb; border-radius: 9999px; height: 1rem; overflow: hidden; }
        .bg-soft-gradient { background: linear-gradient(to bottom right, #faf5ff, #fdf2f8, #eff6ff); background-attachment: fixed; }
        .text-purple-800 { color: #6b21a8; }
        .text-purple-700 { color: #7c3aed; }
        .text-purple-600 { color: #9333ea; }
        .avatar-circle { width: 128px; height: 128px; border-radius: 9999px; border: 4px solid #c4b5fd; object-fit: cover; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
        .avatar-circle:hover { transform: translateY(-4px) scale(1.05); box-shadow: 0 20px 35px -10px rgba(147,51,234,0.3); transition: all 300ms ease; }
        .floating-btn { position: absolute; bottom: 0; right: 0; background-color: #a855f7; color: white; padding: 0.5rem; border-radius: 9999px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); transition: background-color 200ms ease-in-out; z-index: 10; }
        .floating-btn:hover { background-color: #9333ea; }
        .input-soft { width: 100%; padding: 0.5rem 1rem; border: 2px solid #c4b5fd; border-radius: 0.5rem; outline: none; margin-bottom: 0.5rem; background-color: white; font-size: 1rem; transition: border-color 200ms ease; }
        .input-soft:focus { border-color: #a855f7; box-shadow: 0 0 0 3px rgba(168,85,247,0.2); }
        .btn-purple { flex: 1; padding: 0.5rem 1rem; background-color: #a855f7; color: white; border-radius: 0.5rem; font-weight: 600; text-align: center; transition: background-color 200ms ease-in-out; cursor: pointer; }
        .btn-purple:hover { background-color: #9333ea; }
        .btn-purple-shadow { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); }
        .btn-purple-shadow:hover { box-shadow: 0 10px 15px -3px rgba(147,51,234,0.3); }
        .btn-gray { flex: 1; padding: 0.5rem 1rem; background-color: #d1d5db; color: #374151; border-radius: 0.5rem; font-weight: 600; text-align: center; transition: background-color 200ms ease-in-out; cursor: pointer; }
        .btn-gray:hover { background-color: #9ca3af; }
        .btn-gray-shadow { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); }
        .border-b-purple-100 { border-bottom: 1px solid #e9d5ff; }
        .text-gray-600 { color: #52525b; }
        .badge-blue { display: inline-block; padding: 0.25rem 0.75rem; background-color: #dbeafe; color: #1e40af; border-radius: 9999px; font-size: 0.875rem; font-weight: 500; }
        .text-orange-500 { color: #f97316; }
        .text-pink-600 { color: #ec4899; }
        .cute-gradient-box { background: linear-gradient(to right, #faf5ff, #fdf2f8); padding: 1.25rem; border-radius: 0.75rem; border: 2px solid #f3e8ff; }
        .purple-gradient-box { background: linear-gradient(to bottom right, #f3e8ff, #e9d5ff); padding: 1rem; border-radius: 0.75rem; text-align: center; }
        .blue-gradient-box { background: linear-gradient(to bottom right, #dbeafe, #bfdbfe); padding: 1rem; border-radius: 0.75rem; text-align: center; }
      `}</style>
    </div>
  );
}
