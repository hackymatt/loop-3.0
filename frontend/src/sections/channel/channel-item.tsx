import type { IChannelItemProp } from "src/types/channel";
import type { Theme, SxProps } from "@mui/material/styles";

import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";

import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { Button, IconButton } from "@mui/material";

import { fToNow } from "src/utils/format-time";

import { DEFAULT_AVATAR_URL } from "src/consts/avatar";
import { useLikePost } from "src/api/project/channel/likes";

import { Iconify } from "src/components/iconify";
import { Markdown } from "src/components/markdown";

import { DeletePostForm } from "./delete-post-from";
import { ChannelPostEditForm } from "./channel-post-edit-form";
import { DeletePostCommentForm } from "./delete-post-comment-form";
import { ChannelPostCommentNewForm } from "./channel-post-comment-new-form";
import { ChannelPostCommentEditForm } from "./channel-post-comment-edit-form";

// ----------------------------------------------------------------------

const AVATAR_SIZE = { root: 32, comment: 24 };

type Props = Pick<IChannelItemProp, "id" | "student" | "message" | "createdAt"> &
  Partial<IChannelItemProp> & {
    hasReply?: boolean;
    commentId?: string;
    slug: string;
    sx?: SxProps<Theme>;
  };

export function ChannelItem({
  sx,
  slug,
  id,
  student,
  title,
  message,
  createdAt,
  hasReply,
  commentId,
  isHelpful,
  isMine,
  helpfulCount = 0,
}: Props) {
  const openReply = useBoolean();
  const editMode = useBoolean();
  const deletePostFormOpen = useBoolean();
  const deletePostCommentFormOpen = useBoolean();

  const { mutateAsync: likePost } = useLikePost(slug);

  const { t } = useTranslation("channel");

  const handleDelete = () =>
    !hasReply ? deletePostFormOpen.onTrue() : deletePostCommentFormOpen.onTrue();

  const handleHelpful = async () => {
    try {
      await likePost({ post_id: id });
    } catch (error) {
      console.error("Failed to update like:", error);
    }
  };

  const renderActions = () => (
    <Box sx={{ mt: 2, gap: 2, display: "flex", alignItems: "center" }}>
      <Button
        startIcon={<Iconify width={18} icon="solar:like-outline" />}
        disableRipple
        onClick={handleHelpful}
        disabled={isMine}
        sx={{
          fontWeight: "fontWeightSemiBold",
          ...(isHelpful && { color: "primary.main" }),
        }}
      >
        {t("helpful")} ({helpfulCount})
      </Button>

      <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "text.disabled" }} />

      <Button disableRipple onClick={openReply.onToggle} sx={{ fontWeight: "fontWeightSemiBold" }}>
        {t("reply")}
      </Button>
    </Box>
  );

  const renderModifyActions = () => (
    <Box>
      <IconButton>
        <Iconify width={18} icon="solar:pen-2-outline" onClick={editMode.onToggle} />
      </IconButton>
      <IconButton color="error">
        <Iconify width={18} icon="solar:trash-bin-2-bold" onClick={handleDelete} />
      </IconButton>
    </Box>
  );

  return (
    <>
      <Box
        sx={[
          {
            py: title ? 3 : 1,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <Box sx={{ flex: "1 1 auto" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                alt={student.name}
                src={student.avatarUrl || DEFAULT_AVATAR_URL}
                sx={{
                  width: title ? AVATAR_SIZE.root : AVATAR_SIZE.comment,
                  height: title ? AVATAR_SIZE.root : AVATAR_SIZE.comment,
                }}
              />

              <Typography variant={title ? "subtitle1" : "subtitle2"}>{student.name}</Typography>

              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                {`${fToNow(createdAt)} ${t("ago")}`}
              </Typography>
            </Box>

            {isMine && renderModifyActions()}
          </Box>

          {!editMode.value ? (
            <>
              {!hasReply && (
                <Typography variant="h4" fontWeight="bold" mt={2}>
                  {title}
                </Typography>
              )}

              <Markdown content={message} />
            </>
          ) : !commentId ? (
            <ChannelPostEditForm
              slug={slug}
              id={id}
              defaultValues={{ title: title!, message }}
              onClose={editMode.onFalse}
            />
          ) : (
            <ChannelPostCommentEditForm
              slug={slug}
              id={id}
              commentId={commentId}
              defaultValues={{ message }}
              onClose={editMode.onFalse}
            />
          )}

          {!hasReply && renderActions()}

          {!hasReply && openReply.value && (
            <ChannelPostCommentNewForm postId={id} slug={slug} onClose={openReply.onFalse} />
          )}
        </Box>
      </Box>

      {!commentId ? (
        <DeletePostForm
          slug={slug}
          id={id}
          open={deletePostFormOpen.value}
          onClose={deletePostFormOpen.onFalse}
        />
      ) : (
        <DeletePostCommentForm
          slug={slug}
          id={id}
          commentId={commentId}
          open={deletePostCommentFormOpen.value}
          onClose={deletePostCommentFormOpen.onFalse}
        />
      )}
    </>
  );
}
