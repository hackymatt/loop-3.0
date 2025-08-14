"use client";

import type { IChannelItemProp } from "src/types/channel";

import { useTranslation } from "react-i18next";

import { Box, Container, Typography } from "@mui/material";

import { ChannelItemsList } from "../channel/channel-list";

// ----------------------------------------------------------------------

type ChannelViewProps = {
  data: {};
};

export function ChannelView({ data }: ChannelViewProps) {
  const { t } = useTranslation("channel");

  const mockChannelItems: IChannelItemProp[] = [
    {
      id: "1",
      title: "Why I love this channel",
      user: {
        name: "John Doe",
        avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      message: `Możesz dodać parametr \`isLast\` w pętli \`map\`, sprawdzając indeks elementu w tablicy.`,
      helpfulCount: 12,
      isHelpful: false,
      createdAt: "2025-08-14T10:15:00Z",
      comments: [
        {
          id: "1001",
          user: {
            name: "Jane Smith",
            avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
          },
          message: "Totally agree! This channel is a goldmine of ideas.",
          createdAt: "2025-08-14T11:00:00Z",
        },
        {
          id: "1002",
          user: {
            name: "Mike Johnson",
            avatarUrl: "https://randomuser.me/api/portraits/men/50.jpg",
          },
          message: "Yes! And people here are always willing to help.",
          createdAt: "2025-08-14T11:20:00Z",
        },
        {
          id: "1009",
          user: {
            name: "Laura Wilson",
            avatarUrl: "https://randomuser.me/api/portraits/women/65.jpg",
          },
          message: "John, your last post really inspired me!",
          createdAt: "2025-08-14T12:05:00Z",
        },
      ],
    },
    {
      id: "2",
      title: "Pace of discussions",
      user: {
        name: "Emily Parker",
        avatarUrl: "https://randomuser.me/api/portraits/women/28.jpg",
      },
      message: "Great place for learning, though sometimes topics move too fast.",
      helpfulCount: 7,
      isHelpful: true,
      createdAt: "2025-08-13T09:45:00Z",
      comments: [
        {
          id: "1003",
          user: {
            name: "Chris Lee",
            avatarUrl: "https://randomuser.me/api/portraits/men/12.jpg",
          },
          message: "I agree, maybe we could have a summary thread?",
          createdAt: "2025-08-13T10:00:00Z",
        },
        {
          id: "1004",
          user: {
            name: "Anna Brown",
            avatarUrl: "https://randomuser.me/api/portraits/women/36.jpg",
          },
          message: "I can help prepare those summaries every Friday.",
          createdAt: "2025-08-13T10:30:00Z",
        },
      ],
    },
    {
      id: "3",
      title: "First project completed!",
      user: {
        name: "Daniel Green",
        avatarUrl: "https://randomuser.me/api/portraits/men/21.jpg",
      },
      message: "Just finished my first project here! Feedback welcome!",
      helpfulCount: 15,
      isHelpful: true,
      createdAt: "2025-08-12T15:30:00Z",
      comments: [
        {
          id: "1005",
          user: {
            name: "Sophia White",
            avatarUrl: "https://randomuser.me/api/portraits/women/47.jpg",
          },
          message: "Congrats Daniel! I’ll check it out.",
          createdAt: "2025-08-12T15:45:00Z",
        },
        {
          id: "1006",
          user: {
            name: "Chris Lee",
            avatarUrl: "https://randomuser.me/api/portraits/men/12.jpg",
          },
          message: "Nice work! Mind sharing the GitHub link?",
          createdAt: "2025-08-12T16:00:00Z",
        },
      ],
    },
    {
      id: "4",
      title: "Weekend hackathon plans",
      user: {
        name: "Laura Wilson",
        avatarUrl: "https://randomuser.me/api/portraits/women/65.jpg",
      },
      message: "Anyone up for a weekend hackathon?",
      helpfulCount: 4,
      isHelpful: false,
      createdAt: "2025-08-11T18:00:00Z",
      comments: [
        {
          id: "1007",
          user: {
            name: "John Doe",
            avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
          },
          message: "Count me in!",
          createdAt: "2024-07-11T18:15:00Z",
        },
        {
          id: "1008",
          user: {
            name: "Emily Parker",
            avatarUrl: "https://randomuser.me/api/portraits/women/28.jpg",
          },
          message: "That sounds fun! Where do we sign up?",
          createdAt: "2025-08-11T18:20:00Z",
        },
      ],
    },
  ];

  const renderHead = () => (
    <Box sx={{ display: "flex", alignItems: "center", py: 5 }}>
      <Typography variant="h3" sx={{ flexGrow: 1 }}>
        {t("title")}
      </Typography>
    </Box>
  );

  const renderListView = () => (
    <ChannelItemsList
      items={mockChannelItems}
      pagesCount={1}
      page={1}
      onPageChange={() => {}}
      recordsCount={mockChannelItems.length}
    />
  );

  return (
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
  );
}
