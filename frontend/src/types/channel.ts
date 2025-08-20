import type { DatePickerFormat } from "src/utils/format-time";

// ----------------------------------------------------------------------

type IChannelUserProp = {
  name: string;
  avatarUrl: string | null;
};

type IChannelComment = {
  id: string;
  student: IChannelUserProp;
  message: string;
  createdAt: DatePickerFormat;
};

export type IChannelItemProp = {
  id: string;
  student: IChannelUserProp;
  title: string;
  message: string;
  helpfulCount: number;
  isHelpful: boolean;
  createdAt: DatePickerFormat;
  comments: IChannelComment[];
};
