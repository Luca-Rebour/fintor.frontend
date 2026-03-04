export type GoalApi = {
    id: string;
    title: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    icon: string;
    targetDate: string;
    accentColor: string;
    accountName: string;
    currencyCode: string;
};

export type CreateGoalDTO = {
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  targetDate: string;
  accentColor: string;
  accountId: string;
  exchangeRate: number;
};