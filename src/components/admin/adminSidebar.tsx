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
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";

export default function AdminSidebar() {
  const router = useRouter();
  const path = usePathname();

  const menuItems = [
    { key: "/admin", label: "Dashboard", icon: <DashboardOutlined /> },
    { key: "/admin/company", label: "Company", icon: <ApartmentOutlined /> },
    { key: "/admin/user", label: "User", icon: <UserOutlined /> },
    { key: "/admin/job", label: "Job", icon: <SolutionOutlined /> },
    { key: "/admin/resume", label: "Resume", icon: <FileOutlined /> },
    { key: "/admin/permission", label: "Permission", icon: <SafetyOutlined /> },
    { key: "/admin/role", label: "Role", icon: <TeamOutlined /> },
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
