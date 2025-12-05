import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag");
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({
      revalidated: false,
      now: Date.now(),
      message: "Missing secret to revalidate",
    });
  }

  if (!tag) {
    return NextResponse.json({
      revalidated: false,
      now: Date.now(),
      message: "Missing tag to revalidate",
    });
  }

  revalidateTag(tag);
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
