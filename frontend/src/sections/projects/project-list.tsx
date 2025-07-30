import type { BoxProps } from "@mui/material/Box";
import type { IProjectListProps } from "src/types/project";

import Box from "@mui/material/Box";
import Pagination, { paginationClasses } from "@mui/material/Pagination";

import { ProjectItem } from "./project-item";

// ----------------------------------------------------------------------

type Props = BoxProps & {
  projects: IProjectListProps[];
  recordsCount: number;
  pagesCount: number;
  page: number;
  onPageChange: (selectedPage: number) => void;
};

export function ProjectList({
  projects,
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
          { gap: 4, display: "flex", flexDirection: "column" },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        {projects.map((project) => (
          <ProjectItem key={project.slug} project={project} />
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
