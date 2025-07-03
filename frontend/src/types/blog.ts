import type { DatePickerFormat } from "src/utils/format-time";

import type { IInstructorProps } from "./user";

// ----------------------------------------------------------------------

export type IBlogTopicProp = {
  slug: string;
  name: string;
};

export type IBlogTagProp = {
  slug: string;
  name: string;
};

export type IBlogAuthorListProps = IInstructorProps;

export type IBlogAuthorProps = IInstructorProps;

type IBlogBaseProps = {
  name: string;
  slug: string;
  category: IBlogTopicProp;
  heroUrl: string;
  publishedAt: DatePickerFormat;
  // calculated
  duration: number;
};

export type IBlogListProps = IBlogBaseProps & { description: string; author: IBlogAuthorListProps };

export type IBlogRecentProps = IBlogBaseProps;

export type IBlogFeaturedPost = IBlogListProps;

type IBlogNavigationProps = {
  slug: string;
  name: string;
  heroUrl: string;
};

export type IBlogProps = IBlogBaseProps & {
  description: string;
  author: IBlogAuthorProps;
  tags: IBlogTagProp[];
  content: string;
  // calculated
  prevPost: IBlogNavigationProps | null;
  nextPost: IBlogNavigationProps | null;
};
