"use client";

import AdminHeader from "@/components/admin/adminHeader";
import AdminSidebar from "@/components/admin/adminSidebar";
import { Layout } from "antd";

const { Sider, Content } = Layout;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={230}>
        <AdminSidebar />
      </Sider>

      <Layout>
        <AdminHeader />

        <Content style={{ padding: 20, background: "#f5f5f5" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
