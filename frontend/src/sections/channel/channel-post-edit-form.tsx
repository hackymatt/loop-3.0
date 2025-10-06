import type { Language } from "src/locales/types";
import type { IChannelItemProp } from "src/types/channel";

import { z as zod } from "zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import { Box } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { useEditPost } from "src/api/project/channel/post";

import { Form, Field } from "src/components/hook-form";

// ----------------------------------------------------------------------

export type ChannelPostSchemaType = zod.infer<ReturnType<typeof useChannelPostSchema>>;

export const useChannelPostSchema = () => {
  const { t } = useTranslation("channel");
  return zod.object({
    title: zod.string().min(1, t("editPost.errors.title.required")),
    message: zod.string().min(1, t("editPost.errors.message.required")),
  });
};

// ----------------------------------------------------------------------

type Props = {
  slug: string;
  id: IChannelItemProp["id"];
  defaultValues: ChannelPostSchemaType;
  language: Language;
  onClose: () => void;
};

export function ChannelPostEditForm({ slug, id, defaultValues, language, onClose }: Props) {
  const { t } = useTranslation("channel");

  const { mutateAsync: editPost } = useEditPost(slug, id, language);

  const ChannelPostSchema = useChannelPostSchema();

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
      await editPost(data);
      reset();
      onClose();
    } catch (error) {
      handleFormError(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      {/* Form Content */}
      <Box
        sx={(theme) => ({
          mt: 2,
          p: 1,
          gap: 2.5,
          display: "flex",
          flexDirection: "column",
          border: `solid 1px ${theme.palette.divider}`,
          borderRadius: 1,
        })}
      >
        <Field.Text name="title" label={t("editPost.title")} />

        <Field.Markdown name="message" />
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, mb: 3, gap: 2 }}>
        <LoadingButton color="inherit" type="submit" variant="contained" loading={isSubmitting}>
          {t("editPost.submit")}
        </LoadingButton>
      </Box>
    </Form>
  );
}
