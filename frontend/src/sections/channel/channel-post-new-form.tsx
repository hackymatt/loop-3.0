import type { DialogProps } from "@mui/material/Dialog";

import { z as zod } from "zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import LoadingButton from "@mui/lab/LoadingButton";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { useChannelSubmit } from "src/api/project/channel/submit";

import { Form, Field } from "src/components/hook-form";

// ----------------------------------------------------------------------

export type ChannelPostSchemaType = zod.infer<ReturnType<typeof useChannelPostSchema>>;

export const useChannelPostSchema = () => {
  const { t } = useTranslation("channel");
  return zod.object({
    title: zod.string().min(1, t("newPost.errors.title.required")),
    message: zod.string().min(1, t("newPost.errors.message.required")),
  });
};

// ----------------------------------------------------------------------

type Props = DialogProps & {
  slug: string;
  onClose: () => void;
};

export function ChannelPostNewForm({ slug, onClose, ...other }: Props) {
  const { t } = useTranslation("channel");

  const { mutateAsync: submitPost } = useChannelSubmit();

  const ChannelPostSchema = useChannelPostSchema();

  const defaultValues: ChannelPostSchemaType = { title: "", message: "" };

  const methods = useForm<ChannelPostSchemaType>({
    resolver: zodResolver(ChannelPostSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleFormError = useFormErrorHandler(methods);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await submitPost({ ...data, slug });
      reset();
      onClose();
    } catch (error) {
      handleFormError(error);
    }
  });

  return (
    <Dialog fullWidth maxWidth="lg" onClose={onClose} {...other}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ typography: "h3", pb: 3 }}>{t("newPost.header")}</DialogTitle>

        <DialogContent
          sx={{
            py: 0,
            gap: 2.5,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Field.Text name="title" label={t("newPost.title")} />

          <Box
            sx={(theme) => ({
              border: `solid 1px ${theme.palette.divider}`,
              borderRadius: 1,
              p: 1,
              mt: 2,
              width: { xs: 0.45, sm: 0.85, md: 1 },
            })}
          >
            <Field.Markdown name="message" />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose} color="inherit">
            {t("newPost.cancel")}
          </Button>
          <LoadingButton color="inherit" type="submit" variant="contained" loading={isSubmitting}>
            {t("newPost.submit")}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
