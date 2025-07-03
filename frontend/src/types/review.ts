import type { DatePickerFormat } from "src/utils/format-time";

import type { IStudentProps } from "./user";

// ----------------------------------------------------------------------

export type IReviewSummaryProps = {
  rating: number;
  count: number;
};

type IReviewUser = IStudentProps;

export type IReviewItemProp = {
  rating: number;
  message: string | null;
  student: IReviewUser;
  createdAt: DatePickerFormat;
};
