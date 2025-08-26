import type { LANGUAGE } from "src/consts/language";

export type Language = (typeof LANGUAGE)[keyof typeof LANGUAGE];
