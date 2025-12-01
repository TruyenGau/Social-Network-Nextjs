import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AuthSignIn } from "@/components/auth/auth.signin";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title: "Đăng nhập tài khoản",
  description: "Hãy đăng nhập để sử dụng ",
};
const SignInPage = async () => {
  const session = await getServerSession(authOptions);
  if (session) {
    //redirect to home
    redirect("/");
  }
  return (
    <div>
      <AuthSignIn></AuthSignIn>
    </div>
  );
};

export default SignInPage;
