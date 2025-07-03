import { CONFIG } from "src/global-config";

import { _mock } from "./_mock";
import { _tags } from "./assets";

// ----------------------------------------------------------------------

const content = (name: string) => `
<p>Pellentesque posuere. Phasellus a est. Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat nibh, nec pellentesque velit pede quis nunc.</p>

<p>Pellentesque posuere. Phasellus a est. Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat nibh, nec pellentesque velit pede quis nunc. Phasellus viverra nulla ut metus varius laoreet. Praesent egestas tristique nibh. Donec posuere vulputate arcu. Quisque rutrum.</p>

<p>Donec posuere vulputate arcu. Quisque rutrum. Curabitur vestibulum aliquam leo. Nam commodo suscipit quam. Vestibulum ullamcorper mauris at ligula.</p>

<p>Pellentesque posuere. Phasellus a est. Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat nibh, nec pellentesque velit pede quis nunc. Phasellus viverra nulla ut metus varius laoreet. Praesent egestas tristique nibh.</p>

<p><img alt="Marketing image 1" src='${CONFIG.assetsDir}/assets/images/${name}/${name}-large-2.webp' /></p>

<h4>Curabitur suscipit suscipit tellus</h4>

<p>Donec posuere vulputate arcu. Quisque rutrum. Curabitur vestibulum aliquam leo. Nam commodo suscipit quam. Vestibulum ullamcorper mauris at ligula.</p>

<h4>Nullam accumsan lorem in</h4>

<p>Donec posuere vulputate arcu. Quisque rutrum. Curabitur vestibulum aliquam leo. Nam commodo suscipit quam. Vestibulum ullamcorper mauris at ligula.</p>

<p>Donec posuere vulputate arcu. Quisque rutrum. Curabitur vestibulum aliquam leo.</p>

<p><img alt="Marketing image 2" src='${CONFIG.assetsDir}/assets/images/${name}/${name}-large-3.webp' /></p>

<p>Donec posuere vulputate arcu. Quisque rutrum. Curabitur vestibulum aliquam leo. Nam commodo suscipit quam. Vestibulum ullamcorper mauris at ligula.</p>

<p>Pellentesque posuere. Phasellus a est. Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat nibh, nec pellentesque velit pede quis nunc. Phasellus viverra nulla ut metus varius laoreet. Praesent egestas tristique nibh.</p>

<p>Donec posuere vulputate arcu. Quisque rutrum. Curabitur vestibulum aliquam leo. Nam commodo suscipit quam. Vestibulum ullamcorper mauris at ligula.</p>
`;

function slugify(text: string): string {
  return text
    .toLowerCase() // Zamiana na małe litery
    .normalize("NFD") // Normalizacja znaków diakrytycznych
    .replace(/[\u0300-\u036f]/g, "") // Usunięcie akcentów
    .replace(/[^a-z0-9\s-]/g, "") // Usunięcie znaków specjalnych
    .replace(/\s+/g, "-") // Zamiana spacji na myślniki
    .replace(/-+/g, "-") // Usunięcie wielokrotnych myślników
    .trim(); // Usunięcie zbędnych spacji na początku i końcu
}

const base = (index: number) => ({
  id: _mock.id(index),
  category: { slug: "marketing", name: "Marketing" },
  duration: 8,
  name: _mock.postTitle(index),
  slug: slugify(_mock.postTitle(index)),
  description: _mock.description(index),
  tags: _tags.slice(index + 1, index + 2).map((tag) => ({ slug: slugify(tag), name: tag })),
  publishedAt: "2024-08-12T16:00:00.000Z",
  author: {
    name: _mock.fullName(index),
    role: _mock.role(index),
    avatarUrl: _mock.image.avatar(index),
    quotes: "Member since Mar 15, 2021",
    about:
      "Integer tincidunt. Nullam dictum felis eu pede mollis pretium. Maecenas ullamcorper, dui et placerat feugiat, eros pede varius nisi, condimentum viverra felis nunc et lorem.",
  },
});

// ----------------------------------------------------------------------

export const _marketingPosts = Array.from({ length: 12 }, (_, index) => ({
  ...base(index),
  content: content("marketing"),
  coverUrl: _mock.image.marketing(index),
  heroUrl: `${CONFIG.assetsDir}/assets/images/marketing/marketing-large-1.webp`,
}));

export const _travelPosts = Array.from({ length: 12 }, (_, index) => ({
  ...base(index),
  content: content("travel"),
  coverUrl: _mock.image.travel(index),
  heroUrl: `${CONFIG.assetsDir}/assets/images/travel/travel-large-1.webp`,
}));

export const _careerPosts = Array.from({ length: 12 }, (_, index) => ({
  ...base(index),
  content: content("career"),
  coverUrl: _mock.image.career(index),
  heroUrl: `${CONFIG.assetsDir}/assets/images/career/career-large-1.webp`,
}));

export const _coursePosts = Array.from({ length: 12 }, (_, index) => ({
  ...base(index),
  content: content("course"),
  heroUrl: _mock.image.course(index),
  prevPost:
    index === 0
      ? null
      : {
          slug: base(index - 1).slug,
          name: base(index - 1).name,
          heroUrl: `${CONFIG.assetsDir}/assets/images/career/career-large-1.webp`,
        },
  nextPost:
    index === 2
      ? null
      : {
          slug: base(index + 1).slug,
          name: base(index + 1).name,
          heroUrl: `${CONFIG.assetsDir}/assets/images/career/career-large-1.webp`,
        },
}));
