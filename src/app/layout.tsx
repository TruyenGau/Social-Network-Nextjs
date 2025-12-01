import AppFooter from "@/components/footer/app.footer";
import AppHeader from "@/components/header/app.header";

import ThemeRegistry from "@/components/theme-registry/theme.registry";
import NextAuthWrapper from "@/lib/next.auth.wrapper";
import NPprogressWrapper from "@/lib/npprogress.wrapper";
import { UserContextProvider } from "@/lib/track.wrapper";
import { ToastProvider } from "@/utils/toast";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "tiêu đề cho cả website nè",
  description: "truyền đẹop trai",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <NPprogressWrapper>
            <NextAuthWrapper>
              <ToastProvider>
                <UserContextProvider>{children}</UserContextProvider>
              </ToastProvider>
            </NextAuthWrapper>
          </NPprogressWrapper>
        </ThemeRegistry>
      </body>
    </html>
  );
}
