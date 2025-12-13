"use client";

import { Modal, Form, Input, Select, message } from "antd";
import { sendRequest } from "@/utils/api";
import { useEffect } from "react";

interface IProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  token: string;
  onSuccess: () => void;
  permission?: any; // 👈 nhận dữ liệu edit
}

export default function PermissionCreateModal({
  open,
  setOpen,
  token,
  onSuccess,
  permission,
}: IProps) {
  const [form] = Form.useForm();

  // ====== GÁN DỮ LIỆU KHI EDIT ======
  useEffect(() => {
    if (permission) {
      form.setFieldsValue({
        name: permission.name,
        apiPath: permission.apiPath,
        method: permission.method,
        module: permission.module,
      });
    } else {
      form.resetFields();
    }
  }, [permission, open]);

  const handleSubmit = async () => {
    const values = form.getFieldsValue();

    const body = {
      name: values.name,
      apiPath: values.apiPath,
      method: values.method,
      module: values.module,
    };

    let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/permissions`;
    let method: "POST" | "PATCH" = "POST";

    // Nếu đang edit → PATCH
    if (permission?._id) {
      url = `${url}/${permission._id}`;
      method = "PATCH";
    }

    const res = await sendRequest<any>({
      url,
      method,
      headers: { Authorization: `Bearer ${token}` },
      body,
    });

    if (res?.data) {
      message.success(
        permission ? "Cập nhật thành công!" : "Tạo mới thành công!"
      );
      onSuccess();
      setOpen(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      onOk={handleSubmit}
      title={permission ? "Cập nhật Permission" : "Tạo Permission"}
      okText={permission ? "Cập nhật" : "Tạo mới"}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="API Path" name="apiPath" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="Method" name="method" rules={[{ required: true }]}>
          <Select
            options={[
              { value: "GET", label: "GET" },
              { value: "POST", label: "POST" },
              { value: "PATCH", label: "PATCH" },
              { value: "DELETE", label: "DELETE" },
            ]}
          />
        </Form.Item>

        <Form.Item label="Module" name="module" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
