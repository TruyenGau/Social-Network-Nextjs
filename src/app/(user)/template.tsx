import UserLayout from "../userLayout/layout";

export default function Template({ children }: { children: React.ReactNode }) {
  return <UserLayout>{children}</UserLayout>;
}
