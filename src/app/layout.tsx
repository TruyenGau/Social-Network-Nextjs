import AppFooter from "@/components/footer/app.footer";
import AppHeader from "@/components/header/app.header";

import ThemeRegistry from "@/components/theme-registry/theme.registry";
import NextAuthWrapper from "@/lib/next.auth.wrapper";
import NPprogressWrapper from "@/lib/npprogress.wrapper";
import { UserContextProvider } from "@/lib/track.wrapper";
import { ToastProvider } from "@/utils/toast";
import type { Metadata } from "next";
import "antd/dist/reset.css";
import StyledComponentsRegistry from "@/components/theme-registry/antd-registry";
import "./globals.css";
import { ThemeModeProvider } from "@/lib/theme.mode.context";
export const metadata: Metadata = {
  title: "Social Network",
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
        <StyledComponentsRegistry>
          <ThemeModeProvider>
            <ThemeRegistry>
              <NPprogressWrapper>
                <NextAuthWrapper>
                  <ToastProvider>
                    <UserContextProvider>{children}</UserContextProvider>
                  </ToastProvider>
                </NextAuthWrapper>
              </NPprogressWrapper>
            </ThemeRegistry>
          </ThemeModeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
