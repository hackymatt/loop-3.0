import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { paths } from "./routes/paths";
import { LANGUAGE } from "./consts/language";

import type { Language } from "./locales/types";

const locales = Object.values(LANGUAGE);
const defaultLocale = LANGUAGE.PL;

const AUTHORIZED_PATHS = [
  paths.certificates,
  paths.learn,
  paths.account.dashboard,
  paths.account.personal,
  paths.account.manage,
  paths.account.subscription,
  paths.payment,
];

const UNAUTHORIZED_PATHS = [
  paths.home,
  paths.login,
  paths.register,
  paths.activate,
  paths.resetPassword,
  paths.updatePassword,
  paths.about,
];

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;
  const accessToken = req.cookies.get("access_token");

  // 1. Skip static and API
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Locale detection
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const hasLocale = locales.includes(firstSegment as Language);

  const locale = hasLocale ? (firstSegment as Language) : defaultLocale;
  const pathWithoutLocale = `/${segments.slice(hasLocale ? 1 : 0).join("/") || ""}`;

  // 3. Auth logic
  const redirectLocale = hasLocale ? `/${locale}` : "";

  if (!accessToken && AUTHORIZED_PATHS.includes(pathWithoutLocale)) {
    return NextResponse.redirect(new URL(`${redirectLocale}${paths.login}`, origin));
  }

  if (accessToken && UNAUTHORIZED_PATHS.includes(pathWithoutLocale)) {
    return NextResponse.redirect(new URL(`${redirectLocale}${paths.account.dashboard}`, origin));
  }

  // 4. Internally rewrite to defaultLocale path if not present in URL
  if (!hasLocale && locale === defaultLocale) {
    const url = req.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

// --- Matcher that captures paths with or without locale ---
export const config = {
  matcher: [
    // Obsługujemy wszystkie ścieżki, z i bez /locale/
    "/((?!_next|api|favicon.ico|assets).*)",
  ],
};
