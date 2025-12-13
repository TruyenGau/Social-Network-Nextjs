// app/(auth)/signup/page.tsx
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AuthSignUp } from "@/components/auth/auth.sigup";

import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Đăng ký tài khoản",
  description: "Tạo tài khoản để sử dụng hệ thống",
};

const SignUpPage = async () => {
  const session = await getServerSession(authOptions);
  if (session) redirect("/");

  return <AuthSignUp />;
};

export default SignUpPage;
