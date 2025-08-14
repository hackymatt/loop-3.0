import type { DatePickerFormat } from "src/utils/format-time";

// ----------------------------------------------------------------------

type IChannelUserProp = {
  name: string;
  avatarUrl: string;
};

type IChannelComment = {
  id: string;
  user: IChannelUserProp;
  message: string;
  createdAt: DatePickerFormat;
};

export type IChannelItemProp = {
  id: string;
  user: IChannelUserProp;
  title: string;
  message: string;
  helpfulCount: number;
  isHelpful: boolean;
  createdAt: DatePickerFormat;
  comments: IChannelComment[];
};
