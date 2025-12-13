import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.user.role.name;

    // Nếu vào route /admin nhưng role không phải ADMIN → chặn
    if (req.nextUrl.pathname.startsWith("/admin") && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/403", req.url)); // hoặc chuyển về trang chủ
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/auth/signin",
    },
  }
);

// Áp dụng middleware cho route nào?
export const config = {
  matcher: [
    "/admin/:path*", // bảo vệ toàn bộ admin
    "/profile",
    "/community",
    "/",
  ],
};
