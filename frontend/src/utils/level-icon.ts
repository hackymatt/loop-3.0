import type { LevelType } from "src/types/course";

import { LEVEL_TYPE } from "src/consts/level";

const BEGINNER_ICON = "carbon:skill-level-basic";
const INTERMEDIATE_ICON = "carbon:skill-level-intermediate";
const ADVANCED_ICON = "carbon:skill-level-advanced";

const LEVEL_ICONS = new Map<LevelType, string>([
  [LEVEL_TYPE.BEGINNER, BEGINNER_ICON],
  [LEVEL_TYPE.INTERMEDIATE, INTERMEDIATE_ICON],
  [LEVEL_TYPE.ADVANCED, ADVANCED_ICON],
]);

export function getLevelIcon(level: LevelType): string {
  return LEVEL_ICONS.get(level) ?? BEGINNER_ICON;
}
