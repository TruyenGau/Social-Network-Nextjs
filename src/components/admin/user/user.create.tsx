"use client";

import { useEffect, useState } from "react";
import { Modal, Form, Input, Select, message, Row, Col } from "antd";
import { sendRequest } from "@/utils/api";

interface IProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  token: string;
  onSuccess: () => void;
}

export default function UserCreateModal({
  open,
  setOpen,
  token,
  onSuccess,
}: IProps) {
  const [form] = Form.useForm();
  const [roles, setRoles] = useState<any[]>([]);

  // ================================
  // FETCH ROLES
  // ================================
  useEffect(() => {
    if (open) fetchRoles();
  }, [open]);

  const fetchRoles = async () => {
    const res = await sendRequest<IBackendRes<any>>({
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/roles`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      queryParams: { current: 1, pageSize: 100 },
    });

    setRoles(res?.data?.result || []);
  };

  // ================================
  // CREATE USER
  // ================================
  const handleSubmit = async () => {
    try {
      const values = form.getFieldsValue();

      const body = {
        name: values.name,
        email: values.email,
        password: values.password,
        age: Number(values.age),
        gender: values.gender,
        address: values.address,
        role: values.role, // Role lấy từ API
        phoneNumber: values.phoneNumber,
        school: values.school,
      };

      const res = await sendRequest<any>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users`,
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      if (res?.data) {
        message.success("Tạo user thành công!");
        form.resetFields();
        onSuccess();
        setOpen(false);
      }
    } catch (e) {
      message.error("Không thể tạo user!");
    }
  };

  return (
    <Modal
      title="Tạo mới User"
      open={open}
      onCancel={() => setOpen(false)}
      onOk={handleSubmit}
      okText="Tạo mới"
      cancelText="Hủy"
      width={950}
    >
      <Form form={form} layout="vertical">
        <Row gutter={[20, 5]}>
          <Col span={12}>
            <Form.Item
              label="* Email"
              name="email"
              rules={[{ required: true, message: "Nhập email!" }]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="* Password"
              name="password"
              rules={[{ required: true }]}
            >
              <Input.Password placeholder="Nhập password" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="* Tên hiển thị"
              name="name"
              rules={[{ required: true }]}
            >
              <Input placeholder="Nhập tên hiển thị" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="* Tuổi" name="age" rules={[{ required: true }]}>
              <Input placeholder="Nhập tuổi" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="* Giới Tính"
              name="gender"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Chọn giới tính"
                options={[
                  { value: "MALE", label: "Nam" },
                  { value: "FEMALE", label: "Nữ" },
                  { value: "OTHER", label: "Khác" },
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="* Vai trò"
              name="role"
              rules={[{ required: true, message: "Chọn vai trò!" }]}
            >
              <Select
                placeholder="Chọn vai trò"
                options={roles.map((r) => ({
                  value: r._id,
                  label: r.name,
                }))}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="* Thuộc Công Ty" name="school">
              <Input placeholder="Nhập công ty" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="* Địa chỉ" name="address">
              <Input placeholder="Nhập địa chỉ" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Số điện thoại" name="phoneNumber">
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
