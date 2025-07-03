import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { LANGUAGE } from "src/consts/language";

import { PostsView } from "src/sections/view/posts-view";

// ----------------------------------------------------------------------

export default function Page() {
  return <PostsView />;
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const translations = await import(`public/locales/${params.locale}/blog.json`);

  const path = params.locale === LANGUAGE.PL ? paths.posts : `/${LANGUAGE.EN}${paths.posts}`;

  return createMetadata({
    title: translations.meta.posts.title,
    description: translations.meta.posts.description,
    path,
  });
}
