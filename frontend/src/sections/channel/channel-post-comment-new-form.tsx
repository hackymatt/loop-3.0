import type { IChannelItemProp } from "src/types/channel";

import { z as zod } from "zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import { Box } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { useCreatePostComment } from "src/api/project/channel/comments";

import { Form, Field } from "src/components/hook-form";

// ----------------------------------------------------------------------

export type ChannelPostCommentSchemaType = zod.infer<
  ReturnType<typeof useChannelPostCommentSchema>
>;

export const useChannelPostCommentSchema = () => {
  const { t } = useTranslation("channel");
  return zod.object({
    message: zod.string().min(1, t("newComment.errors.message.required")),
  });
};

// ----------------------------------------------------------------------

type Props = {
  slug: string;
  postId: IChannelItemProp["id"];
  onClose: () => void;
};

export function ChannelPostCommentNewForm({ postId, slug, onClose }: Props) {
  const { t } = useTranslation("channel");

  const { mutateAsync: createPostComment } = useCreatePostComment(slug);

  const ChannelPostCommentSchema = useChannelPostCommentSchema();

  const defaultValues: ChannelPostCommentSchemaType = {
    message: t("newComment.placeholder"),
  };

  const methods = useForm<ChannelPostCommentSchemaType>({
    resolver: zodResolver(ChannelPostCommentSchema),
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
      await createPostComment({ ...data, post_id: postId });
      reset();
      onClose();
    } catch (error) {
      handleFormError(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
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
        <Field.Markdown name="message" />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
        <LoadingButton color="inherit" type="submit" variant="contained" loading={isSubmitting}>
          {t("newComment.submit")}
        </LoadingButton>
      </Box>
    </Form>
  );
}
