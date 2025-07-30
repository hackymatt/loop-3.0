import type { Variants } from "framer-motion";
import type { BoxProps } from "@mui/material/Box";
import type { IBlogRecentProps, IBlogFeaturedPost } from "src/types/blog";

import { m } from "framer-motion";

import { Container } from "@mui/material";

import { varFade, MotionViewport } from "src/components/animate";

import { LatestPosts } from "../posts/latest-posts";

// ----------------------------------------------------------------------

const variants: Variants = varFade("inUp", { distance: 24 });

type Props = BoxProps & {
  featuredPost: IBlogFeaturedPost;
  recentPosts: IBlogRecentProps[];
};

export function HomeLatestPosts({ featuredPost, recentPosts, sx, ...other }: Props) {
  return (
    <Container component={MotionViewport}>
      <m.div variants={variants}>
        <LatestPosts largePost={featuredPost} smallPosts={recentPosts} sx={sx} {...other} />
      </m.div>
    </Container>
  );
}
