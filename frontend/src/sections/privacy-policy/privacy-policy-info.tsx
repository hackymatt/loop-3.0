import type { BoxProps } from "@mui/material/Box";

import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

// ----------------------------------------------------------------------
type IContentProps = {
  value: string;
  subsections?: ISubsectionProps[];
  link?: { url?: string; path?: string; text: string };
};

type ISubsectionProps = IContentProps;

type ISectionProps = {
  header: string;
  content: IContentProps[];
};

export function PrivacyPolicyInfo({ sx, ...other }: BoxProps) {
  const { t } = useTranslation("privacy-policy");
  const privacyPolicyContent = t("content", { returnObjects: true }) as ISectionProps[];

  const localize = useLocalizedPath();

  const renderList = () =>
    privacyPolicyContent.map((section) => (
      <Link key={section.header} href={`#${section.header}`}>
        <Typography>{section.header}</Typography>
      </Link>
    ));

  const renderSectionContent = (content: IContentProps) => {
    const value = content.value;
    const hasLink = value.includes("[link]");
    const hasSubsections = value.includes("[subsections]");

    if (hasLink) {
      const parts = value.split("[link]");
      const link = content.link!;
      const hasUrl = "url" in link;

      return (
        <Typography>
          {parts[0]}
          <Link
            target="_blank"
            rel="noopener"
            href={hasUrl ? link.url : localize(paths[link.path as keyof typeof paths] as string)}
            color="primary"
          >
            {content.link!.text}
          </Link>
          {parts[1]}
        </Typography>
      );
    }

    if (hasSubsections) {
      const parts = value.split("[subsections]");
      return (
        <Typography>
          {parts[0]}
          {content.subsections?.map((subsection) => (
            <Typography key={subsection.value} sx={{ pl: 2 }}>
              {renderSectionContent(subsection)}
            </Typography>
          ))}
          {parts[1]}
        </Typography>
      );
    }

    return <Typography>{value}</Typography>;
  };

  const renderContent = () => (
    <Box sx={{ mt: 10 }}>
      {privacyPolicyContent.map((section) => (
        <Box key={section.header}>
          <Box
            id={section.header}
            sx={{ display: "block", position: "relative", top: "-100px", hidden: "true" }}
          />
          <Box sx={{ mt: 4 }}>
            <Typography align="center" fontWeight="bold" sx={{ mb: 2 }}>
              {section.header}
            </Typography>
            <Box>{section.content.map((x) => renderSectionContent(x))}</Box>
          </Box>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box
      component="section"
      sx={[
        { pt: { xs: 3, md: 5 }, pb: { xs: 5, md: 10 }, textAlign: { xs: "center", md: "left" } },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Container>
        <Typography variant="h2" sx={{ py: { xs: 3, md: 10 } }}>
          {t("title")}
        </Typography>

        {renderList()}

        {renderContent()}
      </Container>
    </Box>
  );
}
