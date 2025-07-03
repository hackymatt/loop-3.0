import type { ICourseLessonType } from "src/types/course";

const VIDEO_ICON = "solar:video-frame";
const ARTICLE_ICON = "solar:book";
const QUIZ_ICON = "solar:question-circle";
const EXERCISE_ICON = "solar:code-circle";

const LESSON_TYPE_ICONS = new Map<string, string>([
  ["video", VIDEO_ICON],
  ["reading", ARTICLE_ICON],
  ["quiz", QUIZ_ICON],
  ["exercise", EXERCISE_ICON],
]);

export function getLessonTypeIcon(type: ICourseLessonType, completed = false): string {
  const iconType = completed ? "bold" : "outline";
  return `${LESSON_TYPE_ICONS.get(type) ?? EXERCISE_ICON}-${iconType}`;
}
