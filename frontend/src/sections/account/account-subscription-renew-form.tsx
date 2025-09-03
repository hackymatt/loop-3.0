import type { DialogProps } from "@mui/material/Dialog";
import type { ISubscriptionProps } from "src/types/user";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import LoadingButton from "@mui/lab/LoadingButton";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { fDate } from "src/utils/format-time";

import { Form } from "src/components/hook-form";

// ----------------------------------------------------------------------

type Props = DialogProps & {
  nextBillingDate: ISubscriptionProps["nextBillingDate"];
  onClose: () => void;
};

export function AccountSubscriptionRenewForm({ nextBillingDate, onClose, ...other }: Props) {
  const { t } = useTranslation("account");

  const methods = useForm();

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleFormError = useFormErrorHandler(methods);

  const onSubmit = handleSubmit(async (data) => {
    try {
      onClose();
    } catch (error) {
      handleFormError(error);
    }
  });

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} {...other}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ typography: "h3", pb: 3 }}>{t("subscription.renew.title")}</DialogTitle>

        <DialogContent
          sx={{
            py: 0,
            gap: 2.5,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {t("subscription.renew.description", {
            date: fDate(nextBillingDate, "DD MMMM YYYY"),
          })}
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose} color="inherit">
            {t("subscription.renew.cancel")}
          </Button>
          <LoadingButton color="error" type="submit" variant="contained" loading={isSubmitting}>
            {t("subscription.renew.approve")}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
