import { z as zod } from "zod";
import { useTranslation } from "react-i18next";

// ----------------------------------------------------------------------

export type PaymentSchemaType = zod.infer<ReturnType<typeof usePaymentSchema>>;

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

export const usePaymentMethods = () => {
  const { t } = useTranslation("payment");

  const cardSchema = zod.object({
    number: zod
      .string()
      .min(16, { message: t("card.number.errors.required") })
      .refine(
        (value) => {
          const cleanNumber = value.replaceAll(" ", "");
          return cleanNumber.length === 16 && /^\d+$/.test(cleanNumber);
        },
        { message: t("card.number.errors.invalid") }
      ),
    holder: zod.string().min(1, { message: t("card.holder.errors.required") }),
    expiration: zod
      .string()
      .min(5, { message: t("card.expiration.errors.required") })
      .max(5, { message: t("card.expiration.errors.invalid") })
      .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: t("card.expiration.errors.invalid") })
      .refine(
        (value) => {
          const [month, year] = value.split("/");
          const expirationDate = new Date(Number(`20${year}`), parseInt(month, 10) - 1);
          const currentDate = new Date();
          return expirationDate > currentDate;
        },
        { message: t("card.expiration.errors.invalid") }
      ),
    security: zod
      .string()
      .min(3, { message: t("card.security.errors.required") })
      .max(3, { message: t("card.security.errors.invalid") }),
  });

  return zod
    .object({
      method: zod.enum(["card", "applepay", "googlepay", ""]),
      card: zod.any(),
    })
    .superRefine((data, ctx) => {
      if (data.method === "card") {
        const result = cardSchema.safeParse(data.card);
        if (!result.success) {
          for (const issue of result.error.issues) {
            ctx.addIssue({
              ...issue,
              path: ["card", ...(issue.path ?? [])],
            });
          }
        }
      }
    });
};
