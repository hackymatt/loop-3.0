type IStepBaseProps = {
  name: string;
  totalPoints: number;
};

export type IStepProps = IStepBaseProps & { text: string; duration: number };
