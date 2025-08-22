import type { DatePickerFormat } from "src/utils/format-time";

// ----------------------------------------------------------------------

type IChannelUserProp = {
  name: string;
  avatarUrl: string | null;
};

export type IChannelComment = {
  id: string;
  student: IChannelUserProp;
  message: string;
  isMine: boolean;
  createdAt: DatePickerFormat;
};

export type IChannelItemProp = {
  id: string;
  student: IChannelUserProp;
  title: string;
  message: string;
  helpfulCount: number;
  isHelpful: boolean;
  isMine: boolean;
  createdAt: DatePickerFormat;
  comments: IChannelComment[];
};
