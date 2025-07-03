import type { Language } from "src/locales/types";
import type { IconButtonProps } from "@mui/material/IconButton";

import { usePopover } from "minimal-shared/hooks";
import { useQueryClient } from "@tanstack/react-query";

import Popover from "@mui/material/Popover";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";

import { useRouter, usePathname } from "src/routes/hooks";

import { LANGUAGE } from "src/consts/language";

import { FlagIcon } from "src/components/flag-icon";
import { useSettingsContext } from "src/components/settings";

// ----------------------------------------------------------------------

export type LanguagePopoverProps = IconButtonProps & {
  data?: {
    value: Language;
    label: string;
    countryCode: string;
  }[];
};

export function LanguagePopover({ data = [], sx, ...other }: LanguagePopoverProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const settings = useSettingsContext();
  const { open, onClose, onOpen, anchorEl } = usePopover();

  const currentLang = data.find((lang) => lang.value === settings.state.language);

  const handleChangeLang = (newLang: Language) => {
    const segments = pathname.split("/");
    const locales = Object.values(LANGUAGE);

    settings.setField("language", newLang);
    queryClient.invalidateQueries();

    if (newLang === LANGUAGE.PL) {
      if (segments.length > 1 && locales.includes(segments[1] as Language)) {
        segments.splice(1, 1);
      }
    } else {
      if (locales.includes(segments[1] as Language)) {
        segments[1] = newLang;
      } else {
        segments.splice(1, 0, newLang);
      }
    }

    router.push(segments.join("/") || "/");
  };

  const renderButton = () => (
    <IconButton
      onClick={onOpen}
      sx={[
        {
          p: 0,
          width: 40,
          height: 40,
          ...(open && { bgcolor: "action.selected" }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <FlagIcon code={currentLang?.countryCode} />
    </IconButton>
  );

  const renderMenuList = () => (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      transformOrigin={{ vertical: "top", horizontal: "center" }}
      disableScrollLock
    >
      <MenuList sx={{ width: 160, minHeight: 72 }}>
        {data?.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === currentLang?.value}
            onClick={() => handleChangeLang(option.value as Language)}
            sx={{ gap: 2 }}
          >
            <FlagIcon code={option.countryCode} />
            {option.label}
          </MenuItem>
        ))}
      </MenuList>
    </Popover>
  );

  return (
    <>
      {renderButton()}
      {renderMenuList()}
    </>
  );
}
