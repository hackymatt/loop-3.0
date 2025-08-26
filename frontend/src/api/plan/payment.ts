import { cookies } from "next/headers";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.CREATE_SUBSCRIPTION;

export type IPaymentIntent = {
  type: string;
  interval: string;
  currency: string;
};

export type IPaymentIntentReturn = {
  subscription_id: string;
  client_secret: string;
  intent_type: "setup" | "payment";
};

export async function createSubscription(payload: IPaymentIntent): Promise<IPaymentIntentReturn> {
  const { data } = await Api.post<IPaymentIntentReturn>(endpoint, payload, {
    headers: { Cookie: cookies().toString() },
  });
  return data;
}
