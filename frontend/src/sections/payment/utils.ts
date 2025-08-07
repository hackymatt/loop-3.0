import { loadStripe } from "@stripe/stripe-js";

import { CONFIG } from "src/global-config";

// ----------------------------------------------------------------------

const stripePromise = loadStripe(CONFIG.stripePublishableKey);

type PaymentMethodAvailabilityProps = {
  country: string;
  currency: string;
};

// ----------------------------------------------------------------------

export async function isApplePayAvailable({
  country,
  currency,
}: PaymentMethodAvailabilityProps): Promise<boolean> {
  const stripe = await stripePromise;

  const paymentRequest = stripe!.paymentRequest({
    country,
    currency,
    total: { label: "Test", amount: 1000 },
    requestPayerEmail: true,
  });

  const result = await paymentRequest.canMakePayment();

  return result?.applePay || false;
}

export async function isGooglePayAvailable({
  country,
  currency,
}: PaymentMethodAvailabilityProps): Promise<boolean> {
  const stripe = await stripePromise;

  const paymentRequest = stripe!.paymentRequest({
    country,
    currency,
    total: { label: "Test", amount: 1000 },
    requestPayerEmail: true,
  });

  const result = await paymentRequest.canMakePayment();

  return result?.googlePay || false;
}

export function isBLIKAvailable({ country, currency }: PaymentMethodAvailabilityProps): boolean {
  return country.toUpperCase() === "PL" && currency.toUpperCase() === "PLN";
}
