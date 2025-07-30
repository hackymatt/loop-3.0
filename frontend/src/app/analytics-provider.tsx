"use client";

import ReactGA from "react-ga";
import ReactPixel from "react-facebook-pixel";
import { useState, useEffect, useContext, createContext, type ReactNode } from "react";

import { usePathname, useSearchParams } from "src/routes/hooks";

import { CONFIG } from "src/global-config";

import { useCookiesManager } from "./cookies-manager-provider";

type TrackEventParams = {
  label: string;
  category?: string;
  action?: string;
  value?: number;
  eventName?: string;
};

interface AnalyticsContextProps {
  trackEvent: ({ label, category, action, value, eventName }: TrackEventParams) => void;
}

const AnalyticsContext = createContext<AnalyticsContextProps | undefined>(undefined);

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const [isAnalyticsReady, setAnalyticsReady] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const cookies = useCookiesManager();
  const { consent, analytics, marketing } = cookies.cookies;

  useEffect(() => {
    if (consent) {
      if (analytics) {
        // Initialize Google Analytics
        ReactGA.initialize(CONFIG.googleAnalyticsId);
        ReactGA.pageview(window.location.pathname + window.location.search);
      }
      if (marketing) {
        // Initialize Facebook Pixel
        ReactPixel.init(CONFIG.facebookPixelId);
        ReactPixel.pageView();
      }
      setAnalyticsReady(true);
    }
  }, [analytics, consent, marketing]);

  useEffect(() => {
    if (!isAnalyticsReady) return;

    const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;

    if (analytics) {
      ReactGA.pageview(url);
    }

    if (marketing) {
      ReactPixel.pageView();
    }
  }, [pathname, searchParams, isAnalyticsReady, analytics, marketing]);

  const trackEvent = ({
    label,
    category = "User",
    action = "Click",
    value,
    eventName,
  }: TrackEventParams) => {
    if (!isAnalyticsReady) return;

    const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;

    if (analytics) {
      ReactGA.event({
        category,
        action,
        label: `${label} - ${url}`,
        ...(value !== undefined && { value }),
      });
    }

    if (marketing) {
      const fbEventName = eventName || "Click";
      ReactPixel.trackCustom(fbEventName, {
        label,
        category,
        action,
        url,
        ...(value !== undefined && { value }),
      });
    }
  };

  return <AnalyticsContext.Provider value={{ trackEvent }}>{children}</AnalyticsContext.Provider>;
};

// Custom hook to use analytics
export const useAnalytics = (): AnalyticsContextProps => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
};
