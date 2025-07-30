"use client";

import type { IPlanProps } from "src/types/plan";

import { useTranslation } from "react-i18next";

import { Faqs } from "../faqs";
import { PricingCardsView } from "../pricing/pricing-cards-view";
import { PricingColumnsView } from "../pricing/pricing-columns-view";

import type { IFaqProps } from "../support/types";

// ----------------------------------------------------------------------
type PricingViewProps = {
  data: {
    plans: IPlanProps[];
  };
};

export function PricingView({ data }: PricingViewProps) {
  const { t } = useTranslation("faq");
  const faq = t("faq", { returnObjects: true }) as IFaqProps[];
  const payments = faq.filter((f) => f.id === "payments")[0].content;

  const { plans } = data;

  return (
    <>
      <PricingCardsView plans={plans} />

      <PricingColumnsView plans={plans} />

      <Faqs data={payments} />
    </>
  );
}
