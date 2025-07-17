import type { IProjectSubstepType } from "src/types/project";

import { getSubstepTypeIcon } from "./substep-type-icon";

describe("getSubstepTypeIcon", () => {
  // Returns the correct icon for "video" type
  it('should return VIDEO_ICON when type is "video"', () => {
    const result = getSubstepTypeIcon("video");
    expect(result).toBe("solar:video-frame-outline");
  });

  // Returns the correct icon for "article" type
  it('should return ARTICLE_ICON when type is "article"', () => {
    const result = getSubstepTypeIcon("article" as unknown as IProjectSubstepType);
    expect(result).toBe("solar:code-circle-outline");
  });

  // Returns EXERCISE_ICON as fallback when type is not found in the map
  it("should return EXERCISE_ICON when type is not found in the map", () => {
    const result = getSubstepTypeIcon("unknown" as IProjectSubstepType);
    expect(result).toBe("solar:code-circle-outline");
  });

  // Handles case sensitivity correctly (only exact matches work)
  it("should be case sensitive and return fallback for incorrect casing", () => {
    const result = getSubstepTypeIcon("VIDEO" as IProjectSubstepType);
    expect(result).toBe("solar:code-circle-outline");
    expect(result).not.toBe("solar:video-frame-outline");
  });

  // Behavior when passing empty string as type
  it("should return EXERCISE_ICON when type is an empty string", () => {
    const result = getSubstepTypeIcon("" as IProjectSubstepType);
    expect(result).toBe("solar:code-circle-outline");
  });
});
