import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api")) return NextResponse.next();

  const adminMatch = pathname.match(/^\/(ar|en)\/admin(\/.*)?$/);
  if (adminMatch) {
    const subpath = adminMatch[2] || "";
    const { response, user } = await updateSupabaseSession(req);
    if (subpath !== "/login") {
      const role = user?.app_metadata?.role;
      if (!user || role !== "ADMIN") {
        const url = req.nextUrl.clone();
        url.pathname = `/${adminMatch[1]}/admin/login`;
        return NextResponse.redirect(url);
      }
    }
    // Run intl middleware on the response that already carries refreshed cookies
    const intlRes = intlMiddleware(req);
    response.cookies.getAll().forEach((c) =>
      intlRes.cookies.set(c.name, c.value)
    );
    return intlRes;
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
