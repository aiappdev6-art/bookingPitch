import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Stripe webhook bypasses i18n + auth
  if (pathname.startsWith("/api")) return NextResponse.next();

  // Detect admin route (locale-prefixed)
  const adminMatch = pathname.match(/^\/(ar|en)\/admin(\/.*)?$/);
  if (adminMatch) {
    const subpath = adminMatch[2] || "";
    if (subpath !== "/login") {
      const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
      });
      if (!token || token.role !== "ADMIN") {
        const url = req.nextUrl.clone();
        url.pathname = `/${adminMatch[1]}/admin/login`;
        return NextResponse.redirect(url);
      }
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
