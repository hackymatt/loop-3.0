import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import { Button } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Tab, { tabClasses } from "@mui/material/Tab";
import Tabs, { tabsClasses } from "@mui/material/Tabs";

import { Iconify } from "src/components/iconify";
import { Scrollbar } from "src/components/scrollbar";

import type { IFaqProps } from "./types";

// ----------------------------------------------------------------------

type IData = Omit<IFaqProps, "content"> & {
  content: React.ReactNode;
};

type Props = {
  open: boolean;
  topic: string;
  onClose: () => void;
  data: IData[];
  onChangeTopic: (event: React.SyntheticEvent, newValue: string) => void;
};

export function SupportNav({ topic, data, onChangeTopic, open, onClose }: Props) {
  const { t } = useTranslation("faq");
  const { t: contact } = useTranslation("contact");

  const renderItems = () => (
    <Tabs
      value={topic}
      onChange={onChangeTopic}
      orientation="vertical"
      sx={{ [`& .${tabsClasses.flexContainer}`]: { gap: 0 } }}
    >
      {data.map((item) => (
        <Tab
          key={item.id}
          value={item.id}
          label={item.title}
          icon={
            <Iconify icon={item.icon} sx={{ width: 28, height: 28, color: "secondary.main" }} />
          }
          sx={{
            gap: 1,
            typography: "body2",
            justifyContent: "flex-start",
            [`& .${tabClasses.selected}`]: {
              typography: "subtitle2",
              fontWeight: "fontWeightBold",
            },
          }}
        />
      ))}
    </Tabs>
  );

  const renderInfo = () => (
    <>
      <Typography component="h6" variant="h6" sx={{ mb: 1 }}>
        {t("moreQuestions.title")}
      </Typography>

      <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
        {t("moreQuestions.subtitle")}
      </Typography>

      <SupportButton href="mailto:info@loop.edu.pl">
        <Iconify width={24} icon="carbon:email" />
        {contact("emailLabel")}
      </SupportButton>

      <SupportButton href="tel:+48881455596">
        <Iconify width={24} icon="solar:smartphone-outline" />
        {contact("phoneLabel")}
        <Box component="span" sx={{ ml: -1, color: "primary.main" }}>
          881-455-596
        </Box>
      </SupportButton>
    </>
  );

  return (
    <>
      <Box
        sx={(theme) => ({
          width: 280,
          flexShrink: 0,
          flexDirection: "column",
          display: { xs: "none", md: "flex" },
          borderRight: `solid 1px ${theme.vars.palette.divider}`,
        })}
      >
        {renderItems()}
        <Box sx={{ mt: 3, pr: 5 }}>{renderInfo()}</Box>
      </Box>

      <Drawer open={open} onClose={onClose} PaperProps={{ sx: { width: 280 } }}>
        <Scrollbar>
          <Box sx={{ pt: 2, pl: 2 }}>{renderItems()}</Box>

          <Box sx={{ p: 2.5 }}>{renderInfo()}</Box>
        </Scrollbar>
      </Drawer>
    </>
  );
}

// ----------------------------------------------------------------------

const SupportButton = styled(Button)(({ theme }) => ({
  ...theme.typography.subtitle2,
  width: "100%",
  alignItems: "center",
  gap: theme.spacing(1.5),
  justifyContent: "flex-start",
  padding: theme.spacing(1.5, 2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: `solid 1px ${theme.vars.palette.divider}`,
}));
