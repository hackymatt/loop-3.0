export const SUBSCRIPTION_STATUS = {
  TRIALING: "trialing",
  ACTIVE: "active",
  CANCELED: "canceled",
  INCOMPLETE: "incomplete",
  INCOMPLETE_EXPIRED: "incomplete_expired",
  PAST_DUE: "past_due",
  UNPAID: "unpaid",
} as const;

export const SUBSCRIPTION_RESULT = {
  SUCCESS: "succeeded",
  FAILED: "failed",
} as const;
