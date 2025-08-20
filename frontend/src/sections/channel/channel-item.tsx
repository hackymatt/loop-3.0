import type { IChannelItemProp } from "src/types/channel";
import type { Theme, SxProps } from "@mui/material/styles";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";

import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";

import { fToNow } from "src/utils/format-time";

import { Iconify } from "src/components/iconify";
import { Markdown } from "src/components/markdown";
import { MarkdownEditor } from "src/components/markdown-editor";

// ----------------------------------------------------------------------

const AVATAR_SIZE = { root: 32, comment: 24 };

type Props = Pick<IChannelItemProp, "user" | "message" | "createdAt"> &
  Partial<IChannelItemProp> & {
    hasReply?: boolean;
    sx?: SxProps<Theme>;
  };

export function ChannelItem({
  sx,
  user,
  title,
  message,
  createdAt,
  hasReply,
  isHelpful,
  helpfulCount = 0,
}: Props) {
  const openReply = useBoolean();
  const clickedHelpful = useBoolean(isHelpful);

  const { t } = useTranslation("channel");

  const [comment, setComment] = useState<string>(t("placeholder"));

  const renderActions = () => (
    <Box sx={{ mt: 2, gap: 2, display: "flex", alignItems: "center" }}>
      <ButtonBase
        disableRipple
        onClick={clickedHelpful.onToggle}
        sx={{
          gap: 1,
          fontWeight: "fontWeightSemiBold",
          ...(clickedHelpful.value && { color: "primary.main" }),
        }}
      >
        <Iconify width={18} icon="solar:like-outline" /> {t("helpful")} ({helpfulCount})
      </ButtonBase>

      <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "text.disabled" }} />

      <ButtonBase
        disableRipple
        onClick={openReply.onToggle}
        sx={{ fontWeight: "fontWeightSemiBold" }}
      >
        {t("reply")}
      </ButtonBase>
    </Box>
  );

  return (
    <Box
      sx={[
        {
          py: title ? 3 : 1,
          display: "flex",
          alignItems: "flex-start",
          ...(hasReply && { ml: "auto" }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box sx={{ flex: "1 1 auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            alt={user.name}
            src={user.avatarUrl}
            sx={{
              width: title ? AVATAR_SIZE.root : AVATAR_SIZE.comment,
              height: title ? AVATAR_SIZE.root : AVATAR_SIZE.comment,
            }}
          />

          <Typography variant={title ? "subtitle1" : "subtitle2"}>{user.name}</Typography>

          <Typography variant="caption" sx={{ color: "text.disabled" }}>
            {`${fToNow(createdAt)} ${t("ago")}`}
          </Typography>
        </Box>

        <Typography variant="h4" fontWeight="bold" mt={2}>
          {title}
        </Typography>

        <Markdown content={message} />

        {!hasReply && renderActions()}

        {!hasReply && openReply.value && (
          <Box
            sx={(theme) => ({
              border: `solid 1px ${theme.palette.divider}`,
              borderRadius: 1,
              p: 1,
              mt: 2,
              width: { xs: 0.45, sm: 0.85, md: 1 },
            })}
          >
            <MarkdownEditor value={comment} onChange={setComment} />
          </Box>
        )}
      </Box>
    </Box>
  );
}
