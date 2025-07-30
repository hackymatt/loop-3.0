import { CONFIG } from "src/global-config";

// ----------------------------------------------------------------------

type Props = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

export const createMetadata = ({ title, description, path, image }: Props) => {
  const { appName: name } = CONFIG;

  return {
    title: `${title} • ${name}`,
    description,
    alternates: {
      canonical: `https://loop.edu.pl${path}`,
    },
    openGraph: {
      type: "website",
      url: `https://loop.edu.pl${path}`,
      images: image ?? "https://loop.edu.pl/logo/logo.svg",
      title: `${title} • ${name}`,
      description,
    },
  };
};
