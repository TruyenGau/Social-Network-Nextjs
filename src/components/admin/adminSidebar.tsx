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
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";

export default function AdminSidebar() {
  const router = useRouter();
  const path = usePathname();

  const menuItems = [
    { key: "/admin", label: "Dashboard", icon: <DashboardOutlined /> },
    { key: "/admin/user", label: "User", icon: <UserOutlined /> },
    { key: "/admin/post", label: "Post", icon: <SolutionOutlined /> },
    { key: "/admin/community", label: "Community", icon: <GroupOutlined /> },
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
