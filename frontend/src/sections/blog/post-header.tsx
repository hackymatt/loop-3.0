import type { BoxProps } from "@mui/material/Box";
import type { IBlogTopicProp } from "src/types/blog";
import type { Theme, SxProps } from "@mui/material/styles";

import Box from "@mui/material/Box";

// ----------------------------------------------------------------------

type PostHeaderProps = BoxProps & {
  category: IBlogTopicProp;
  duration: number;
  publishedAt: string;
  sx?: SxProps<Theme>;
};

export function PostHeader({ publishedAt, category, duration, sx, ...other }: PostHeaderProps) {
  return (
    <Box
      sx={[
        {
          flexWrap: "wrap",
          display: "flex",
          alignItems: "center",
          typography: "caption",
          color: "text.disabled",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {publishedAt}
      <Box
        component="span"
        sx={{
          mx: 1,
          width: 4,
          height: 4,
          borderRadius: "50%",
          backgroundColor: "currentColor",
        }}
      />
      {duration} min
      <Box
        component="span"
        sx={{
          mx: 1,
          width: 4,
          height: 4,
          borderRadius: "50%",
          backgroundColor: "currentColor",
        }}
      />
      {category.name}
    </Box>
  );
}
