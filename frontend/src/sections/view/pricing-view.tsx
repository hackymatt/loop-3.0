"use client";

import { useTranslation } from "react-i18next";

import { Faqs } from "../faqs";
import { PricingCardsView } from "../pricing/pricing-cards-view";
import { PricingColumnsView } from "../pricing/pricing-columns-view";

import type { IFaqProps } from "../support/types";

// ----------------------------------------------------------------------

export function PricingView() {
  const { t } = useTranslation("faq");
  const faq = t("faq", { returnObjects: true }) as IFaqProps[];
  const payments = faq.filter((f) => f.id === "payments")[0].content;
  return (
    <>
      <PricingCardsView />

      <PricingColumnsView />

      <Faqs data={payments} />
    </>
  );
}
