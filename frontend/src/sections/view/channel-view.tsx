"use client";

import type { IProjectProps } from "src/types/project";
import type { IChannelItemProp } from "src/types/channel";

import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";

import { Box, Button, Container, Typography } from "@mui/material";

import { Iconify } from "src/components/iconify";

import { ChannelItemsList } from "../channel/channel-list";
import { ChannelPostNewForm } from "../channel/channel-post-new-form";

// ----------------------------------------------------------------------

type ChannelViewProps = {
  data: { project: IProjectProps; channelItems: IChannelItemProp[] };
};

export function ChannelView({ data }: ChannelViewProps) {
  const { t } = useTranslation("channel");

  const { project, channelItems } = data;

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
      >
        {t("button")}
      </Button>
    </Box>
  );

  const renderListView = () => (
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
    </>
  );
}
