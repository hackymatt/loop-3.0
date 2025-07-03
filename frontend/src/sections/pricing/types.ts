import type { IPlanProps } from "src/types/plan";

export type PricingCardProps = Omit<IPlanProps, "price"> & {
  price: number;
};
