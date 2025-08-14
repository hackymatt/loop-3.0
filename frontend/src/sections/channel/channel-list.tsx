import type { IChannelItemProp } from "src/types/channel";

import { Fragment } from "react";

import { Box, Card, Divider } from "@mui/material";
import Pagination, { paginationClasses } from "@mui/material/Pagination";

import { ChannelItem } from "./channel-item";

// ----------------------------------------------------------------------

type Props = {
  items: IChannelItemProp[];
  recordsCount: number;
  pagesCount: number;
  page: number;
  onPageChange: (selectedPage: number) => void;
};

export function ChannelItemsList({ items, recordsCount, pagesCount, page, onPageChange }: Props) {
  const renderReplyComments = (comments: IChannelItemProp["comments"]) =>
    comments.map((comment) => (
      <ChannelItem
        key={comment.id}
        createdAt={comment.createdAt}
        message={comment.message}
        user={comment.user}
        hasReply
      />
    ));

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {items.map((item) => (
          <Card
            key={item.id}
            sx={{
              p: 3,
            }}
          >
            <ChannelItem
              user={item.user}
              createdAt={item.createdAt}
              title={item.title}
              message={item.message}
              helpfulCount={item.helpfulCount}
              isHelpful={item.isHelpful}
            />

            <Divider sx={{ ml: "auto" }} />

            {!!item.comments.length && renderReplyComments(item.comments)}
          </Card>
        ))}
      </Box>

      {recordsCount ? (
        <Pagination
          count={pagesCount}
          page={page}
          onChange={(event, selectedPage: number) => onPageChange(selectedPage)}
          sx={{ my: 10, [`& .${paginationClasses.ul}`]: { justifyContent: "center" } }}
        />
      ) : null}
    </>
  );
}
