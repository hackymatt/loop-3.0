import { cookies } from "next/headers";

import { URLS } from "../urls";
import { Api } from "../service";

const endpoint = URLS.CREATE_SETUP_INTENT;

type ISetupIntent = {
  type: string;
  interval: string;
  currency: string;
};

type ISetupIntentReturn = {
  client_secret: string;
};

export async function createSetupIntent(payload: ISetupIntent): Promise<ISetupIntentReturn> {
  const { data } = await Api.post<ISetupIntentReturn>(endpoint, payload, {
    headers: { Cookie: cookies().toString() },
  });
  return data;
}
