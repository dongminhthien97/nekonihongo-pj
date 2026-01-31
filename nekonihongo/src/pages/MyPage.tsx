import { useAuth } from "../context/AuthContext";
import { MyPageUser } from "./user/MyPageUser";
import { DashboardAdmin } from "./admin/DashboardAdmin";

interface MyPageProps {
  onNavigate: (page: string) => void;
}

export default function MyPage({ onNavigate }: MyPageProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  // Route based on role
  if (user.role === "admin") {
    return <DashboardAdmin onNavigate={onNavigate} />;
  }

  return <MyPageUser onNavigate={onNavigate} />;
}
