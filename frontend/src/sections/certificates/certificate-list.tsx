import type { BoxProps } from "@mui/material/Box";
import type { ICertificateProps } from "src/types/certificate";

import Box from "@mui/material/Box";
import Pagination, { paginationClasses } from "@mui/material/Pagination";

import { CertificateItem } from "./certificate-item";

// ----------------------------------------------------------------------

type Props = BoxProps & {
  certificates: ICertificateProps[];
  recordsCount: number;
  pagesCount: number;
  page: number;
  onPageChange: (selectedPage: number) => void;
};

export function CertificateList({
  certificates,
  recordsCount,
  pagesCount,
  page,
  onPageChange,
  sx,
  ...other
}: Props) {
  return (
    <>
      <Box
        sx={[
          {
            gap: 4,
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        {certificates.map((certificate) => (
          <CertificateItem key={certificate.id} certificate={certificate} />
        ))}
      </Box>

      {recordsCount ? (
        <Pagination
          count={pagesCount}
          page={page}
          onChange={(event, selectedPage: number) => onPageChange(selectedPage)}
          sx={{ my: 10, [`& .${paginationClasses.ul}`]: { justifyContent: "center" } }}
        />
      ) : null}
    </>
  );
}
