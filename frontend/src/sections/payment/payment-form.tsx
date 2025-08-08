import { PaymentElement } from "@stripe/react-stripe-js";
import { useController, useFormContext } from "react-hook-form";

// ----------------------------------------------------------------------

export function PaymentForm() {
  const { control } = useFormContext();

  const {
    field: { value: customer },
  } = useController({ name: "customer", control });

  return (
    <PaymentElement
      options={{
        defaultValues: {
          billingDetails: {
            name: customer.name,
            email: customer.email,
          },
        },
        layout: {
          type: "accordion",
          radios: true,
          defaultCollapsed: false,
        },
      }}
    />
  );
}
