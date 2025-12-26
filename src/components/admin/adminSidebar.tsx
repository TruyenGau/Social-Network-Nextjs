"use client";

import { Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  FileOutlined,
  ApartmentOutlined,
  SafetyOutlined,
  SolutionOutlined,
  GroupOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { ReportOffOutlined } from "@mui/icons-material";

export default function AdminSidebar() {
  const router = useRouter();
  const path = usePathname();

  const menuItems = [
    { key: "/admin", label: "Trang Chủ", icon: <DashboardOutlined /> },
    { key: "/admin/user", label: "Người Dùng", icon: <UserOutlined /> },
    { key: "/admin/post", label: "Post", icon: <SolutionOutlined /> },
    { key: "/admin/community", label: "Nhóm", icon: <GroupOutlined /> },
    { key: "/admin/permission", label: "Permission", icon: <SafetyOutlined /> },
    { key: "/admin/role", label: "Role", icon: <TeamOutlined /> },
    { key: "/admin/report", label: "Report", icon: <ReportOffOutlined /> },
    { key: "/admin/spam", label: "Spam", icon: <StopOutlined /> },
    { key: "/admin/pending", label: "Pending", icon: <StopOutlined /> },
  ];

  return (
    <Menu
      theme="light"
      mode="inline"
      selectedKeys={[path]}
      onClick={(item) => router.push(item.key)}
      items={menuItems}
      style={{ height: "100%", paddingTop: 20 }}
    />
  );
}
