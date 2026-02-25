export type QuickAction = {
  id: string;
  label: string;
  icon: "plus" | "send" | "maximize-2" | "more-horizontal";
};

export type CashFlowMetric = {
  id: string;
  label: string;
  amount: string;
  trend: "up" | "down";
};

export type GoalProgress = {
  title: string;
  current: number;
  target: number;
  progressPercent: number;
};

export type DashboardData = {
  userName: string;
  totalNetWorth: string;
  monthlyChange: string;
  pendingIncomeAmount: string;
  pendingIncomeSource: string;
  cashFlow: CashFlowMetric[];
  quickActions: QuickAction[];
  goal: GoalProgress;
};
