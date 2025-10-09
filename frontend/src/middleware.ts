import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { paths } from "./routes/paths";
import { LANGUAGE } from "./consts/language";

import type { Language } from "./locales/types";

const locales = Object.values(LANGUAGE);

const AUTHORIZED_PATHS = [
  paths.certificates,
  paths.learn,
  paths.channel,
  paths.account.dashboard,
  paths.account.personal,
  paths.account.manage,
  paths.account.subscription,
  paths.account.payment,
  paths.account.invoices,
  paths.account.consultations,
  paths.payment,
  paths.orderStatus,
];

const UNAUTHORIZED_PATHS = [
  paths.home,
  paths.auth.login,
  paths.auth.register,
  paths.auth.activate,
  paths.auth.resetPassword,
  paths.auth.updatePassword,
  paths.about,
];

const PUBLIC_FILE = /\.(.*)$/;

function matchesPath(pathname: string, pathsArr: string[]) {
  return pathsArr.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

const isAuthorizedPath = (pathname: string) => matchesPath(pathname, AUTHORIZED_PATHS);
const isUnauthorizedPath = (pathname: string) => matchesPath(pathname, UNAUTHORIZED_PATHS);

export function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;
  const accessToken = req.cookies.get("access_token");

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const hasLocale = locales.includes(firstSegment as Language);

  let locale: Language;
  if (hasLocale) {
    locale = firstSegment as Language;
  } else {
    // Detect from Accept-Language
    const acceptLang = req.headers.get("accept-language") || "";
    const detected = acceptLang.toLowerCase().startsWith("en") ? LANGUAGE.EN : LANGUAGE.PL;
    locale = detected;
  }

  const pathWithoutLocale = `/${segments.slice(hasLocale ? 1 : 0).join("/") || ""}`;
  const redirectLocale = `/${locale}`;

  if (!accessToken && isAuthorizedPath(pathWithoutLocale)) {
    return NextResponse.redirect(new URL(`${redirectLocale}${paths.auth.login}`, origin));
  }

  if (accessToken && isUnauthorizedPath(pathWithoutLocale)) {
    return NextResponse.redirect(new URL(`${redirectLocale}${paths.account.dashboard}`, origin));
  }

  // Rewrite if missing locale
  if (!hasLocale) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|assets).*)"],
};
