import type { CSSObject } from "@mui/material/styles";

// ----------------------------------------------------------------------

export const visuallyHidden: CSSObject = {
  border: 0,
  padding: 0,
  width: "1px",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  clip: "rect(0 0 0 0)",
};
