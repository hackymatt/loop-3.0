import type { CURRENCY } from "src/consts/currency";
import type { LANGUAGE } from "src/consts/language";

export type Language = (typeof LANGUAGE)[keyof typeof LANGUAGE];

export type Currency = (typeof CURRENCY)[keyof typeof CURRENCY];
