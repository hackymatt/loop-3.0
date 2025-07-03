import { isIconExists } from "src/components/iconify";

export function getTechnologyIcon(technology: string): string {
  const defaultIcon = isIconExists(`logos:${technology}-icon`)
    ? `logos:${technology}-icon`
    : `logos:${technology}`;
  return isIconExists(defaultIcon) ? defaultIcon : "carbon:code";
}
