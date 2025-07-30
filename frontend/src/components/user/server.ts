import { cookies } from "next/headers";

import { defaultUser, USER_STORAGE_KEY } from "./user-config";

import type { UserState } from "./types";

// ----------------------------------------------------------------------

export async function detectUser(storageKey: string = USER_STORAGE_KEY): Promise<UserState> {
  const cookieStore = cookies();

  const userStore = cookieStore.get(storageKey);

  return userStore ? JSON.parse(userStore?.value) : defaultUser;
}
