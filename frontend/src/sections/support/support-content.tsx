import { useState, useCallback } from "react";

import Accordion from "@mui/material/Accordion";
import Typography from "@mui/material/Typography";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

import { Iconify } from "src/components/iconify";

// ----------------------------------------------------------------------

type Props = {
  contents: {
    question: string;
    answer: string;
  }[];
};

export function SupportContent({ contents }: Props) {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChangeExpanded = useCallback(
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    },
    []
  );

  return (
    <div>
      {contents.map((faq, index) => (
        <Accordion
          key={index}
          expanded={expanded === faq.question}
          onChange={handleChangeExpanded(faq.question)}
        >
          <AccordionSummary>
            <Typography variant="subtitle1" sx={{ pr: 1, flexGrow: 1 }}>
              {faq.question}
            </Typography>

            <Iconify
              icon={expanded === faq.question ? "eva:minus-outline" : "eva:plus-outline"}
              sx={{ transform: "translateY(2px)" }}
            />
          </AccordionSummary>

          <AccordionDetails sx={{ color: "text.secondary" }}>{faq.answer}</AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}
