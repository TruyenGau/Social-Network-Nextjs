import AdminLayout from "../adminLayout/layout";
import UserLayout from "../userLayout/layout";

export default function Template({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
