import type { LevelType } from "src/types/course";

import { getLevelIcon } from "./level-icon";

describe("getLevelIcon", () => {
  // Returns the correct icon for English level "Beginner"
  it('should return BEGINNER_ICON when level is "beginner"', () => {
    const result = getLevelIcon("beginner");
    expect(result).toBe("carbon:skill-level-basic");
  });

  // Returns the correct icon for English level "Intermediate"
  it('should return INTERMEDIATE_ICON when level is "intermediate"', () => {
    const result = getLevelIcon("intermediate");
    expect(result).toBe("carbon:skill-level-intermediate");
  });

  // Returns BEGINNER_ICON when level is not found in the map
  it("should return BEGINNER_ICON when level is not in the map", () => {
    const result = getLevelIcon("NonExistentLevel" as unknown as LevelType);
    expect(result).toBe("carbon:skill-level-basic");
  });

  // Handles case sensitivity (exact match required)
  it("should be case sensitive and return fallback for incorrect casing", () => {
    const result = getLevelIcon("Advanced" as unknown as LevelType);
    expect(result).toBe("carbon:skill-level-basic");
    expect(result).not.toBe(getLevelIcon("advanced"));
  });

  // Handles empty string as input
  it("should return BEGINNER_ICON when level is an empty string", () => {
    const result = getLevelIcon("" as unknown as LevelType);
    expect(result).toBe("carbon:skill-level-basic");
  });
});
