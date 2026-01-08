import { useEffect, useState } from "react";
import api from "../../api/auth";
import toast from "react-hot-toast";

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
  password?: string;
  status?: "ACTIVE" | "INACTIVE" | "BANNED";
}

interface DashboardAdminProps {
  onNavigate: (page: string) => void;
}

export function DashboardAdmin({ onNavigate }: DashboardAdminProps) {
  const PLACEHOLDER_AVATAR =
    "https://ui-avatars.com/api/?background=4f46e5&color=fff&name=";
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit" | "">("");
  const [formData, setFormData] = useState<Partial<User>>({
    username: "",
    email: "",
    fullName: "",
    role: "USER",
    level: 1,
    points: 0,
    streak: 0,
    status: "ACTIVE",
    password: "123456",
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "USER" | "ADMIN">("ALL");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE" | "BANNED"
  >("ALL");
  const [sortBy, setSortBy] = useState<
    "level" | "points" | "joinDate" | "username"
  >("joinDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Lấy danh sách user
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      let userList: User[] = res.data?.data || res.data || [];

      userList = userList.map((user: any) => ({
        ...user,
        status: user.status || "ACTIVE", // ← Default ACTIVE
      }));

      setUsers(userList);
      if (userList.length > 0 && !selectedUser) {
        setSelectedUser(userList[0]);
      }
    } catch (err: any) {
      console.error("Lỗi tải user:", err);
      toast.error("Không tải được danh sách user 😿");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý tạo user mới
  const handleCreateUser = async () => {
    if (!formData.username?.trim() || !formData.email?.trim()) {
      alert("Vui lòng nhập tên đăng nhập và email!");
      return;
    }

    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        fullName: formData.fullName?.trim() || null,
        avatarUrl: formData.avatarUrl?.trim() || null,
        password: formData.password?.trim() || "123456",
        role: formData.role || "USER",
        level: formData.level || 1,
        points: formData.points || 0,
        streak: formData.streak || 0,
        status: formData.status || "ACTIVE",
      };

      await api.post("/admin/users", payload);
      alert("🎉 Tạo user thành công!");
      handleCloseModal();
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Tạo user thất bại";
      alert(`❌ ${msg}`);
    }
  };

  // Xử lý cập nhật user
  const handleUpdateUser = async () => {
    if (!formData.id || !formData.username?.trim() || !formData.email?.trim()) {
      alert("Thông tin không hợp lệ!");
      return;
    }

    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        fullName: formData.fullName?.trim() || null,
        avatarUrl: formData.avatarUrl?.trim() || null,
        role: formData.role || "USER",
        level: formData.level || 1,
        points: formData.points || 0,
        streak: formData.streak || 0,
        status: formData.status || "ACTIVE", // ← Gửi status rõ ràng
      };

      await api.put(`/admin/users/${formData.id}`, payload);
      toast.success("✅ Cập nhật thành công!");
      handleCloseModal();

      // FIX: Refresh list ngay để hiển thị status mới
      await fetchUsers();
    } catch (err: any) {
      toast.error(`❌ ${err.response?.data?.message || "Cập nhật thất bại"}`);
    }
  };

  // Xử lý xóa user
  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa user này?")) return;

    try {
      await api.delete(`/admin/users/${id}`);
      alert("🗑️ Xóa user thành công!");
      fetchUsers();
      if (selectedUser?.id === id) {
        setSelectedUser(users[0] || null);
      }
    } catch (err: any) {
      alert(`❌ ${err.response?.data?.message || "Xóa thất bại"}`);
    }
  };

  // Mở modal tạo/ chỉnh sửa
  const openModal = (type: "create" | "edit", user?: User) => {
    setModalType(type);
    if (type === "edit" && user) {
      setFormData({
        ...user,
        password: "", // Không hiển thị password khi edit
      });
    } else {
      setFormData({
        username: "",
        email: "",
        fullName: "",
        role: "USER",
        level: 1,
        points: 0,
        streak: 0,
        status: "ACTIVE",
        password: "123456",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType("");
    setFormData({
      username: "",
      email: "",
      fullName: "",
      role: "USER",
      level: 1,
      points: 0,
      streak: 0,
      status: "ACTIVE",
      password: "123456",
    });
  };
  const getStatusDisplay = (status: string = "ACTIVE") => {
    switch (status) {
      case "ACTIVE":
        return {
          text: "Đang hoạt động",
          className: "badge-success",
        };
      case "INACTIVE":
        return {
          text: "Không hoạt động",
          className: "badge-inactive",
        };
      case "BANNED":
        return { text: "Đã khóa", className: "badge-danger" };
      default:
        return {
          text: "Đang hoạt động",
          className: "badge-success",
        };
    }
  };
  // Xử lý filter và sort
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "ALL" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case "level":
        aValue = a.level;
        bValue = b.level;
        break;
      case "points":
        aValue = a.points;
        bValue = b.points;
        break;
      case "joinDate":
        aValue = new Date(a.joinDate).getTime();
        bValue = new Date(b.joinDate).getTime();
        break;
      case "username":
        aValue = a.username.toLowerCase();
        bValue = b.username.toLowerCase();
        break;
      default:
        return 0;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Phân trang
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset form khi chuyển trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleBack = () => {
    onNavigate("landing");
  };

  if (loading) {
    return (
      <div className="main-layout">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="text-indigo-600 text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="header-container">
          <div>
            <h1 className="section-title">Admin Dashboard 👑</h1>
            <p className="text-gray-600 mt-1">Quản lý người dùng hệ thống</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => openModal("create")}
              className="success-button"
            >
              <span className="text-lg">+</span> Thêm User
            </button>
            <button
              onClick={() => onNavigate("historytracking")}
              className="btn-primary-gradient"
            >
              📊 <span className="truncate">Lịch sử hoạt động</span>
            </button>

            <button onClick={handleBack} className="danger-button">
              Quay lại
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="responsive-grid">
          <div className="content-card">
            <div className="sub-title">{users.length}</div>
            <div className="helper-text">Tổng số user</div>
          </div>
          <div className="content-card">
            <div className="sub-title">
              {users.filter((u) => u.role === "ADMIN").length}
            </div>
            <div className="helper-text">Admin</div>
          </div>
          <div className="content-card">
            <div className="sub-title">
              {users.filter((u) => u.status === "ACTIVE").length}
            </div>
            <div className="helper-text">Đang hoạt động</div>
          </div>
          <div className="content-card">
            <div className="sub-title">
              {users
                .reduce((sum, user) => sum + user.points, 0)
                .toLocaleString()}
            </div>
            <div className="helper-text">Tổng điểm</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="premium-card">
          {/* Filters and Search */}
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm user..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <div className="absolute-icon">🔍</div>
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="input-standard"
                >
                  <option value="ALL">Tất cả vai trò</option>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="input-standard"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Không hoạt động</option>
                  <option value="BANNED">Đã khóa</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="input-standard"
                >
                  <option value="joinDate">Mới nhất</option>
                  <option value="username">Tên A-Z</option>
                  <option value="level">Level cao nhất</option>
                  <option value="points">Nhiều điểm nhất</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="secondary-item"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header-cell">User</th>
                  <th className="table-header-cell">Thông tin</th>
                  <th className="table-header-cell">Stats</th>
                  <th className="table-header-cell">Trạng thái</th>
                  <th className="table-header-cell">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedUsers.map((user) => {
                  const statusDisplay = getStatusDisplay(user.status);

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-indigo-50 transition-colors cursor-pointer ${
                        selectedUser?.id === user.id ? "bg-indigo-50" : ""
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              user.avatarUrl ||
                              `${PLACEHOLDER_AVATAR}${user.username}`
                            }
                            alt={user.username}
                            className="avatar-style"
                            onError={(e) => {
                              e.currentTarget.src = `${PLACEHOLDER_AVATAR}${user.username}`;
                            }}
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.username}
                            </div>
                            {user.fullName && (
                              <div className="text-sm text-gray-500">
                                {user.fullName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="text-gray-900">{user.email}</div>
                          <div className="text-gray-500 capitalize">
                            {user.role.toLowerCase()}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="font-bold text-indigo-600">
                              {user.level}
                            </div>
                            <div className="text-xs text-gray-500">Level</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-purple-600">
                              {user.points}
                            </div>
                            <div className="text-xs text-gray-500">Điểm</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-orange-600">
                              {user.streak || 0}
                            </div>
                            <div className="text-xs text-gray-500">Streak</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`badge-base ${statusDisplay.className}`}
                        >
                          {statusDisplay.text}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(user.joinDate).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal("edit", user);
                            }}
                            className="chip-button"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(user.id);
                            }}
                            className="chip-button"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="card-footer">
              <div className="text-sm text-gray-500">
                Hiển thị {startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, sortedUsers.length)} của{" "}
                {sortedUsers.length} user
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="step-button"
                >
                  ← Trước
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = idx + 1;
                  } else if (currentPage <= 3) {
                    pageNum = idx + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + idx;
                  } else {
                    pageNum = currentPage - 2 + idx;
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handlePageChange(pageNum)}
                      className={`input-mini ${
                        currentPage === pageNum
                          ? "btn-primary"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn-nav"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Detail Sidebar */}
        {selectedUser && (
          <div className="main-card">
            <h2 className="section-title">Chi tiết User</h2>
            <div className="responsive-grid">
              <div>
                <div className="flex-header">
                  <img
                    src={
                      selectedUser.avatarUrl ||
                      `${PLACEHOLDER_AVATAR}${selectedUser.username}`
                    }
                    alt={selectedUser.username}
                    className="profile-avatar-lg"
                    onError={(e) => {
                      e.currentTarget.src = `${PLACEHOLDER_AVATAR}${selectedUser.username}`;
                    }}
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedUser.username}
                    </h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    {selectedUser.fullName && (
                      <p className="text-gray-700">{selectedUser.fullName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Role</label>
                    <div className="font-medium text-gray-900 capitalize">
                      {selectedUser.role.toLowerCase()}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Trạng thái</label>
                    <div className="font-medium">
                      <span
                        className={`tag-flat ${
                          getStatusDisplay(selectedUser.status).className
                        }`}
                      >
                        {getStatusDisplay(selectedUser.status).text}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">
                      Ngày tham gia
                    </label>
                    <div className="font-medium text-gray-900">
                      {new Date(selectedUser.joinDate).toLocaleDateString(
                        "vi-VN",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Thống kê học tập
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Level</span>
                      <span className="text-sm font-medium text-indigo-600">
                        Cấp {selectedUser.level}
                      </span>
                    </div>
                    <div className="progress-container">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.min(selectedUser.level * 10, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Điểm</span>
                      <span className="text-sm font-medium text-purple-600">
                        {selectedUser.points.toLocaleString()} điểm
                      </span>
                    </div>
                    <div className="progress-container">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.min(
                            (selectedUser.points / 10000) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Streak</span>
                      <span className="text-sm font-medium text-orange-600">
                        {selectedUser.streak || 0} ngày
                      </span>
                    </div>
                    <div className="progress-container">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.min(
                            ((selectedUser.streak || 0) / 30) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t">
                  <button
                    onClick={() => openModal("edit", selectedUser)}
                    className="btn-gradient"
                  >
                    Chỉnh sửa User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Create/Edit */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content-box">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {modalType === "create" ? "Tạo User Mới" : "Chỉnh sửa User"}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="content-grid-compact">
                  <div>
                    <label className="content-grid-compact">
                      Tên đăng nhập *
                    </label>
                    <input
                      type="text"
                      value={formData.username || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="input-smart"
                      placeholder="username"
                      required
                    />
                  </div>

                  <div>
                    <label className="content-grid-compact">Email *</label>
                    <input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="input-smart"
                      placeholder="email@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="content-grid-compact">Họ và tên</label>
                    <input
                      type="text"
                      value={formData.fullName || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="input-smart"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  {modalType === "create" && (
                    <div>
                      <label className="content-grid-compact">Mật khẩu</label>
                      <input
                        type="text"
                        value={formData.password || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="input-smart"
                        placeholder="Để trống = 123456"
                      />
                    </div>
                  )}

                  <div>
                    <label className="content-grid-compact">Avatar URL</label>
                    <input
                      type="text"
                      value={formData.avatarUrl || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, avatarUrl: e.target.value })
                      }
                      className="input-smart"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

                  <div>
                    <label className="content-grid-compact">Vai trò</label>
                    <select
                      value={formData.role || "USER"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value as "USER" | "ADMIN",
                        })
                      }
                      className="input-smart"
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="content-grid-compact">Trạng thái</label>
                    <select
                      value={formData.status || "ACTIVE"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as
                            | "ACTIVE"
                            | "INACTIVE"
                            | "BANNED",
                        })
                      }
                      className="input-smart"
                    >
                      <option value="ACTIVE">Đang hoạt động</option>
                      <option value="INACTIVE">Không hoạt động</option>
                      <option value="BANNED">Đã khóa</option>{" "}
                    </select>
                  </div>

                  <div>
                    <label className="content-grid-compact">Level</label>
                    <input
                      type="number"
                      value={formData.level || 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          level: parseInt(e.target.value) || 1,
                        })
                      }
                      className="input-smart"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="content-grid-compact">Điểm</label>
                    <input
                      type="number"
                      value={formData.points || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          points: parseInt(e.target.value) || 0,
                        })
                      }
                      className="input-smart"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={
                      modalType === "create"
                        ? handleCreateUser
                        : handleUpdateUser
                    }
                    className="btn-premium-flex"
                  >
                    {modalType === "create" ? "Tạo User" : "Cập nhật"}
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="btn-secondary-flex"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
      .badge-inactive {
  background-color: #f3f4f6; /* gray-100 */
  color: #1f2937; /* gray-800 */
  padding: 0.125rem 0.625rem; /* py-0.5 px-2.5 */
  border-radius: 9999px; /* rounded-full */
  font-size: 0.75rem; /* text-xs */
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}
      .badge-danger {
  background-color: #fee2e2; /* red-100 */
  color: #991b1b; /* red-800 */
  padding: 2px 10px;
  border-radius: 9999px; /* rounded-full */
  font-size: 12px; /* text-xs */
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}
      .badge-success {
  background-color: #dcfce7; /* green-100 */
  color: #166534; /* green-800 */
  padding-left: 0.625rem;
  padding-right: 0.625rem;
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
  border-radius: 9999px; /* rounded-full */
  font-size: 0.75rem; /* text-xs */
  font-weight: 500;
}
      .btn-primary-gradient {
  flex: 1 1 0%; /* flex-1 */
  padding: 0.5rem 0.5rem; /* px-2 py-2 */
  background: linear-gradient(to right, #9333ea, #4f46e5); /* purple-600 to indigo-600 */
  color: #ffffff;
  border-radius: 0.5rem; /* rounded-lg */
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem; /* gap-2 */
  font-size: 0.875rem; /* text-sm */
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-primary-gradient:hover {
  background: linear-gradient(to right, #7e22ce, #4338ca);
}
      .btn-secondary-flex {
  /* flex-1: Co giãn tương đương với nút chính để tạo sự cân bằng */
  flex: 1 1 0%;

  /* px-6 py-3: Kích thước bằng hệt nút chính để không lệch Layout */
  padding: 0.75rem 1.5rem;

  /* bg-gray-100 & text-gray-700: Tông màu trung tính, dịu mắt */
  background-color: #f3f4f6;
  color: #374151;
  
  /* rounded-lg & font-semibold */
  border-radius: 0.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;

  /* transition-all duration-300: Đồng bộ tốc độ phản hồi với nút chính */
  transition: all 0.3s ease;
}

.btn-secondary-flex:hover {
  /* hover:bg-gray-200 */
  background-color: #e5e7eb;
}

.btn-secondary-flex:active {
  transform: scale(0.98);
}
      .btn-premium-flex {
  /* flex-1: Tự động chiếm hết không gian còn lại trong flex container */
  flex: 1 1 0%;

  /* px-6 py-3: Kích thước nút lớn, tạo cảm giác quan trọng và dễ bấm */
  padding: 0.75rem 1.5rem;

  /* bg-gradient-to-r: Dải màu Indigo đậm sang Purple đậm */
  background: linear-gradient(to right, #4f46e5, #9333ea);
  color: #ffffff;
  
  /* rounded-lg & font-semibold & shadow-lg */
  border-radius: 0.5rem;
  font-weight: 600;
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);

  /* transition-all duration-300 */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
}

/* hover: Chuyển sang tông màu tối hơn (indigo-700 to purple-700) */
.btn-premium-flex:hover {
  background: linear-gradient(to right, #4338ca, #7e22ce);
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.4);
}
      .input-smart {
  /* Cơ bản: w-full px-4 py-2 border rounded-lg */
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db; /* gray-300 */
  border-radius: 0.5rem;
  
  /* Loại bỏ viền xanh mặc định của trình duyệt */
  outline: none;
  
  /* Hiệu ứng chuyển cảnh mượt mà */
  transition: all 0.2s ease-in-out;
}

/* Khi người dùng nhấn vào ô nhập liệu */
.input-smart:focus {
  /* focus:border-indigo-500 */
  border-color: #6366f1;

  /* focus:ring-2 focus:ring-indigo-200 */
  box-shadow: 0 0 0 4px #e0e7ff; 
}
      .content-grid-compact {
  display: grid;
  /* Mặc định 1 cột cho Mobile */
  grid-template-columns: repeat(1, minmax(0, 1fr));
  /* Khoảng cách giữa các ô là 1rem (16px) */
  gap: 1rem;
}

/* Từ màn hình Medium (768px) trở lên */
@media (min-width: 768px) {
  .content-grid-compact {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
      .modal-content-box {
  /* bg-white & rounded-2xl: Tạo khối trắng sạch sẽ, bo góc hiện đại */
  background-color: #ffffff;
  border-radius: 1rem;

  /* w-full max-w-2xl: Co giãn linh hoạt nhưng không rộng quá 672px */
  width: 100%;
  max-width: 42rem;

  /* max-h-[90vh]: Không bao giờ cao quá 90% chiều cao màn hình */
  max-height: 90vh;

  /* overflow-y-auto: Nếu nội dung quá dài, sẽ tự hiện thanh cuộn bên trong */
  overflow-y: auto;

  /* Đổ bóng sâu để tách biệt khỏi lớp nền mờ */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Tùy chỉnh thanh cuộn cho mượt mà (Chrome/Safari) */
.modal-content-box::-webkit-scrollbar {
  width: 6px;
}
.modal-content-box::-webkit-scrollbar-thumb {
  background-color: #e2e8f0; /* slate-200 */
  border-radius: 10px;
}
      .modal-overlay {
  /* fixed inset-0: Phủ kín toàn bộ màn hình, bất kể người dùng đang cuộn trang ở đâu */
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  /* bg-black bg-opacity-50: Tạo lớp màu tối trong suốt 50% */
  background-color: rgba(0, 0, 0, 0.5);

  /* flex items-center justify-center: Căn hộp thoại vào đúng tâm màn hình */
  display: flex;
  align-items: center;
  justify-content: center;

  /* p-4: Đảm bảo trên điện thoại nhỏ, hộp thoại không bị dính sát mép màn hình */
  padding: 1rem;

  /* z-50: Đảm bảo lớp này luôn nằm trên cùng của mọi thành phần khác */
  z-index: 50;

  /* Hiệu ứng kính mờ (Tùy chọn thêm để trông "xịn" hơn) */
  backdrop-filter: blur(4px);
}
      .btn-gradient {
  /* w-full px-4 py-2: Chiếm toàn bộ chiều rộng, đệm chuẩn */
  width: 100%;
  padding: 0.5rem 1rem;

  /* bg-gradient-to-r from-indigo-500 to-purple-600 */
  background: linear-gradient(to right, #6366f1, #9333ea);
  color: #ffffff;
  
  /* rounded-lg font-medium shadow-md */
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  
  /* Shadow-md: Tạo độ nổi cho nút */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  /* transition-all duration-300 */
  transition: all 0.3s ease;
}

/* Hover effect: Chuyển tông màu đậm hơn */
.btn-gradient:hover {
  background: linear-gradient(to right, #4f46e5, #7e22ce);
  box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
  transform: translateY(-1px); /* Nhích nhẹ lên tạo cảm giác tương tác */
}

.btn-gradient:active {
  transform: translateY(0);
  filter: brightness(0.9);
}
      .progress-bar-fill {
  /* bg-indigo-600 */
  background-color: #4f46e5;
  
  /* h-2: Khớp với độ cao của khung bao ngoài */
  height: 0.5rem;
  
  /* rounded-full: Đảm bảo đầu thanh tiến độ luôn bo tròn */
  border-radius: 9999px;

  /* transition-all duration-500: Chạy mất 0.5 giây khi thay đổi phần trăm */
  transition: all 500ms cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Đảm bảo thanh bắt đầu từ bên trái */
  width: 0%; 
}

  .tag-flat {
  /* inline-flex items-center: Căn chỉnh icon (nếu có) và chữ */
  display: inline-flex;
  align-items: center;

  /* px-2 py-0.5: Khoảng đệm hẹp, tạo dáng nhãn dẹt */
  padding: 0.125rem 0.5rem;

  /* rounded: Bo góc nhẹ (thường là 4px hoặc 0.25rem) */
  border-radius: 0.25rem;

  /* text-xs font-medium: Chữ siêu nhỏ (12px) nhưng rõ nét */
  font-size: 0.75rem;
  font-weight: 500;
  
  line-height: 1rem;
  white-space: nowrap;
}
      .profile-avatar-lg {
  /* w-20 h-20: 80px x 80px */
  width: 5rem;
  height: 5rem;

  /* border-4 border-white: Viền dày tạo hiệu ứng cắt lớp */
  border: 4px solid #ffffff;
  border-radius: 9999px;

  /* object-cover: Đảm bảo ảnh mèo/người không bị méo */
  object-fit: cover;

  /* shadow-lg: Bóng đổ để tạo cảm giác ảnh nổi hẳn lên khỏi cover background */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  
  background-color: #f3f4f6; /* Màu nền chờ khi ảnh chưa tải xong */
}
      .flex-header {
  /* flex items-center: Sắp xếp các phần tử nằm ngang và căn giữa theo chiều dọc */
  display: flex;
  align-items: center;

  /* gap-4: Khoảng cách giữa ảnh, chữ và icon là 16px */
  gap: 1rem;

  /* mb-6: Khoảng cách với nội dung phía dưới là 24px */
  margin-bottom: 1.5rem;
}
      .responsive-grid {
  display: grid;
  /* gap-6: Khoảng cách giữa các ô là 24px */
  gap: 1.5rem;
  
  /* Mặc định cho Mobile (grid-cols-1): 1 cột duy nhất */
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

/* md:grid-cols-2: Khi màn hình rộng từ 768px trở lên (Tablet/PC) */
@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
      .main-card {
  /* mt-6: Tạo khoảng cách với phần tử phía trên */
  margin-top: 1.5rem;

  /* bg-white & rounded-2xl (16px) */
  background-color: #ffffff;
  border-radius: 1rem;

  /* p-6: Khoảng đệm nội dung rộng rãi (24px) */
  padding: 1.5rem;

  /* shadow-xl: Đổ bóng sâu, đa tầng chuyên nghiệp */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
      .btn-nav {
  /* px-3 py-1 border rounded-lg */
  padding: 0.25rem 0.75rem;
  border: 1px solid #d1d5db; /* gray-300 */
  border-radius: 0.5rem;
  
  /* Cấu hình mặc định */
  background-color: #ffffff;
  color: #374151; /* gray-700 */
  font-size: 0.875rem; /* text-sm */
  cursor: pointer;
  transition: all 0.2s ease;
}

/* hover:bg-gray-50 */
.btn-nav:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #9ca3af; /* gray-400 */
}

/* disabled:opacity-50 disabled:cursor-not-allowed */
.btn-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  /* Giữ nguyên màu nền để tránh bị lẫn với nền trang */
  background-color: #f3f4f6;
}
      .btn-primary {
  /* bg-indigo-600 */
  background-color: #4f46e5;
  
  /* text-white */
  color: #ffffff;
  
  /* border-indigo-600 */
  border: 1px solid #4f46e5;

  /* Cấu hình cơ bản để nút trông xịn hơn */
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hiệu ứng khi di chuột (Hover) */
.btn-primary:hover {
  background-color: #4338ca; /* indigo-700 */
  border-color: #4338ca;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Hiệu ứng khi nhấn (Active) */
.btn-primary:active {
  transform: scale(0.96);
}
      .input-mini {
  /* w-10: Chiều rộng cố định 40px */
  width: 2.5rem;
  
  /* px-3 py-1: Padding cực hẹp để chữ nằm gọn ở giữa */
  padding: 0.25rem 0.75rem;
  
  /* border rounded-lg */
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  
  /* Căn giữa chữ để trông chuyên nghiệp hơn */
  text-align: center;
  
  /* Loại bỏ mũi tên tăng giảm mặc định của trình duyệt cho gọn */
  appearance: none;
  -moz-appearance: textfield;
}

.input-mini::-webkit-inner-spin-button,
.input-mini::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
      .step-button {
  /* Kích thước & Hình dáng */
  padding: 0.25rem 0.75rem; /* px-3 py-1 */
  border: 1px solid #d1d5db;  /* border-gray-300 */
  border-radius: 0.5rem;      /* rounded-lg */
  
  /* Cấu hình cơ bản */
  background-color: #ffffff;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

/* hover:bg-gray-50 */
.step-button:hover:not(:disabled) {
  background-color: #f9fafb;
}

/* disabled:opacity-50 disabled:cursor-not-allowed */
.step-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f3f4f6; /* Thêm nền xám nhạt để rõ ràng hơn */
}
      .progress-container {
  /* w-full: Chiếm toàn bộ chiều rộng thẻ cha */
  width: 100%;

  /* bg-gray-200: Màu nền xám nhạt trung tính */
  background-color: #e5e7eb;

  /* rounded-full: Bo tròn hai đầu cực đại (pill shape) */
  border-radius: 9999px;

  /* h-2: Độ cao mảnh mai (8px) */
  height: 0.5rem;

  /* Đảm bảo phần tiến độ bên trong không tràn ra ngoài */
  overflow: hidden;
}
      .card-footer {
  /* p-4: Khoảng cách đệm chuẩn 16px */
  padding: 1rem;

  /* border-t: Đường kẻ mảnh phía trên để tách biệt với nội dung */
  border-top: 1px solid #e5e7eb; /* gray-200 */

  /* flex justify-between items-center */
  display: flex;
  justify-content: space-between; /* Đẩy 2 nhóm phần tử về 2 phía đối diện */
  align-items: center;            /* Căn giữa các phần tử theo chiều dọc */
  
  /* Đảm bảo nền khớp với thân thẻ */
  background-color: transparent;
}
      .chip-button {
  /* px-3 py-1 text-sm: Kích thước nhỏ gọn, dẹt */
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;

  /* bg-blue-50 text-blue-600 */
  background-color: #eff6ff;
  color: #2563eb;
  
  /* rounded-lg font-medium */
  border-radius: 0.5rem;
  font-weight: 500;
  
  /* Loại bỏ viền mặc định và tạo transition */
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease-in-out;
}

/* hover:bg-blue-100 */
.chip-button:hover {
  background-color: #dbeafe;
  color: #1d4ed8; /* blue-700: Tăng độ đậm chữ nhẹ khi hover */
}

/* Trạng thái chủ động (Active) */
.chip-button:active {
  transform: scale(0.95);
}
      .badge-base {
  /* inline-flex items-center: Căn chỉnh icon và chữ trên một hàng */
  display: inline-flex;
  align-items: center;

  /* px-2.5 py-0.5: Tỉ lệ vàng giúp nhãn trông dẹt và hiện đại */
  padding: 0.125rem 0.625rem;

  /* rounded-full: Tạo hình viên thuốc (Pill shape) */
  border-radius: 9999px;

  /* text-xs font-medium: Chữ nhỏ nhưng đậm nét để dễ đọc */
  font-size: 0.75rem;
  font-weight: 500;
  
  /* Đảm bảo nhãn không bị vỡ dòng */
  white-space: nowrap;
}
      .avatar-style {
  /* w-10 h-10: Kích thước 40px x 40px */
  width: 2.5rem;
  height: 2.5rem;

  /* rounded-full: Tạo hình tròn hoàn hảo */
  border-radius: 9999px;

  /* border-2 border-indigo-100: Viền mỏng màu xanh nhạt */
  border: 2px solid #e0e7ff;

  /* object-cover: Giữ tỉ lệ ảnh, cắt phần thừa thay vì nén ảnh */
  object-fit: cover;

  /* Đảm bảo hình ảnh không bị méo trong flexbox */
  flex-shrink: 0;
}
      .table-header-cell {
  /* p-4: Khoảng cách rộng rãi (16px) */
  padding: 1rem;

  /* text-left: Căn lề trái theo tiêu chuẩn đọc dữ liệu */
  text-align: left;

  /* text-sm: Chữ nhỏ tinh tế (14px) */
  font-size: 0.875rem;
  line-height: 1.25rem;

  /* font-semibold: Độ đậm vừa phải (600) */
  font-weight: 600;

  /* text-gray-700: Màu xám đậm chuyên nghiệp */
  color: #374151;

  /* Chống nhòe chữ trên màn hình độ phân giải thấp */
  -webkit-font-smoothing: antialiased;
}
      .secondary-item {
  /* px-3 py-2: Kích thước tiêu chuẩn gọn gàng */
  padding: 0.5rem 0.75rem;
  
  /* border border-gray-300 rounded-lg */
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  
  /* Các thuộc tính cơ bản */
  background-color: #ffffff;
  color: #374151; /* gray-700 */
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  /* transition: Chuyển màu mượt mà */
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

/* hover:bg-gray-50 */
.secondary-item:hover {
  background-color: #f9fafb;
  border-color: #9ca3af; /* gray-400 - làm đậm viền nhẹ khi hover */
}

/* Active: Nhấn xuống tạo cảm giác vật lý */
.secondary-item:active {
  background-color: #f3f4f6;
  transform: scale(0.98);
}
      .input-standard {
  /* px-3 py-2 */
  padding: 0.5rem 0.75rem;
  
  /* border border-gray-300 rounded-lg outline-none */
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  
  /* Thuộc tính cơ bản */
  background-color: #ffffff;
  width: 100%;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 */
.input-standard:focus {
  border-color: #6366f1;
  /* Tạo quầng sáng mềm mại quanh ô nhập liệu */
  box-shadow: 0 0 0 2px #e0e7ff; 
}
      .absolute-icon {
  /* absolute */
  position: absolute;

  /* left-3 (12px) */
  left: 0.75rem;

  /* top-2.5 (10px) */
  top: 0.625rem;

  /* text-gray-400 */
  color: #9ca3af;

  /* Đảm bảo icon không chặn thao tác click vào ô input bên dưới */
  pointer-events: none;
  
  /* Căn chỉnh icon vào giữa dòng nếu chiều cao input thay đổi */
  display: flex;
  align-items: center;
}
      .search-input {
  /* w-full px-4 py-2 pl-10 */
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem; /* pl-10 = 2.5rem để chừa chỗ cho icon */
  
  /* border border-gray-300 rounded-lg outline-none */
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  
  /* transition */
  transition: all 0.2s ease-in-out;
  background-color: #ffffff;
}

/* focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 */
.search-input:focus {
  border-color: #6366f1;
  /* Hiệu ứng Ring (đổ bóng bao quanh) */
  box-shadow: 0 0 0 2px #e0e7ff; 
}
      .premium-card {
  /* bg-white */
  background-color: #ffffff;
  
  /* rounded-2xl (16px) */
  border-radius: 1rem;
  
  /* shadow-xl: Đổ bóng đa lớp để tạo độ sâu chân thực */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  /* overflow-hidden: Cắt mọi nội dung tràn ra ngoài border-radius */
  overflow: hidden;

  /* Giúp thẻ mượt mà hơn khi hiển thị trên các trình duyệt khác nhau */
  isolation: isolate;
}
      .helper-text {
  /* text-sm (14px) */
  font-size: 0.875rem;
  line-height: 1.25rem;

  /* text-gray-500: Màu xám trung tính, giảm sự chú ý */
  color: #6b7280;

  /* Giảm độ nặng để trông thanh thoát hơn */
  font-weight: 400;
  
  /* Chống nhòe chữ trên màn hình độ phân giải thấp */
  -webkit-font-smoothing: antialiased;
}
      .sub-title {
  /* text-2xl (24px) */
  font-size: 1.5rem;
  line-height: 2rem;
  
  /* font-bold (700) */
  font-weight: 700;
  
  /* text-indigo-600 */
  color: #4f46e5;
  
  /* Khoảng cách chữ giúp dễ đọc hơn ở kích thước trung bình */
  letter-spacing: -0.01em;
}
      .content-card {
  /* bg-white */
  background-color: #ffffff;
  
  /* rounded-xl (12px) */
  border-radius: 0.75rem;
  
  /* p-4 (16px) */
  padding: 1rem;
  
  /* shadow-md: Đổ bóng vừa phải để tách biệt với nền slate-50 */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  /* Thêm viền siêu mảnh để thẻ sắc nét hơn trên nền sáng */
  border: 1px solid rgba(226, 232, 240, 0.8); /* slate-200 */
}
      .section-title {
  /* text-3xl (30px) trên Mobile -> md:text-4xl (36px) trên Desktop */
  font-size: 1.875rem;
  line-height: 2.25rem;
  
  /* font-bold (700) */
  font-weight: 700;
  
  /* text-indigo-800: Tông màu chuyên nghiệp, độ tương phản cao */
  color: #3730a3;
  
  /* Cải thiện hiển thị nét chữ */
  letter-spacing: -0.025em;
  -webkit-font-smoothing: antialiased;
}

@media (min-width: 768px) {
  .section-title {
    font-size: 2.25rem; /* md:text-4xl */
  }
}
      .responsive-grid {
  /* grid mb-6 */
  display: grid;
  margin-bottom: 1.5rem; /* 24px */
  
  /* grid-cols-1: Mặc định 1 cột trên Mobile */
  grid-template-columns: repeat(1, minmax(0, 1fr));
  
  /* gap-4: Khoảng cách đều giữa các thẻ */
  gap: 1rem; 
}

/* md:grid-cols-4: 4 cột trên màn hình Tablet/Desktop */
@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
      .danger-button {
  /* Layout & Spacing */
  display: inline-flex;         /* inline-flex */
  align-items: center;
  padding: 0.5rem 1rem;         /* py-2 px-4 */
  
  /* Typography */
  color: #ffffff;               /* text-white */
  font-weight: 500;             /* font-medium */
  text-align: center;
  
  /* Shape & Style */
  border-radius: 0.5rem;        /* rounded-lg (8px) */
  border: none;
  cursor: pointer;
  
  /* bg-gradient-to-r from-red-500 to-rose-600 */
  background: linear-gradient(to right, #ef4444, #e11d48);
  
  /* shadow-md */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  
  /* transition-all duration-300 */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover: from-red-600 to-rose-700 */
.danger-button:hover {
  background: linear-gradient(to right, #dc2626, #be123c);
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(225, 29, 72, 0.2); /* Đổ bóng có màu Rose nhẹ */
}

/* Active: Khi nhấn vào */
.danger-button:active {
  transform: scale(0.98);
}
      .success-button {
  /* Layout & Spacing */
  display: flex;                /* flex */
  align-items: center;          /* items-center */
  gap: 0.5rem;                  /* gap-2 */
  padding: 0.5rem 1rem;         /* py-2 px-4 */
  
  /* Typography */
  color: #ffffff;               /* text-white */
  font-weight: 500;             /* font-medium */
  
  /* Shape & Style */
  border-radius: 0.5rem;        /* rounded-lg (8px) */
  border: none;
  cursor: pointer;
  
  /* bg-gradient-to-r from-green-500 to-emerald-600 */
  background: linear-gradient(to right, #22c55e, #059669);
  
  /* shadow-md */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  
  /* transition-all duration-300 */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover: from-green-600 to-emerald-700 */
.success-button:hover {
  background: linear-gradient(to right, #16a34a, #047857);
  transform: translateY(-1px); /* Nhấc nhẹ lên khi hover */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Active: Nhấn xuống */
.success-button:active {
  transform: translateY(0);
}
      .header-container {
  /* mb-6: Tạo khoảng cách với nội dung phía dưới */
  margin-bottom: 1.5rem; /* 24px */

  /* flex flex-col: Mặc định xếp dọc trên Mobile */
  display: flex;
  flex-direction: column;
  
  /* items-start: Căn lề trái cho Mobile */
  align-items: flex-start;
  
  /* gap-4: Khoảng cách giữa các phần tử khi bị nhảy dòng */
  gap: 1rem; 
}

/* md: Chuyển sang hàng ngang cho Tablet/Desktop */
@media (min-width: 768px) {
  .header-container {
    flex-direction: row;       /* md:flex-row */
    justify-content: space-between; /* md:justify-between */
    align-items: center;       /* md:items-center */
  }
}
      .app-container {
  /* min-h-screen: Phủ kín màn hình */
  min-height: 100vh;
  
  /* bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 */
  background: linear-gradient(
    135deg, 
    #f8fafc 0%,   /* slate-50 */
    #eff6ff 50%,  /* blue-50 */
    #eef2ff 100%  /* indigo-50 */
  );
  
  /* p-4 md:p-6: Padding linh hoạt */
  padding: 1rem;
}

@media (min-width: 768px) {
  .app-container {
    padding: 1.5rem; /* md:p-6 */
  }
}
      .loading-spinner {
  /* w-16 h-16 */
  width: 4rem;
  height: 4rem;
  
  /* border-4 border-indigo-200 */
  border: 4px solid #e0e7ff; 
  
  /* border-t-indigo-600 (Phần đỉnh xoay màu đậm) */
  border-top-color: #4f46e5;
  
  /* rounded-full */
  border-radius: 50%;
  
  /* animate-spin */
  animation: spin 1s linear infinite;
  
  /* mx-auto mb-4 */
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 1rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
      .main-layout {
  /* min-h-screen */
  min-height: 100vh;
  
  /* flex items-center justify-center */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* bg-gradient-to-br from-slate-50 to-indigo-50 */
  background: linear-gradient(135deg, #f8fafc, #eef2ff);
  
  /* Thêm một chút nhiễu hạt (grainy texture) để làm nền trông cao cấp hơn */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  background-blend-mode: overlay;
  opacity: 0.95;

  padding: 2rem;
}
      `}</style>
    </div>
  );
}
