export type CreateGoalRequestDTO = {
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

export type CreateGoalResponseDTO = {
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

export type GetGoalDTO = {
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

export type GetGoalsResponseDTO = GetGoalDTO[];


export type GetGoalTransaction = {
  id: string;
  amount: number;
  description: string;
  date: string;
  transactionType: number;
  isRecurringTransaction: boolean;
  categoryName: string;
  accountName: string | null;
  exchangeRate: number;
  currencyCode: string | null;
  icon: string;
};

export type GetGoalTransactionsResponseDTO = GetGoalTransaction[];