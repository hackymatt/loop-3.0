import type { PlanType } from "src/types/plan";
import type { DialogProps } from "@mui/material/Dialog";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import LoadingButton from "@mui/lab/LoadingButton";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { PLAN_TYPE } from "src/consts/plan";
import { useSubscribe } from "src/api/plan/subscribe";

import { Form } from "src/components/hook-form";
import { useUserContext } from "src/components/user";

// ----------------------------------------------------------------------

type Props = DialogProps & {
  onClose: () => void;
};

export function CancelSubscriptionForm({ onClose, ...other }: Props) {
  const { t } = useTranslation("account");

  const { mutateAsync: subscribe } = useSubscribe();

  const user = useUserContext();
  const { firstName, lastName } = user.state;

  const methods = useForm();

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleFormError = useFormErrorHandler(methods);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { data: response } = await subscribe({
        plan: PLAN_TYPE.FREE,
        interval: null,
        user: { first_name: firstName || "", last_name: lastName || "" },
      });
      const { type, ...rest } = response;
      user.setField("plan", { ...rest, type: type as PlanType });
      onClose();
    } catch (error) {
      handleFormError(error);
    }
  });

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} {...other}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ typography: "h3", pb: 3 }}>{t("subscription.button")}</DialogTitle>

        <DialogContent
          sx={{
            py: 0,
            gap: 2.5,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {t("subscription.description")}
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose} color="inherit">
            {t("subscription.cancel")}
          </Button>
          <LoadingButton color="error" type="submit" variant="contained" loading={isSubmitting}>
            {t("subscription.button")}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
