import type { Language } from "src/locales/types";
import type { IChannelItemProp } from "src/types/channel";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Box, Card, Button, Divider } from "@mui/material";
import Pagination, { paginationClasses } from "@mui/material/Pagination";

import { usePluralize } from "src/hooks/use-pluralize";

import { fShortenNumber } from "src/utils/format-number";

import { ChannelItem } from "./channel-item";

// ----------------------------------------------------------------------

type Props = {
  language: Language;
  slug: string;
  items: IChannelItemProp[];
  recordsCount: number;
  pagesCount: number;
  page: number;
  onPageChange: (selectedPage: number) => void;
};

export function ChannelItemsList({
  language,
  slug,
  items,
  recordsCount,
  pagesCount,
  page,
  onPageChange,
}: Props) {
  const { t: locale } = useTranslation("locale");
  const { t } = useTranslation("channel");
  const show = t("showAll", { returnObjects: true }) as string[];

  const [showAll, setShowAll] = useState<Record<string, boolean>>();
  const languagePluralize = usePluralize();

  const renderShowAllComments = (id: string, totalComments: number) => {
    const currentValue = showAll?.[id] || false;
    if (totalComments > 2 && !currentValue) {
      return (
        <Box sx={{ mt: 1 }}>
          <Button
            variant="text"
            size="small"
            color="primary"
            onClick={() => setShowAll((prev) => ({ ...prev, [id]: !currentValue }))}
          >
            {languagePluralize(show, totalComments - 2).replace(
              "[comments]",
              fShortenNumber(totalComments - 2, {
                code: locale("code"),
              })
            )}
          </Button>
        </Box>
      );
    }
    return null;
  };

  const renderReplyComments = (id: string, comments: IChannelItemProp["comments"]) =>
    comments.map((comment) => (
      <ChannelItem
        key={comment.id}
        language={language}
        id={id}
        commentId={comment.id}
        slug={slug}
        createdAt={comment.createdAt}
        message={comment.message}
        student={comment.student}
        isMine={comment.isMine}
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
        {items.map((item) => {
          const lastTwo = item.comments.slice(-2);
          const commentsToRender = showAll?.[item.id] || false ? item.comments : lastTwo;
          return (
            <Card
              key={item.id}
              sx={{
                p: 3,
              }}
            >
              <ChannelItem
                language={language}
                slug={slug}
                id={item.id}
                student={item.student}
                createdAt={item.createdAt}
                title={item.title}
                message={item.message}
                helpfulCount={item.helpfulCount}
                isHelpful={item.isHelpful}
                isMine={item.isMine}
              />

              {!!item.comments.length && (
                <>
                  <Divider sx={{ mb: 2 }} />
                  {renderShowAllComments(item.id, item.comments.length)}
                  {renderReplyComments(item.id, commentsToRender)}
                </>
              )}
            </Card>
          );
        })}
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
