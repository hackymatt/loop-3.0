import type { ICertificateProps } from "src/types/certificate";

import Card from "@mui/material/Card";
import Link from "@mui/material/Link";

import { paths } from "src/routes/paths";
import { RouterLink } from "src/routes/components";

import { useLocalizedPath } from "src/hooks/use-localized-path";

import { Certificate } from "./certificate";

// ----------------------------------------------------------------------

type Props = {
  certificate: ICertificateProps;
};

export function CertificateItem({ certificate }: Props) {
  const localize = useLocalizedPath();

  return (
    <Link
      component={RouterLink}
      href={localize(`${paths.certificate}/${certificate.id}`)}
      color="inherit"
      underline="none"
    >
      <Card
        sx={(theme) => ({
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          "&:hover": { boxShadow: theme.vars.customShadows.z24 },
        })}
      >
        <Certificate
          courseName={certificate.courseName}
          studentName={certificate.studentName}
          completedAt={certificate.completedAt}
        />
      </Card>
    </Link>
  );
}
