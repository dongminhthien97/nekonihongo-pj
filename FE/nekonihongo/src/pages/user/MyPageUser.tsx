// src/pages/User/MyPageUser.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/auth";
import toast from "react-hot-toast";
import { NekoLoading } from "../../components/NekoLoading";

interface MyPageUserProps {
  onNavigate: (page: string) => void;
}
export function MyPageUser({ onNavigate }: MyPageUserProps) {
  const {
    user: authUser,
    updateUser,
    refreshUser,
    loading: authLoading,
  } = useAuth();
  // Thêm loading local để delay 600ms khi vào page (tạo cảm giác mượt + đẹp)
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    // Delay 600ms rồi mới tắt loading (cho animation NekoLoading đẹp)
    const timer = setTimeout(() => {
      setLocalLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);
  const PLACEHOLDER_AVATAR_128 =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='100%' height='100%' fill='%23f3e8ff'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='16' fill='%236b21a8' font-family='Arial, sans-serif'>Avatar</text></svg>";

  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(authUser?.avatarUrl || "");

  // THUẬT TOÁN TÍNH LEVEL (Hybrid - giữ nguyên như bạn có)
  const calculateLevel = (points: number = 0): number => {
    if (points < 30) return 1;
    if (points < 70) return 2;
    if (points < 120) return 3;
    if (points < 180) return 4;
    if (points < 250) return 5;
    if (points < 330) return 6;
    if (points < 420) return 7;
    if (points < 520) return 8;
    if (points < 630) return 9;
    if (points < 750) return 10;
    const level = 10 + Math.floor((points - 630) / 150);
    return level;
  };

  const getNextLevelPoints = (currentLevel: number): number => {
    if (currentLevel <= 10) {
      const thresholds = [30, 70, 120, 180, 250, 330, 420, 520, 630, 750];
      return thresholds[currentLevel - 1] || 750;
    }
    return 630 + (currentLevel - 9) * 150;
  };

  if (!authUser) {
    return (
      <div className="min-h-screen bg-linear-to-br from-pink-100 to-purple-100 flex items-center justify-center">
        <p className="text-3xl text-purple-700">Đang tải thông tin mèo...</p>
      </div>
    );
  }
  if (authLoading || localLoading || !authUser) {
    return <NekoLoading message="Mèo đang chuẩn bị MyPage cho bạn... 😻" />;
  }
  // Tính level từ points
  const userLevel = calculateLevel(authUser.points);
  const nextLevelPoints = getNextLevelPoints(userLevel);
  const currentLevelPoints = getNextLevelPoints(userLevel - 1) || 0;
  const pointsInCurrentLevel = authUser.points - currentLevelPoints;
  const pointsNeededForNextLevel = nextLevelPoints - authUser.points;
  const progressToNextLevel = Math.min(
    (authUser.points / nextLevelPoints) * 100,
    100
  );
  const exercisesToNextLevel = Math.ceil(pointsNeededForNextLevel / 10);
  const joinDateFormatted = authUser.joinDate
    ? new Date(authUser.joinDate).toLocaleDateString("vi-VN")
    : "Chưa có";

  const displayName = authUser.fullName || authUser.username || "Neko Chan";
  // Thêm hàm hiển thị streak status
  const getStreakStatus = (streak: number) => {
    if (streak === 0) return "Bắt đầu chuỗi ngay hôm nay!";
    if (streak === 1) return "Chuỗi mới bắt đầu 🔥";
    return "Tiếp tục duy trì nhé 💪";
  };

  const handleAvatarUpdate = async () => {
    if (!avatarUrl.trim()) {
      alert("Vui lòng nhập URL hợp lệ!");
      return;
    }

    try {
      const res = await api.patch("/user/me/avatar", {
        avatarUrl: avatarUrl.trim(),
      });
      const newAvatar =
        res.data?.data?.avatarUrl || res.data?.avatarUrl || avatarUrl.trim();

      updateUser({ avatarUrl: newAvatar });

      await refreshUser(); // Đồng bộ full data từ backend

      setIsEditingAvatar(false);
      toast.success("Cập nhật avatar thành công! 😻", { duration: 1500 });
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) {
        alert("Bạn không có quyền cập nhật avatar. Liên hệ quản trị viên.");
      } else if (status === 400) {
        alert("Avatar không hợp lệ. Vui lòng kiểm tra URL.");
      } else {
        alert("Không thể cập nhật avatar. Vui lòng thử lại sau.");
      }
    }
  };

  const handleBack = () => {
    onNavigate("landing");
  };

  return (
    <div className="min-h-screen bg-soft-gradient p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-4xl text-purple-800">マイページ 🌸</h1>
          <button onClick={handleBack} className="btn-red">
            Quay lại
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl text-purple-700 mb-8 text-center">
            Thông tin cá nhân
          </h2>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative group mb-4">
              <img
                src={authUser.avatarUrl || PLACEHOLDER_AVATAR_128}
                alt="Avatar"
                className="avatar-circle mx-auto"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://wiki.leagueoflegends.com/en-us/images/Chibi_Yuumi_Yuubee_Tier_1.png?9a5ec";
                }}
              />
              <button
                onClick={() => {
                  setIsEditingAvatar(true);
                  setAvatarUrl(authUser.avatarUrl || "");
                }}
                className="floating-btn"
                title="Thay đổi avatar"
              >
                ✏️
              </button>
            </div>

            {isEditingAvatar && (
              <div className="mt-4 w-full max-w-md">
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Dán URL avatar mới"
                  className="input-soft"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleAvatarUpdate}
                    className="btn-purple btn-purple-shadow flex-1"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setIsEditingAvatar(false)}
                    className="btn-gray btn-gray-shadow flex-1"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <div className="info-card">
                <div className="info-icon">👤</div>
                <div>
                  <div className="info-label">Tên</div>
                  <div className="info-value">{displayName}</div>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">📧</div>
                <div>
                  <div className="info-label">Email</div>
                  <div className="info-value">{authUser.email}</div>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">🎭</div>
                <div>
                  <div className="info-label">Vai trò</div>
                  <div className="info-badge">
                    {authUser.role === "ADMIN" ? "Quản trị viên" : "Học viên"}
                  </div>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">📅</div>
                <div>
                  <div className="info-label">Ngày tham gia</div>
                  <div className="info-value">{joinDateFormatted}</div>
                </div>
              </div>
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-6">
              {/* Level Card */}
              <div className="stats-card level-card">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="stats-label">TRÌNH ĐỘ</div>
                    <div className="stats-value">Level {userLevel}</div>
                  </div>
                  <div className="text-4xl">⭐</div>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Tiến độ lên Level {userLevel + 1}</span>
                    <span>{Math.round(progressToNextLevel)}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${progressToNextLevel}%`,
                        background: `linear-gradient(to right, #a855f7, #ec4899)`,
                      }}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {userLevel < 100 ? (
                    <>
                      Cần thêm {pointsNeededForNextLevel} điểm (
                      {exercisesToNextLevel} bài) để lên Level {userLevel + 1}
                    </>
                  ) : (
                    "🎉 Bạn là bậc thầy!"
                  )}
                </div>
              </div>

              {/* Points Card */}
              <div className="stats-card points-card">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="stats-label">TỔNG ĐIỂM</div>
                    <div className="stats-value points-value">
                      {authUser.points}
                    </div>
                    <div className="text-sm text-pink-600 mt-1">
                      ≈ {Math.floor(authUser.points / 10)} bài hoàn thành
                    </div>
                  </div>
                  <div className="text-4xl">🎯</div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Tích lũy từ tất cả bài tập đã hoàn thành (10đ/bài)
                </div>
              </div>

              {/* Streak Card */}
              <div className="stats-card streak-card">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="stats-label">CHUỖI ĐĂNG NHẬP</div>
                    <div className="stats-value streak-value">
                      {authUser.streak} ngày
                    </div>
                    <div className="text-sm text-orange-600 mt-1">
                      {getStreakStatus(authUser.streak ?? 0)}
                    </div>
                    {(authUser.longestStreak ?? 0) > (authUser.streak ?? 0) && (
                      <div className="text-xs text-gray-500 mt-1">
                        Kỷ lục: {authUser.longestStreak ?? 0} ngày
                      </div>
                    )}
                  </div>
                  <div className="text-4xl">🔥</div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Đăng nhập mỗi ngày để duy trì chuỗi!
                  <div className="mt-1 text-xs">
                    {authUser.lastLoginDate
                      ? `Đăng nhập lần cuối: ${new Date(
                          authUser.lastLoginDate
                        ).toLocaleDateString("vi-VN")}`
                      : "Chưa đăng nhập lần nào"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Level Info Table */}
          {/* <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">
              Thông tin Level
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-gray-600">Level hiện tại</div>
                <div className="text-2xl font-bold text-purple-700">
                  {userLevel}
                </div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-gray-600">Điểm hiện có</div>
                <div className="text-2xl font-bold text-purple-700">
                  {authUser.points}
                </div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-gray-600">
                  Điểm cần Level {userLevel + 1}
                </div>
                <div className="text-2xl font-bold text-purple-700">
                  {nextLevelPoints}
                </div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-gray-600">Bài tập cần</div>
                <div className="text-2xl font-bold text-purple-700">
                  {exercisesToNextLevel}
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
      <style>{`
        /* === STYLE GIỮ NGUYÊN ĐẸP LUNG LINH === */
        .btn-red { 
          padding: 0.5rem 1.5rem; 
          background-color: #ef4444; 
          color: #fff; 
          border-radius: 0.5rem; 
          transition: all 0.2s ease; 
          cursor: pointer; 
          font-weight: 600;
        }
        .btn-red:hover { background-color: #dc2626; }
        
        .bg-soft-gradient { 
          background: linear-gradient(to bottom right, #faf5ff, #fdf2f8, #eff6ff); 
          background-attachment: fixed; 
        }
        
        .text-purple-800 { color: #6b21a8; }
        .text-purple-700 { color: #7c3aed; }
        
        .avatar-circle { 
          width: 128px; 
          height: 128px; 
          border-radius: 9999px; 
          border: 4px solid #c4b5fd; 
          object-fit: cover; 
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); 
        }
        .avatar-circle:hover { 
          transform: translateY(-4px) scale(1.05); 
          box-shadow: 0 20px 35px -10px rgba(147,51,234,0.3); 
          transition: all 300ms ease; 
        }
        
        .floating-btn { 
          position: absolute; 
          bottom: 0; 
          right: 0; 
          background-color: #a855f7; 
          color: white; 
          padding: 0.5rem; 
          border-radius: 9999px; 
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); 
          transition: background-color 200ms ease-in-out; 
          z-index: 10; 
          cursor: pointer;
          border: 2px solid white;
        }
        .floating-btn:hover { background-color: #9333ea; }
        
        .input-soft { 
          width: 100%; 
          padding: 0.75rem 1rem; 
          border: 2px solid #c4b5fd; 
          border-radius: 0.75rem; 
          outline: none; 
          background-color: white; 
          font-size: 1rem; 
          transition: border-color 200ms ease; 
        }
        .input-soft:focus { 
          border-color: #a855f7; 
          box-shadow: 0 0 0 3px rgba(168,85,247,0.2); 
        }
        
        .btn-purple { 
          padding: 0.75rem 1.5rem; 
          background-color: #a855f7; 
          color: white; 
          border-radius: 0.75rem; 
          font-weight: 600; 
          text-align: center; 
          transition: all 200ms ease-in-out; 
          cursor: pointer; 
          border: none;
        }
        .btn-purple:hover { 
          background-color: #9333ea; 
          transform: translateY(-2px);
        }
        .btn-purple-shadow { 
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); 
        }
        
        .btn-gray { 
          padding: 0.75rem 1.5rem; 
          background-color: #e5e7eb; 
          color: #374151; 
          border-radius: 0.75rem; 
          font-weight: 600; 
          text-align: center; 
          transition: all 200ms ease-in-out; 
          cursor: pointer; 
          border: none;
        }
        .btn-gray:hover { 
          background-color: #d1d5db; 
          transform: translateY(-2px);
        }
        .btn-gray-shadow { 
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); 
        }
        
        /* Info Cards */
        .info-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: linear-gradient(to right, #faf5ff, #fdf2f8);
          border-radius: 1rem;
          border: 2px solid #f3e8ff;
          transition: transform 0.2s ease;
        }
        .info-card:hover {
          transform: translateY(-2px);
        }
        .info-icon {
          font-size: 2rem;
          min-width: 3rem;
          text-align: center;
        }
        .info-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }
        .info-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: #6b21a8;
        }
        .info-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background-color: #dbeafe;
          color: #1e40af;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        /* Stats Cards */
        .stats-card {
          padding: 1.5rem;
          border-radius: 1rem;
          transition: transform 0.2s ease;
        }
        .stats-card:hover {
          transform: translateY(-2px);
        }
        .level-card {
          background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
          border: 2px solid #ddd6fe;
        }
        .points-card {
          background: linear-gradient(135deg, #fce7f3, #fbcfe8);
          border: 2px solid #f9a8d4;
        }
        .streak-card {
          background: linear-gradient(135deg, #ffedd5, #fed7aa);
          border: 2px solid #fdba74;
        }
        .stats-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }
        .stats-value {
          font-size: 2rem;
          font-weight: 700;
          color: #6b21a8;
        }
        .points-value {
          color: #be185d;
        }
        .streak-value {
          color: #ea580c;
        }
        
        /* Progress Bar */
        .progress-bar-container { 
          width: 100%; 
          background: #e5e7eb; 
          border-radius: 9999px; 
          height: 0.75rem; 
          overflow: hidden; 
        }
        .progress-bar-fill { 
          height: 100%; 
          border-radius: 9999px; 
          transition: all 0.5s ease; 
        }
      `}</style>
    </div>
  );
}
