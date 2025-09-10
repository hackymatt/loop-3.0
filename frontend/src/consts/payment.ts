export const PAYMENT_METHOD = {
  CARD: "card",
  PAYPAL: "paypal",
  REVOLUT_PAY: "revolut_pay",
} as const;

export const WALLET_TYPES = {
  GOOGLE_PAY: "google_pay",
  APPLE_PAY: "apple_pay",
} as const;

export const PAYMENT_RESULT = {
  SUCCESS: "succeeded",
  FAILED: "failed",
} as const;
