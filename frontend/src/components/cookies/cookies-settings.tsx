import type { DialogProps } from "@mui/material/Dialog";

import { useForm } from "react-hook-form";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import {
  Stack,
  Switch,
  Accordion,
  Typography,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";

import { useCookiesTypes } from "src/hooks/use-cookies-types";

import { Form } from "../hook-form";
import { Iconify } from "../iconify";

// ----------------------------------------------------------------------

interface Props extends DialogProps {
  onConfirm: (cookies: { [cookie: string]: boolean }) => void;
}

// ----------------------------------------------------------------------

export function CookiesSettings({ onConfirm, ...other }: Props) {
  const { t } = useTranslation("cookies");
  const methods = useForm();
  const { cookies, defaultCookies } = useCookiesTypes();

  const [settings, setSettings] = useState<{ [cookie: string]: boolean }>(defaultCookies);
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChangeExpanded = useCallback(
    (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    },
    []
  );

  const handleToggle = (type: string) => {
    setSettings((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const allCookies = Object.keys(defaultCookies).reduce(
    (acc, key) => {
      acc[key] = true;
      return acc;
    },
    {} as { [cookie: string]: boolean }
  );

  return (
    <Dialog
      disableEscapeKeyDown
      fullWidth
      maxWidth="sm"
      scroll="body"
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: "background.paper",
          boxShadow: 24,
          p: 2,
        },
      }}
      {...other}
    >
      <Form methods={methods}>
        <DialogTitle sx={{ typography: "h6", pb: 3 }}>{t("text.manage")}</DialogTitle>

        <DialogContent sx={{ py: 0, typography: "body2" }}>
          {cookies.map((cookie, index) => (
            <Accordion
              key={index}
              expanded={expanded === cookie.title}
              onChange={handleChangeExpanded(cookie.title)}
            >
              <AccordionSummary
                expandIcon={<Iconify icon="eva:chevron-down-fill" />}
                sx={{
                  px: 2,
                  py: 1.5,
                  "& .MuiAccordionSummary-content": {
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  },
                }}
              >
                <Switch
                  checked={settings[cookie.type]}
                  disabled={cookie.disabled}
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleToggle(cookie.type);
                  }}
                />

                <Typography variant="subtitle2">{cookie.title}</Typography>

                <Typography variant="caption" sx={{ color: "text.disabled", flexGrow: 1 }}>
                  {cookie.disabled ? t("text.mandatory") : t("text.optional")}
                </Typography>
              </AccordionSummary>

              <AccordionDetails sx={{ color: "text.secondary" }}>
                {cookie.description}
              </AccordionDetails>
            </Accordion>
          ))}
        </DialogContent>

        <DialogActions sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ width: "100%", justifyContent: "space-between" }}
          >
            <Button variant="outlined" onClick={() => onConfirm(allCookies)}>
              {t("button.acceptAll")}
            </Button>
            <Button variant="contained" onClick={() => onConfirm(settings)}>
              {t("button.acceptSelected")}
            </Button>
          </Stack>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
