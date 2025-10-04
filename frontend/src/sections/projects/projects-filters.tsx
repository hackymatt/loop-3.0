import type { IPlanProps } from "src/types/plan";
import type { BoxProps } from "@mui/material/Box";
import type {
  IProjectTagProp,
  IProjectLevelProp,
  IProjectStatusProp,
  IProjectCategoryProp,
  IProjectDurationProp,
  IProjectTechnologyProp,
} from "src/types/project";

import { useTranslation } from "react-i18next";
import { useBoolean } from "minimal-shared/hooks";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Rating from "@mui/material/Rating";
import Collapse from "@mui/material/Collapse";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import { Chip, Stack, Button } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";

import { useQueryParams } from "src/hooks/use-query-params";

import { Iconify } from "src/components/iconify";
import { useUserContext } from "src/components/user";

// ----------------------------------------------------------------------

type FiltersProps = {
  open: boolean;
  onClose: () => void;
  options: {
    levels: IProjectLevelProp[];
    technologies: IProjectTechnologyProp[];
    categories: IProjectCategoryProp[];
    durations: IProjectDurationProp[];
    ratings: string[];
    statuses: IProjectStatusProp[];
    tags: IProjectTagProp[];
    plans: IPlanProps[];
  };
};

export function ProjectsFilters({ open, onClose, options }: FiltersProps) {
  const { t } = useTranslation("project");

  const showAll = useBoolean(false);

  const { handleChange, query } = useQueryParams();

  const user = useUserContext();
  const { isLoggedIn } = user.state;

  const getSelected = (selectedItems: string[], item: string) =>
    selectedItems.includes(item)
      ? selectedItems.filter((value) => value !== item)
      : [...selectedItems, item];

  const renderContent = () => {
    const levels = query?.levels;
    const currentLevels = levels ? levels.split(",") : [];

    const technologies = query?.technologies;
    const currentTechnologies = technologies ? technologies.split(",") : [];

    const categories = query?.categories;
    const currentCategories = categories ? categories.split(",") : [];

    const currentDuration = query?.duration ?? "";

    const currentRating = query?.rating ?? "";

    const currentStatus = query?.status ?? "";

    const tags = query?.tags;
    const currentTags = tags ? tags.split(",") : [];
    const visibleTags = showAll.value ? options.tags : options.tags.slice(0, 10);

    const plans = query?.plans;
    const currentPlans = plans ? plans.split(",") : [];

    return (
      <>
        {options.levels?.length > 0 ? (
          <Block title={t("filter.level")}>
            <Box sx={{ display: "flex", flexDirection: "column", pt: 1 }}>
              {options.levels.map((option) => {
                const isSelected = currentLevels.includes(option.slug);
                return (
                  <FormControlLabel
                    key={option.slug}
                    control={
                      <Checkbox
                        size="small"
                        value={option}
                        checked={isSelected}
                        onChange={() => {
                          handleChange("levels", getSelected(currentLevels, option.slug).join(","));
                        }}
                        inputProps={{ id: `${option}-checkbox` }}
                      />
                    }
                    label={option.name}
                  />
                );
              })}
            </Box>
          </Block>
        ) : null}

        {options.technologies?.length > 0 ? (
          <Block title={t("filter.technology")}>
            <Box sx={{ display: "flex", flexDirection: "column", pt: 1 }}>
              {options.technologies.map((option) => {
                const isSelected = currentTechnologies.includes(option.slug);
                return (
                  <FormControlLabel
                    key={option.slug}
                    control={
                      <Checkbox
                        size="small"
                        value={option}
                        checked={isSelected}
                        onChange={() => {
                          handleChange(
                            "technologies",
                            getSelected(currentTechnologies, option.slug).join(",")
                          );
                        }}
                        inputProps={{ id: `${option}-checkbox` }}
                      />
                    }
                    label={option.name}
                  />
                );
              })}
            </Box>
          </Block>
        ) : null}

        {options.categories?.length > 0 ? (
          <Block title={t("filter.category")}>
            <Box sx={{ display: "flex", flexDirection: "column", pt: 1 }}>
              {options.categories.map((option) => {
                const isSelected = currentCategories.includes(option.slug);
                return (
                  <FormControlLabel
                    key={option.slug}
                    control={
                      <Checkbox
                        size="small"
                        value={option}
                        checked={isSelected}
                        onChange={() => {
                          handleChange(
                            "categories",
                            getSelected(currentCategories, option.slug).join(",")
                          );
                        }}
                        inputProps={{ id: `${option}-checkbox` }}
                      />
                    }
                    label={option.name}
                  />
                );
              })}
            </Box>
          </Block>
        ) : null}

        <Block title={t("filter.duration.title")}>
          <Box sx={{ display: "flex", flexDirection: "column", pt: 1 }}>
            {options.durations.map((option) => {
              const isSelected = currentDuration.includes(option.slug);
              return (
                <FormControlLabel
                  key={option.slug}
                  control={
                    <Checkbox
                      size="small"
                      value={option}
                      checked={isSelected}
                      onChange={() =>
                        currentDuration !== option.slug
                          ? handleChange("duration", option.slug)
                          : handleChange("duration", "")
                      }
                      inputProps={{ id: `${option}-checkbox` }}
                    />
                  }
                  label={option.name}
                />
              );
            })}
          </Box>
        </Block>

        <Block title={t("filter.rating.title")}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {options.ratings.map((option, index) => (
              <Box
                key={option}
                sx={{
                  gap: 1,
                  display: "flex",
                  alignItems: "center",
                  py: 1,
                  opacity: 0.48,
                  cursor: "pointer",
                  typography: "body2",
                  "&:hover": { opacity: 1 },

                  ...(currentRating === option && { opacity: 1, fontWeight: "fontWeightSemiBold" }),
                }}
              >
                <FormControlLabel
                  key={option}
                  value={option}
                  control={
                    <Checkbox
                      checked={currentRating === option}
                      onClick={() =>
                        currentRating !== option
                          ? handleChange("rating", option)
                          : handleChange("rating", "")
                      }
                      sx={{ display: "none" }}
                    />
                  }
                  label={
                    <Stack direction="row" alignItems="center" spacing={1} ml={1}>
                      <Rating size="small" value={4 - index} readOnly />
                      <Typography variant="body2">{t("filter.rating.more")}</Typography>
                    </Stack>
                  }
                />
              </Box>
            ))}
          </Box>
        </Block>

        {isLoggedIn ? (
          <Block title={t("filter.status.title")}>
            <Box sx={{ display: "flex", flexDirection: "column", pt: 1 }}>
              {options.statuses.map((option) => {
                const isSelected = currentStatus.includes(option.slug);
                return (
                  <FormControlLabel
                    key={option.slug}
                    control={
                      <Checkbox
                        size="small"
                        value={option}
                        checked={isSelected}
                        onChange={() =>
                          currentStatus !== option.slug
                            ? handleChange("status", option.slug)
                            : handleChange("status", "")
                        }
                        inputProps={{ id: `${option}-checkbox` }}
                      />
                    }
                    label={option.name}
                  />
                );
              })}
            </Box>
          </Block>
        ) : null}

        <Block title={t("filter.tags.title")}>
          <Box
            sx={{
              pt: 1,
              gap: 1,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {visibleTags.map((tag) => {
              const isSelected = currentTags.includes(tag.slug);
              return (
                <Chip
                  key={tag.slug}
                  label={tag.name}
                  variant={isSelected ? "filled" : "outlined"}
                  size="small"
                  component="a"
                  clickable
                  onClick={() => {
                    handleChange("tags", getSelected(currentTags, tag.slug).join(","));
                  }}
                />
              );
            })}

            {options.tags.length > 10 && (
              <Button
                size="small"
                onClick={() => showAll.onToggle()}
                sx={{
                  minHeight: "32px",
                  height: "32px",
                  px: 1.5,
                  lineHeight: 1,
                  textTransform: "none",
                }}
              >
                {showAll.value ? t("filter.tags.show.less") : t("filter.tags.show.more")}
              </Button>
            )}
          </Box>
        </Block>

        {options.plans?.length > 0 ? (
          <Block title={t("filter.plans")}>
            <Box sx={{ display: "flex", flexDirection: "column", pt: 1 }}>
              {options.plans.map((option) => {
                const isSelected = currentPlans.includes(option.type);
                return (
                  <FormControlLabel
                    key={option.type}
                    control={
                      <Checkbox
                        size="small"
                        value={option}
                        checked={isSelected}
                        onChange={() => {
                          handleChange("plans", getSelected(currentPlans, option.type).join(","));
                        }}
                        inputProps={{ id: `${option}-checkbox` }}
                      />
                    }
                    label={option.license}
                  />
                );
              })}
            </Box>
          </Block>
        ) : null}
      </>
    );
  };

  const renderDesktop = () => (
    <Box
      sx={{
        gap: 3,
        width: 280,
        flexShrink: 0,
        flexDirection: "column",
        display: { xs: "none", md: "flex" },
      }}
    >
      {renderContent()}
    </Box>
  );

  const renderMobile = () => (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { p: 3, gap: 2.5, width: 280, display: "flex", flexDirection: "column" } }}
    >
      {renderContent()}
    </Drawer>
  );

  return (
    <>
      {renderDesktop()}
      {renderMobile()}
    </>
  );
}

// ----------------------------------------------------------------------

type BlockProps = BoxProps & {
  title: string;
  open?: boolean;
};

function Block({ title, children, open = true, sx, ...other }: BlockProps) {
  const contentOpen = useBoolean(open);

  return (
    <Box
      sx={[{ display: "flex", flexDirection: "column" }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <Box
        onClick={contentOpen.onToggle}
        sx={{ display: "flex", alignItems: "center", width: 1, cursor: "pointer" }}
      >
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        <Iconify width={16} icon={contentOpen.value ? "eva:minus-outline" : "eva:plus-outline"} />
      </Box>

      <Collapse unmountOnExit in={contentOpen.value} sx={{ px: 0.25 }}>
        {children}
      </Collapse>
    </Box>
  );
}
