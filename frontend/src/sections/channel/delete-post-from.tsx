import type { DialogProps } from "@mui/material/Dialog";
import type { IChannelItemProp } from "src/types/channel";

import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import LoadingButton from "@mui/lab/LoadingButton";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { useDeletePost } from "src/api/project/channel/post";

import { Form } from "src/components/hook-form";

// ----------------------------------------------------------------------

type Props = DialogProps & {
  slug: string;
  id: IChannelItemProp["id"];
  onClose: () => void;
};

export function DeletePostForm({ slug, id, onClose, ...other }: Props) {
  const { t } = useTranslation("channel");

  const { mutateAsync: deletePost } = useDeletePost(slug, id);

  const methods = useForm();

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleFormError = useFormErrorHandler(methods);

  const onSubmit = handleSubmit(async () => {
    try {
      await deletePost({});
      onClose();
    } catch (error) {
      handleFormError(error);
    }
  });

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} {...other}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ typography: "h3", pb: 3 }}>{t("delete.post.button")}</DialogTitle>

        <DialogContent
          sx={{
            py: 0,
            gap: 2.5,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {t("delete.post.description")}
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose} color="inherit">
            {t("delete.post.cancel")}
          </Button>
          <LoadingButton color="error" type="submit" variant="contained" loading={isSubmitting}>
            {t("delete.post.button")}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
