import { TransactionModel } from "./transaction.model";

export type GoalModel = {
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

export type CreateGoalInputModel = {
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

export type GoalTransactionsModel = TransactionModel[];
