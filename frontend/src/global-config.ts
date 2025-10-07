import packageJson from "../package.json";

// ----------------------------------------------------------------------

export const CONFIG = {
  appName: packageJson.name,
  appVersion: packageJson.version,
  assetsDir: process.env.NEXT_PUBLIC_ASSETS_DIR ?? "",
  env: process.env.NEXT_PUBLIC_ENV ?? "LOCAL",
  isLocal: (process.env.NEXT_PUBLIC_ENV ?? "LOCAL") === "LOCAL",
  serverApi: process.env.NEXT_PUBLIC_SERVER_API_URL ?? "",
  clientApi: process.env.NEXT_PUBLIC_CLIENT_API_URL ?? "",
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
  githubClientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ?? "",
  facebookClientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID ?? "",
  minPasswordLength: Number(process.env.NEXT_PUBLIC_MIN_PASSWORD_LENGTH ?? "8"),
  googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? "",
  facebookPixelId: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID ?? "",
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  annualDiscount: 15,
  trialDays: 7,
};
