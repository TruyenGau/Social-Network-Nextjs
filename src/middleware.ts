import { withAuth } from "next-auth/middleware";
// This function can be marked `async` if using `await` inside
export default withAuth({
  pages: {
    signIn: "auth/signin",
  },
});
export const config = { matcher: ["/playlist", "/track/upload"] };
