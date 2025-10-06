import type { Language } from "src/locales/types";
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

import { useDeleteAccount } from "src/api/me/delete-account";

import { Form } from "src/components/hook-form";

// ----------------------------------------------------------------------

type Props = DialogProps & {
  language: Language;
  onClose: () => void;
};

export function DeleteAccountForm({ language, onClose, ...other }: Props) {
  const { t } = useTranslation("account");

  const { mutateAsync: deleteAccount } = useDeleteAccount(language);

  const methods = useForm();

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleFormError = useFormErrorHandler(methods);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await deleteAccount({});
      onClose();
    } catch (error) {
      handleFormError(error);
    }
  });

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} {...other}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ typography: "h3", pb: 3 }}>{t("delete.button")}</DialogTitle>

        <DialogContent
          sx={{
            py: 0,
            gap: 2.5,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {t("delete.description")}
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose} color="inherit">
            {t("delete.cancel")}
          </Button>
          <LoadingButton color="error" type="submit" variant="contained" loading={isSubmitting}>
            {t("delete.button")}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
