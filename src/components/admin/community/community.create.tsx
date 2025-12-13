"use client";

import { Modal, Form, Input, message } from "antd";
import { sendRequest } from "@/utils/api";

interface IProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  token: string;
  onSuccess: () => void;
}

export default function CommunityCreateModal({
  open,
  setOpen,
  token,
  onSuccess,
}: IProps) {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = form.getFieldsValue();

      const body = {
        name: values.name,
        description: values.description,
      };

      const res = await sendRequest<any>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/communities`,
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      if (res?.data) {
        message.success("Tạo Community thành công!");
        form.resetFields();
        onSuccess();
        setOpen(false);
      }
    } catch (e) {
      console.log(e);
      message.error("Không thể tạo community!");
    }
  };

  return (
    <Modal
      title="Tạo mới Community"
      open={open}
      onCancel={() => setOpen(false)}
      onOk={handleSubmit}
      okText="Tạo mới"
      cancelText="Hủy"
      width={600}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label="* Tên Community"
          name="name"
          rules={[{ required: true, message: "Tên không được để trống!" }]}
        >
          <Input placeholder="Nhập tên community..." />
        </Form.Item>

        <Form.Item
          label="* Mô tả"
          name="description"
          rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
        >
          <Input.TextArea rows={4} placeholder="Nhập mô tả community..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
