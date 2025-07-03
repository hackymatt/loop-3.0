import type { ICourseLessonProp, ICourseChapterProp } from "src/types/course";

type ReturnType = {
  chapter: ICourseChapterProp | undefined;
  lesson: ICourseLessonProp | null;
};

export function findNextLesson(chapters: ICourseChapterProp[]): ReturnType {
  const chapterWithNextLesson = chapters.find((chapter) =>
    chapter.lessons.some((lesson) => lesson.progress === 0)
  );

  return {
    chapter: chapterWithNextLesson,
    lesson: chapterWithNextLesson?.lessons.find((lesson) => lesson.progress === 0) || null,
  };
}
