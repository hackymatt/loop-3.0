"use client";

import type { Language } from "src/locales/types";

import { ContactForm } from "../contact/contact-form";
import { ContactInfo } from "../contact/contact-info";

// ----------------------------------------------------------------------
type ContactViewProps = { language: Language };

export function ContactView({ language }: ContactViewProps) {
  return (
    <>
      <ContactInfo />

      <ContactForm language={language} />
    </>
  );
}
