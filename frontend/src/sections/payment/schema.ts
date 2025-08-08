import { z as zod } from "zod";
import { useTranslation } from "react-i18next";

// ----------------------------------------------------------------------

export const usePaymentSchema = () => {
  const { t } = useTranslation("account");
  return zod.object({
    termsAcceptance: zod.boolean().refine((data) => data === true, {
      message: t("termsAcceptance.errors.required"),
    }),
  });
};

export const useCustomerSchema = () => {
  const { t } = useTranslation("account");

  return zod.object({
    email: zod
      .string()
      .min(1, { message: t("email.errors.required") })
      .email({ message: t("email.errors.invalid") }),
    firstName: zod.string().min(1, { message: t("firstName.errors.required") }),
    lastName: zod.string().min(1, { message: t("lastName.errors.required") }),
  });
};
