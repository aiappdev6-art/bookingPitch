import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { signUploadParams } from "@/lib/cloudinary";

export async function POST() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ ok: false, error: "NOT_CONFIGURED" }, { status: 503 });
  }
  return NextResponse.json({ ok: true, ...signUploadParams() });
}
