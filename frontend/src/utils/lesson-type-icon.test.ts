import type { ICourseLessonType } from "src/types/course";

import { getLessonTypeIcon } from "./lesson-type-icon";

describe("getLessonTypeIcon", () => {
  // Returns the correct icon for "video" type
  it('should return VIDEO_ICON when type is "video"', () => {
    const result = getLessonTypeIcon("video");
    expect(result).toBe("solar:video-frame-outline");
  });

  // Returns the correct icon for "article" type
  it('should return ARTICLE_ICON when type is "article"', () => {
    const result = getLessonTypeIcon("article" as unknown as ICourseLessonType);
    expect(result).toBe("solar:code-circle-outline");
  });

  // Returns EXERCISE_ICON as fallback when type is not found in the map
  it("should return EXERCISE_ICON when type is not found in the map", () => {
    const result = getLessonTypeIcon("unknown" as ICourseLessonType);
    expect(result).toBe("solar:code-circle-outline");
  });

  // Handles case sensitivity correctly (only exact matches work)
  it("should be case sensitive and return fallback for incorrect casing", () => {
    const result = getLessonTypeIcon("VIDEO" as ICourseLessonType);
    expect(result).toBe("solar:code-circle-outline");
    expect(result).not.toBe("solar:video-frame-outline");
  });

  // Behavior when passing empty string as type
  it("should return EXERCISE_ICON when type is an empty string", () => {
    const result = getLessonTypeIcon("" as ICourseLessonType);
    expect(result).toBe("solar:code-circle-outline");
  });
});
