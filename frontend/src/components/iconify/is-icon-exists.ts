import { loadIcons, iconExists } from "@iconify/react";

export function isIconExists(iconName: string) {
  if (iconExists(iconName)) {
    return true;
  }

  try {
    loadIcons([iconName]);
    return isIconExists(iconName);
  } catch {
    return false;
  }
}
