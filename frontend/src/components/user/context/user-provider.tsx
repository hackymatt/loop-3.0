"use client";

import { useMemo } from "react";
import { useCookies, useLocalStorage } from "minimal-shared/hooks";

import { UserContext } from "./user-context";
import { USER_STORAGE_KEY } from "../user-config";

import type { UserState, UserProviderProps } from "../types";

// ----------------------------------------------------------------------

export function UserProvider({
  children,
  cookieUser,
  defaultUser,
  storageKey = USER_STORAGE_KEY,
}: UserProviderProps) {
  const isCookieEnabled = !!cookieUser;
  const useStorage = isCookieEnabled ? useCookies : useLocalStorage;
  const initialUser = isCookieEnabled ? cookieUser : defaultUser;

  const { state, setState, setField, resetState } = useStorage<UserState>(storageKey, initialUser);

  const memoizedValue = useMemo(
    () => ({
      state,
      setState,
      resetState: () => resetState(defaultUser),
      setField,
    }),
    [state, setState, setField, resetState, defaultUser]
  );

  return <UserContext.Provider value={memoizedValue}>{children}</UserContext.Provider>;
}
