import type { Metadata } from "next";

import { paths } from "src/routes/paths";

import { createMetadata } from "src/utils/create-metadata";

import { URLS } from "src/api/urls";
import { CONFIG } from "src/global-config";
import { LANGUAGE } from "src/consts/language";

import { PostView } from "src/sections/view/post-view";

// ----------------------------------------------------------------------

export default function Page({ params }: { params: { slug: string } }) {
  return <PostView slug={params.slug} />;
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const translations = await import(`public/locales/${params.locale}/blog.json`);

  const path = params.locale === LANGUAGE.PL ? paths.posts : `/${LANGUAGE.EN}${paths.posts}`;
  try {
    const res = await fetch(`${CONFIG.api}${URLS.POSTS}/${params.slug}`, {
      headers: { "Content-Type": "application/json", "Accept-Language": params.locale },
    });

    if (!res.ok) throw new Error("Failed to fetch post");

    const post = await res.json();

    const { translated_name: name, image: heroUrl } = post;

    const title = translations.meta.post.title.replace("[name]", name);
    const description = translations.meta.post.description.replace("[name]", name);
    const coverUrl = heroUrl;

    return createMetadata({
      title,
      description,
      path: `${path}/${params.slug}`,
      image: coverUrl,
    });
  } catch {
    return createMetadata({
      title: translations.meta.post.title,
      description: translations.meta.post.description,
      path: `${path}/${params.slug}`,
    });
  }
}
