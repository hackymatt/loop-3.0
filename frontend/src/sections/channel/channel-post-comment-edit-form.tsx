import type { IChannelItemProp, IChannelCommentProp } from "src/types/channel";

import { z as zod } from "zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import { Box } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

import { useFormErrorHandler } from "src/hooks/use-form-error-handler";

import { useEditPostComment } from "src/api/project/channel/comment";

import { Form, Field } from "src/components/hook-form";

// ----------------------------------------------------------------------

export type ChannelPostCommentSchemaType = zod.infer<
  ReturnType<typeof useChannelPostCommentSchema>
>;

export const useChannelPostCommentSchema = () => {
  const { t } = useTranslation("channel");
  return zod.object({
    message: zod.string().min(1, t("editComment.errors.message.required")),
  });
};

// ----------------------------------------------------------------------

type Props = {
  slug: string;
  id: IChannelItemProp["id"];
  commentId: IChannelCommentProp["id"];
  defaultValues: ChannelPostCommentSchemaType;
  onClose: () => void;
};

export function ChannelPostCommentEditForm({ slug, id, commentId, defaultValues, onClose }: Props) {
  const { t } = useTranslation("channel");

  const { mutateAsync: editCommentComment } = useEditPostComment(slug, id, commentId);

  const ChannelPostCommentSchema = useChannelPostCommentSchema();

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
      await editCommentComment(data);
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
        <Field.Markdown name="message" />
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, mb: 3, gap: 2 }}>
        <LoadingButton color="inherit" type="submit" variant="contained" loading={isSubmitting}>
          {t("editComment.submit")}
        </LoadingButton>
      </Box>
    </Form>
  );
}
