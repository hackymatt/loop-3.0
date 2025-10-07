import type { Language } from "src/locales/types";

import { z as zod } from "zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import { Box } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { useCreatePost } from "src/api/project/channel/posts";

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

type Props = {
  slug: string;
  language: Language;
  onClose: () => void;
};

export function ChannelPostNewForm({ slug, language, onClose }: Props) {
  const { t } = useTranslation("channel");

  const { mutateAsync: createPost } = useCreatePost(slug, language);

  const ChannelPostSchema = useChannelPostSchema();

  const defaultValues: ChannelPostSchemaType = { title: "", message: t("newPost.placeholder") };

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
      await createPost(data);
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
          p: 1,
          gap: 2.5,
          display: "flex",
          flexDirection: "column",
          border: `solid 1px ${theme.palette.divider}`,
          borderRadius: 1,
        })}
      >
        <Field.Text name="title" label={t("newPost.title")} />

        <Field.Markdown name="message" />
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, mb: 3, gap: 2 }}>
        <LoadingButton color="inherit" type="submit" variant="contained" loading={isSubmitting}>
          {t("newPost.submit")}
        </LoadingButton>
      </Box>
    </Form>
  );
}
