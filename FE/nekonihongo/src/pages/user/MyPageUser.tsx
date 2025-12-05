import { useState, useEffect } from "react";
import { Footer } from "../../components/Footer";

interface UserData {
  name: string;
  email: string;
  role: string;
  avatar: string;
  joinDate: string;
  level: number;
  totalScore: number;
  streak: number;
}

interface ProgressData {
  topic: string;
  studied: number;
  total: number;
  score: number;
}

interface MyPageUserProps {
  onNavigate: (page: string) => void;
}

export function MyPageUser({ onNavigate }: MyPageUserProps) {
  const [user, setUser] = useState<UserData>({
    name: "Trúc Chan",
    email: "truc@neko.jp",
    role: "user",
    avatar:
      "https://ih1.redbubble.net/image.5481873298.3314/st,small,507x507-pad,600x600,f8f8f8.jpg",
    joinDate: "2024-01-15",
    level: 12,
    totalScore: 2450,
    streak: 15,
  });

  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar);

  const [progressData] = useState<ProgressData[]>([
    { topic: "Hiragana", studied: 46, total: 46, score: 98 },
    { topic: "Katakana", studied: 42, total: 46, score: 85 },
    { topic: "Kanji N5", studied: 67, total: 100, score: 72 },
    { topic: "Vocabulary", studied: 234, total: 500, score: 88 },
    { topic: "Grammar", studied: 45, total: 80, score: 76 },
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser((prev) => ({
        ...prev,
        name: userData.name,
        email: userData.email,
      }));
    }
  }, []);

  const handleAvatarUpdate = () => {
    if (avatarUrl.trim()) {
      setUser({ ...user, avatar: avatarUrl });
      setIsEditingAvatar(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-soft-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-4xl text-purple-800">マイページ 🌸</h1>
          <button onClick={handleLogout} className="btn-red">
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
                  src={user.avatar}
                  alt="Avatar"
                  className="avatar-circle mx-auto"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/128?text=Avatar";
                  }}
                />
                <button
                  onClick={() => setIsEditingAvatar(true)}
                  className="floating-btn"
                  title="Thay đổi avatar"
                >
                  ✏️
                </button>
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
                  <td className="py-3 text-gray-600">👤 Tên:</td>
                  <td className="py-3 text-purple-800">{user.name}</td>
                </tr>
                <tr className="border-b-purple-100 pb-6 mb-6">
                  <td className="py-3 text-gray-600">📧 Email:</td>
                  <td className="py-3 text-purple-800">{user.email}</td>
                </tr>
                <tr className="border-b-purple-100 pb-6 mb-6">
                  <td className="py-3 text-gray-600">🎭 Vai trò:</td>
                  <td className="py-3">
                    <span className="badge-blue">
                      {user.role === "user" ? "Học viên" : user.role}
                    </span>
                  </td>
                </tr>
                <tr className="border-b-purple-100 pb-6 mb-6">
                  <td className="py-3 text-gray-600">📅 Ngày tham gia:</td>
                  <td className="py-3 text-purple-800">{user.joinDate}</td>
                </tr>
                <tr className="border-b-purple-100 pb-6 mb-6">
                  <td className="py-3 text-gray-600">⭐ Level:</td>
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
                  <td className="py-3 text-gray-600">🔥 Chuỗi ngày:</td>
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
                <div className="text-2xl text-purple-800">
                  {progressData.reduce((sum, p) => sum + p.studied, 0)}
                </div>
                <div className="text-xs text-purple-600">Từ đã học</div>
              </div>
              <div className="purple-gradient-box">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-2xl text-pink-800">
                  {Math.round(
                    progressData.reduce(
                      (sum, p) => sum + (p.studied / p.total) * 100,
                      0
                    ) / progressData.length
                  )}
                  %
                </div>
                <div className="text-xs text-pink-600">Tiến độ</div>
              </div>
              <div className="blue-gradient-box">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-2xl text-blue-800">
                  {Math.round(
                    progressData.reduce((sum, p) => sum + p.score, 0) /
                      progressData.length
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
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Score Indicator */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="text-xs text-gray-500">
                        Độ thành thạo:
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
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
                  </div>
                );
              })}
            </div>

            {/* Achievement Section */}
            <div className="yellow-orange-section">
              <h3 className="text-xl text-orange-800 mb-4">
                🏅 Thành tích gần đây
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-2xl">🎉</span>
                  <span className="text-gray-700">
                    Hoàn thành 100% Hiragana
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-2xl">🔥</span>
                  <span className="text-gray-700">Streak 15 ngày liên tục</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-2xl">⭐</span>
                  <span className="text-gray-700">Đạt Level 12</span>
                </div>
              </div>
            </div>
          </div>
          <Footer />
          <style>{`
            .btn-red {
    padding-left: 1.5rem;   /* px-6 */
    padding-right: 1.5rem;  /* px-6 */
    padding-top: 0.5rem;    /* py-2 */
    padding-bottom: 0.5rem; /* py-2 */
    background-color: #ef4444; /* bg-red-500 */
    color: #ffffff;          /* text-white */
    border-radius: 0.5rem;   /* rounded-lg */
    transition: all 0.2s ease; /* transition */
    cursor: pointer;
  }

  .btn-red:hover {
    background-color: #dc2626; /* hover:bg-red-600 */
  }
           .text-orange-800 {
    color: #9a3412; /* orange-800 */
  }
            .yellow-orange-section {
    margin-top: 2rem; /* mt-8 */
    padding: 1.5rem; /* p-6 */
    background: linear-gradient(to right, #fefce8, #fff7ed); /* yellow-50 → orange-50 */
    border-radius: 0.75rem; /* rounded-xl */
    border: 2px solid #fef08a; /* border-yellow-200 */
  }
            .text-gray-300 {
    color: #d1d5db; /* gray-300 */
  }
          .text-yellow-400 {
    color: #facc15; /* yellow-400 */
  }
           .progress-bar-fill {
    height: 100%; /* h-full */
    background: linear-gradient(to right, #a855f7, #ec4899); /* purple-500 → pink-500 */
    border-radius: 9999px; /* rounded-full */
    transition: all 0.5s ease; /* transition-all duration-500 */
  }

            .progress-bar-container {
    width: 100%;               /* w-full */
    background: #e5e7eb;       /* bg-gray-200 */
    border-radius: 9999px;     /* rounded-full */
    height: 1rem;              /* h-4 */
    overflow: hidden;          /* overflow-hidden */
  }
            .bg-soft-gradient {
              background: linear-gradient(
                to bottom right,
                #faf5ff,
                #fdf2f8,
                #eff6ff
              );
              background-attachment: fixed;
            }
            .text-purple-800 {
    color: #6b21a8;
  }


  .text-purple-700 { color: #7c3aed; }
  .text-purple-900 { color: #581c87; }
  .text-purple-600 { color: #9333ea; }

  .hover\\:text-purple-800:hover {
    color: #6b21a8;
  }


  .bg-purple-800   { background-color: #6b21a8; }
  .border-purple-800 { border-color: #6b21a8; }

  .avatar-circle {
    width: 128px;
    height: 128px;
    border-radius: 9999px;
    border: 4px solid #c4b5fd;     /* purple-300 */
    object-fit: cover;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
                0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .avatar-circle:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 20px 35px -10px rgba(147, 51, 234, 0.3);
    transition: all 300ms ease;
  }
    /* Nút tròn nhỏ – góc dưới phải */
  .floating-btn {
    position: absolute;
    bottom: 0;
    right: 0;
    background-color: #a855f7;        /* purple-500 */
    color: white;
    padding: 0.5rem;                  /* p-2 */
    border-radius: 9999px;            /* rounded-full */
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
    transition: background-color 200ms ease-in-out;
    z-index: 10;
  }

  .floating-btn:hover {
    background-color: #9333ea;        /* purple-600 */
  }

  /* Nếu muốn nút to hơn một chút (p-3, p-4…) */
  .floating-btn-lg {
    padding: 0.75rem;                 /* p-3 */
  }
  .floating-btn-xl {
    padding: 1rem;                    /* p-4 */
  }
  
  /* Input kiểu mềm mại – full width, viền tím nhạt */
  .input-soft {
    width: 100%;
    padding-left: 1rem;      /* px-4 */
    padding-right: 1rem;
    padding-top: 0.5rem;     /* py-2 */
    padding-bottom: 0.5rem;
    border: 2px solid #c4b5fd;   /* border-purple-300 */
    border-radius: 0.5rem;       /* rounded-lg */
    outline: none;
    margin-bottom: 0.5rem;       /* mb-2 */
    background-color: white;
    font-size: 1rem;
    transition: border-color 200ms ease;
  }

  /* Focus → viền tím đậm hơn */
  .input-soft:focus {
    border-color: #a855f7;       /* border-purple-500 */
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
  }

  /* Hover nhẹ (tùy chọn, rất xinh) */
  .input-soft:hover {
    border-color: #b794f4;
  }
    /* Nút tím đẹp – co giãn full, hover mượt */
  .btn-purple {
    flex: 1;                          /* flex-1 */
    padding-left: 1rem;               /* px-4 */
    padding-right: 1rem;
    padding-top: 0.5rem;              /* py-2 */
    padding-bottom: 0.5rem;
    background-color: #a855f7;        /* bg-purple-500 */
    color: white;                     /* text-white */
    border-radius: 0.5rem;            /* rounded-lg */
    font-weight: 600;
    text-align: center;
    transition: background-color 200ms ease-in-out;
    cursor: pointer;
  }

  .btn-purple:hover {
    background-color: #9333ea;        /* hover:bg-purple-600 */
  }

  /* Thêm bóng nhẹ (tùy chọn, rất xinh) */
  .btn-purple-shadow {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  .btn-purple-shadow:hover {
    box-shadow: 0 10px 15px -3px rgba(147, 51, 234, 0.3);
  }
    /* Nút xám nhẹ – dùng cho Hủy / Cancel / Thứ yếu */
  .btn-gray {
    flex: 1;                          /* flex-1 */
    padding-left: 1rem;               /* px-4 */
    padding-right: 1rem;
    padding-top: 0.5rem;              /* py-2 */
    padding-bottom: 0.5rem;
    background-color: #d1d5db;        /* bg-gray-300 */
    color: #374151;                   /* text-gray-700 */
    border-radius: 0.5rem;            /* rounded-lg */
    font-weight: 600;
    text-align: center;
    transition: background-color 200ms ease-in-out;
    cursor: pointer;
  }

  .btn-gray:hover {
    background-color: #9ca3af;        /* hover:bg-gray-400 */
  }

  /* Phiên bản có bóng nhẹ (tùy chọn – rất đẹp khi dùng chung với btn-purple) */
  .btn-gray-shadow {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  .btn-gray-shadow:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15);
  }
    /* Đường viền dưới mảnh, tím nhạt cực nhẹ – dùng phân cách section */
  .border-b-purple-100 {
    border-bottom: 1px solid #e9d5ff;   /* purple-100 */
  }

  /* Phiên bản đậm hơn một chút (nếu cần) */
  .border-b-purple-200 {
    border-bottom: 1px solid #cbb2fe;   /* purple-200 */
  }

  /* Phiên bản có hiệu ứng fade nhẹ (rất xinh khi dùng nhiều lần) */
  .divider-purple {
    border-bottom: 1px solid transparent;
    background-image: linear-gradient(to right, transparent, #e9d5ff 50%, transparent);
    background-size: 100% 1px;
    background-repeat: no-repeat;
    background-position: bottom;
  }
    /* Màu chữ xám trung bình – dùng cho mô tả, ghi chú, placeholder */
  .text-gray-600 {
    color: #52525b;
  }

  /* Các tông xám thường dùng kèm (tùy chọn thêm) */
  .text-gray-500 { color: #6b7280; }
  .text-gray-700 { color: #374151; }
  .text-gray-400 { color: #9ca3af; }
  .text-gray-800 { color: #1f2937; }

  /* Hover text nếu cần */
  .hover\\:text-gray-600:hover {
    color: #52525b;
  }

  /* Badge xanh dương nhẹ – thường dùng cho tag, level, trạng thái */
  .badge-blue {
    display: inline-block;
    padding-left: 0.75rem;      /* px-3 */
    padding-right: 0.75rem;
    padding-top: 0.25rem;       /* py-1 */
    padding-bottom: 0.25rem;
    background-color: #dbeafe;  /* bg-blue-100 */
    color: #1e40af;             /* text-blue-700 */
    border-radius: 9999px;      /* rounded-full */
    font-size: 0.875rem;        /* text-sm ≈ 14px */
    font-weight: 500;
    line-height: 1.25rem;
  }

  /* Phiên bản nhỏ hơn (nếu cần) */
  .badge-blue-xs {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-top: 0.125rem;
    padding-bottom: 0.125rem;
    font-size: 0.75rem;
  }

  /* Hover nhẹ (tùy chọn – rất xinh) */
  .badge-blue:hover {
    background-color: #bfdbfe;
  }

  /* Màu chữ cam nổi bật – chuẩn Tailwind orange-500 */
  .text-orange-500 {
    color: #f97316;
  }

  /* Các tông cam thường dùng kèm (tùy chọn thêm) */
  .text-orange-400 { color: #fb923c; }
  .text-orange-600 { color: #ea580c; }
  .text-orange-700 { color: #c2410c; }
  .text-orange-300 { color: #fdba74; }

  /* Hover nếu cần */
  .hover\\:text-orange-500:hover {
    color: #f97316;
  }
    /* Hồng đậm dễ thương – chuẩn Tailwind pink-600 */
  .text-pink-600 {
    color: #ec4899;
  }

  /* Các tông hồng thường dùng kèm */
  .text-pink-500 { color: #f43f5e; }
  .text-pink-700 { color: #db2777; }
  .text-pink-400 { color: #f472b6; }
  .text-pink-800 { color: #be185d; }
  .text-pink-300 { color: #f9a8d4; }

  /* Hover */
  .hover\\:text-pink-600:hover {
    color: #ec4899;
  }

    .cute-gradient-box {
    background: linear-gradient(to right, #faf5ff, #fdf2f8); /* purple-50 → pink-50 */
    padding: 1.25rem; /* p-5 */
    border-radius: 0.75rem; /* rounded-xl */
    border: 2px solid #f3e8ff; /* border-purple-100 */
  }
      .purple-gradient-box {
    background: linear-gradient(to bottom right, #f3e8ff, #e9d5ff); /* purple-100 → purple-200 */
    padding: 1rem; /* p-4 */
    border-radius: 0.75rem; /* rounded-xl */
    text-align: center;
  }

    .blue-gradient-box {
    background: linear-gradient(to bottom right, #dbeafe, #bfdbfe); /* blue-100 → blue-200 */
    padding: 1rem; /* p-4 */
    border-radius: 0.75rem; /* rounded-xl */
    text-align: center;
  }
          `}</style>
        </div>
      </div>
    </div>
  );
}
