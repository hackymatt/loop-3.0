"use client";

import type { ReactNode } from "react";

import { useContext, useCallback, createContext } from "react";
import { useBoolean, useLocalStorage } from "minimal-shared/hooks";

import { useCookiesTypes } from "src/hooks/use-cookies-types";

import { CookiesBanner } from "src/components/cookies/cookies-banner";

// ----------------------------------
// Types
type CookieSettings = {
  [cookie: string]: boolean;
  consent: boolean;
};

type CookiesManagerContextType = {
  cookies: CookieSettings;
  setCookies: (cookies: CookieSettings) => void;
};

// ----------------------------------
// Context setup
const CookiesManagerContext = createContext<CookiesManagerContextType | undefined>(undefined);

export const useCookiesManager = () => {
  const context = useContext(CookiesManagerContext);
  if (!context) throw new Error("useCookiesManager must be used within a CookiesManagerProvider");
  return context;
};

// ----------------------------------
// Provider component
export const CookiesManagerProvider = ({ children }: { children: ReactNode }) => {
  const { defaultCookies } = useCookiesTypes();
  const { state: cookies, setState: setCookies } = useLocalStorage<CookieSettings>("cookies", {
    ...defaultCookies,
    consent: false,
  });

  const cookieFormOpen = useBoolean();

  const handleConfirm = useCallback(
    (selectedCookies: { [cookie: string]: boolean }) => {
      setCookies({ consent: true, ...selectedCookies });
      cookieFormOpen.onFalse();
    },
    [setCookies, cookieFormOpen]
  );

  return (
    <CookiesManagerContext.Provider value={{ cookies, setCookies }}>
      {!cookies.consent && <CookiesBanner onConfirm={handleConfirm} />}
      {children}
    </CookiesManagerContext.Provider>
  );
};
