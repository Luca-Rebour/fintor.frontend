export type GoalTarget = {
  id: string;
  title: string;
  subtitle: string;
  currentAmount: number;
  targetAmount: number;
  targetDate: string;
  icon: "truck" | "home";
  accentColor: string;
};

export type GoalsOverview = {
  totalSavings: number;
  monthlyChangePercent: number;
  currentValue: number;
  goalValue: number;
};

export type GoalsData = {
  overview: GoalsOverview;
  targets: GoalTarget[];
};
