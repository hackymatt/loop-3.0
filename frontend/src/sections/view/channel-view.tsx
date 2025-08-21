"use client";

import type { IProjectProps } from "src/types/project";
import type { IChannelItemProp } from "src/types/channel";

import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";

import { Box, Card, Button, Skeleton, Container, Typography } from "@mui/material";

import { Iconify } from "src/components/iconify";

import { UpgradeBanner } from "../learn/upgrade-banner";
import { ChannelItemsList } from "../channel/channel-list";
import { ChannelPostNewForm } from "../channel/channel-post-new-form";

// ----------------------------------------------------------------------

type ChannelViewProps = {
  data: { project: IProjectProps; channelItems: IChannelItemProp[]; isLocked: boolean };
};

export function ChannelView({ data }: ChannelViewProps) {
  const { t } = useTranslation("channel");

  const { project, channelItems, isLocked } = data;

  const { name: projectName } = project;

  const openPostForm = useBoolean();

  const renderHead = () => (
    <Box sx={{ display: "flex", alignItems: "center", py: 5 }}>
      <Typography variant="h3" sx={{ flexGrow: 1 }}>
        {t("title")}: {projectName}
      </Typography>

      <Button
        size="medium"
        color="inherit"
        variant="contained"
        startIcon={<Iconify icon="solar:pen-2-outline" />}
        onClick={openPostForm.onTrue}
        disabled={isLocked}
      >
        {t("button")}
      </Button>
    </Box>
  );

  const renderPostSkeleton = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="text" width={120} height={24} />
            <Skeleton variant="text" width={60} height={16} sx={{ ml: "auto" }} />
          </Box>

          <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={48} sx={{ mb: 1 }} />

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Skeleton variant="text" width={60} height={20} />
            <Skeleton variant="circular" width={4} height={4} sx={{ mt: 1 }} />
            <Skeleton variant="text" width={40} height={20} />
          </Box>
        </Card>
      ))}
    </Box>
  );

  const renderListView = () =>
    isLocked ? (
      renderPostSkeleton()
    ) : (
      <ChannelItemsList
        items={channelItems}
        pagesCount={1}
        page={1}
        onPageChange={() => {}}
        recordsCount={channelItems.length}
      />
    );

  return (
    <>
      <Container>
        {renderHead()}

        <Box
          sx={{
            mb: 10,
            display: "flex",
            flexDirection: { xs: "column-reverse", md: "row" },
          }}
        >
          <Box sx={{ flex: "1 1 auto", minWidth: 0 }}>{renderListView()}</Box>
        </Box>
      </Container>

      <ChannelPostNewForm
        slug={project.slug || ""}
        open={openPostForm.value}
        onClose={openPostForm.onFalse}
      />

      {isLocked && <UpgradeBanner slug={project.slug} open />}
    </>
  );
}
