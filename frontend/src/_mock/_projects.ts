import type { LevelType, IProjectSubstepType } from "src/types/project";

import dayjs from "dayjs";

import { _mock } from "./_mock";
import { _tags } from "./assets";

// ----------------------------------------------------------------------

const TEACHERS = Array.from({ length: 8 }, (_, index) => ({
  id: _mock.id(index),
  totalProjects: 48,
  totalReviews: 3458,
  totalStudents: 18000,
  role: _mock.role(index),
  name: _mock.fullName(index),
  avatarUrl: _mock.image.avatar(index),
  ratingNumber: _mock.number.rating(index),
}));

function slugify(text: string): string {
  return text
    .toLowerCase() // Zamiana na małe litery
    .normalize("NFD") // Normalizacja znaków diakrytycznych
    .replace(/[\u0300-\u036f]/g, "") // Usunięcie akcentów
    .replace(/[^a-z0-9\s-]/g, "") // Usunięcie znaków specjalnych
    .replace(/\s+/g, "-") // Zamiana spacji na myślniki
    .replace(/-+/g, "-") // Usunięcie wielokrotnych myślników
    .trim(); // Usunięcie zbędnych spacji na początku i końcu
}

const getType = (index: number): IProjectSubstepType => {
  const types = ["article", "video", "exercise", "test"];
  return types[index % types.length] as IProjectSubstepType;
};

const LESSONS = Array.from({ length: 9 }, (_, index) => ({
  id: _mock.id(index),
  totalPoints: 60 - index,
  slug: slugify(`Substep ${index + 1}`),
  name: `Substep ${index + 1}`,
  description: _mock.sentence(index),
  type: getType(index),
}));

const CHAPTERS = Array.from({ length: 9 }, (_, index) => ({
  id: _mock.id(index),
  name: `Step ${index + 1}`,
  slug: slugify(`Step ${index + 1}`),
  description: _mock.sentence(index),
  substeps: LESSONS,
  progress: Math.floor(Math.random() * 100) + 1,
}));

const getTeachers = (index: number) => {
  if (index === 0) return TEACHERS.slice(0, 5);
  if (index === 1) return TEACHERS.slice(3, 7);
  if (index === 2) return TEACHERS.slice(5, 7);
  return [TEACHERS[4]];
};

const getLevel = (index: number) => {
  if (index % 2) return { slug: "intermediate" as LevelType, name: "Intermediate" };
  if (index % 4) return { slug: "advanced" as LevelType, name: "Advanced" };
  return { slug: "beginner" as LevelType, name: "Beginner" };
};

const getTechnology = (index: number) => {
  if (index % 2) return { slug: "typescript", name: "TypeScript" };
  if (index % 4) return { slug: "c-plusplus", name: "C++" };
  return { slug: "vba", name: "Visual Basic for Application" };
};

const getCategory = (index: number) => {
  if (index % 2) return { slug: "frontend", name: "Frontend" };
  if (index % 4) return { slug: "backend", name: "Backend" };
  return { slug: "fullstack", name: "Full Stack" };
};

// ----------------------------------------------------------------------

export const _projects = Array.from({ length: 12 }, (_, index) => ({
  id: _mock.id(index),
  chatUrl: "https://loop.edu.pl",
  totalHours: 100,
  totalPoints: 3459,
  steps: CHAPTERS,
  totalStages: LESSONS.length,
  totalReading: 1,
  totalQuizzes: 4,
  totalExercises: 10,
  totalVideos: 6,
  totalReviews: 3458,
  totalStudents: 180000,
  level: getLevel(index),
  technology: getTechnology(index),
  category: getCategory(index),
  teachers: getTeachers(index),
  name: _mock.projectNames(index),
  slug: slugify(_mock.projectNames(index)),
  coverUrl: _mock.image.project(index),
  createdAt: dayjs(new Date()).format(),
  description: _mock.description(index),
  overview: _mock.description(index),
  ratingNumber: _mock.number.rating(index),
  progress: Math.floor(Math.random() * 100) + 1,
  prerequisites: Array.from({ length: 2 }, (_x, i) => ({
    name: _mock.projectNames(i),
    slug: slugify(_mock.projectNames(i)),
  })),
}));

export const _projectsByCategories = Array.from({ length: 9 }, (_, index) => ({
  id: _mock.id(index),
  name: _tags[index],
  totalStudents: _mock.number.nativeM(index),
}));
