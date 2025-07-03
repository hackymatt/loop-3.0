import type { BoxProps } from "@mui/material/Box";

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Accordion from "@mui/material/Accordion";
import Typography from "@mui/material/Typography";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";

import { paths } from "src/routes/paths";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { useAnalytics } from "src/app/analytics-provider";

import { Iconify } from "src/components/iconify";

// ----------------------------------------------------------------------

type IFaq = {
  question: string;
  answer: string | React.ReactNode;
};

type Props = {
  data: IFaq[];
} & BoxProps;

export function Faqs({ data, sx, ...other }: Props) {
  const { t } = useTranslation("faq");

  const localize = useLocalizedPath();

  const { trackEvent } = useAnalytics();

  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChangeExpanded = useCallback(
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    },
    []
  );

  const renderTexts = () => (
    <Typography variant="h2" sx={{ textAlign: "center" }}>
      {t("title")}
    </Typography>
  );

  const renderList = () => (
    <Box sx={{ my: { xs: 5, md: 10 } }}>
      {data.map((faq) => (
        <Accordion
          key={faq.question}
          expanded={expanded === faq.question}
          onChange={handleChangeExpanded(faq.question)}
        >
          <AccordionSummary>
            <Typography variant="h6" sx={{ pr: 1, flexGrow: 1 }}>
              {faq.question}
            </Typography>

            <Iconify
              icon={expanded === faq.question ? "eva:minus-outline" : "eva:plus-outline"}
              sx={{ transform: "translateY(4px)" }}
            />
          </AccordionSummary>

          <AccordionDetails sx={{ color: "text.secondary" }}>{faq.answer}</AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );

  return (
    <Box
      component="section"
      sx={[{ position: "relative", py: { xs: 5, md: 10 } }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <Container>
        <Grid container spacing={{ md: 3 }} sx={{ justifyContent: "center" }}>
          <Grid size={{ xs: 12, md: 8 }}>
            {renderTexts()}
            {renderList()}

            <Box
              sx={(theme) => ({
                gap: 3,
                display: "flex",
                borderRadius: 3,
                textAlign: "center",
                alignItems: "center",
                flexDirection: "column",
                px: { xs: 3, md: 5 },
                py: { xs: 6, md: 8 },
                border: `dashed 1px ${theme.vars.palette.divider}`,
              })}
            >
              <div>
                <Typography component="h6" variant="h3">
                  {t("moreQuestions.title")}
                </Typography>
              </div>

              <div>
                <Typography sx={{ color: "text.secondary" }}>
                  {t("moreQuestions.subtitle")}
                </Typography>
              </div>

              <div>
                <Button
                  size="large"
                  color="inherit"
                  variant="contained"
                  href={localize(paths.contact)}
                  onClick={() => trackEvent({ category: "contact", label: "moreQuestions" })}
                >
                  {t("moreQuestions.button")}
                </Button>
              </div>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
