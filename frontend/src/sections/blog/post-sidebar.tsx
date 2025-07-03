import type { BoxProps } from "@mui/material/Box";
import type { Theme, SxProps } from "@mui/material/styles";
import type { IBlogTagProp, IBlogTopicProp, IBlogRecentProps } from "src/types/blog";

import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { Stack, Checkbox, FormControlLabel } from "@mui/material";

import { useQueryParams } from "src/hooks/use-query-params";

import { PostItemMobile } from "./post-item-mobile";

// ----------------------------------------------------------------------

type PostSidebarProps = BoxProps & {
  tags: IBlogTagProp[];
  recentPosts: IBlogRecentProps[];
  categories: IBlogTopicProp[];
  slots?: {
    topNode?: React.ReactNode;
    bottomNode?: React.ReactNode;
  };
  slotProps?: {
    tags?: SxProps<Theme>;
    categories?: SxProps<Theme>;
    recentPosts?: SxProps<Theme>;
  };
};

export function PostSidebar({
  sx,
  tags,
  slots,
  slotProps,
  categories,
  recentPosts,
  ...other
}: PostSidebarProps) {
  const { t } = useTranslation("blog");

  const { query, handleChange } = useQueryParams();

  const renderCategories = () => {
    const currentValue = query?.category ?? "";
    return (
      !!categories?.length && (
        <Box sx={slotProps?.categories}>
          <Typography variant="h5">{t("categories")}</Typography>

          <Stack spacing={0.5} alignItems="flex-start" mt={1}>
            {categories.map((category) => {
              const isSelected = currentValue.includes(category.slug);
              return (
                <FormControlLabel
                  key={category.slug}
                  value={category}
                  control={
                    <Checkbox
                      color="error"
                      value={category}
                      checked={isSelected}
                      onChange={() =>
                        currentValue !== category.slug
                          ? handleChange("category", category.slug)
                          : handleChange("category", "")
                      }
                      sx={{ display: "none" }}
                    />
                  }
                  label={
                    <Box key={category.slug} gap={2} display="flex" alignItems="center">
                      <Box
                        component="span"
                        sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.main" }}
                      />

                      {category.name}
                    </Box>
                  }
                  sx={{
                    m: 0,
                    fontWeight: "fontWeightSemiBold",
                    "&:hover": { color: "primary.main" },
                    ...(category.slug === currentValue && {
                      color: "primary.main",
                    }),
                  }}
                />
              );
            })}
          </Stack>
        </Box>
      )
    );
  };

  const renderRecentPosts = () =>
    !!recentPosts?.length && (
      <Box sx={slotProps?.recentPosts}>
        <Typography variant="h5">{t("recentPosts")}</Typography>

        {recentPosts.map((post) => (
          <PostItemMobile key={post.slug} post={post} onSidebar sx={{ mt: 2 }} />
        ))}
      </Box>
    );

  const renderPopularTags = () => {
    const currentValue = query?.tags;
    const currentTags = currentValue ? currentValue.split(",") : [];

    const getSelected = (selectedItems: string[], item: string) =>
      selectedItems.includes(item)
        ? selectedItems.filter((value) => value !== item)
        : [...selectedItems, item];

    return (
      !!tags?.length && (
        <Box sx={slotProps?.tags}>
          <Typography variant="h5">{t("popularTags")}</Typography>

          <Box sx={{ mt: 2, gap: 1, display: "flex", flexWrap: "wrap" }}>
            {tags.map((tag) => {
              const isSelected = currentTags.includes(tag.slug);
              return (
                <Chip
                  key={tag.slug}
                  label={tag.name}
                  variant={isSelected ? "filled" : "outlined"}
                  size="small"
                  component="a"
                  clickable
                  onClick={() => {
                    handleChange("tags", getSelected(currentTags, tag.slug).join(","));
                  }}
                />
              );
            })}
          </Box>
        </Box>
      )
    );
  };

  return (
    <>
      {slots?.topNode}

      <Box
        sx={[
          {
            gap: 5,
            display: "flex",
            flexDirection: "column",
            pb: { xs: 10, md: 0 },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        {renderCategories()}
        {renderRecentPosts()}
        {renderPopularTags()}

        {slots?.bottomNode}
      </Box>
    </>
  );
}
