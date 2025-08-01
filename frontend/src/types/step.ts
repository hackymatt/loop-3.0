type IStepBaseProps = {
  slug: string;
  name: string;
  totalPoints: number;
};

export type IStepProps = IStepBaseProps & { text: string; duration: number };
