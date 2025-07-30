"use client";

import { ContactForm } from "../contact/contact-form";
import { ContactInfo } from "../contact/contact-info";

// ----------------------------------------------------------------------

export function ContactView() {
  return (
    <>
      <ContactInfo />

      <ContactForm />
    </>
  );
}
