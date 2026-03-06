import { TransactionModel } from "./transaction.model";

export type AccountOptionModel = {
  label: string;
  value: string;
  currencyCode: string;
};

export type AccountSummaryModel = AccountOptionModel & {
  balance: number;
  currencySymbol: string;
};

export type CreateAccountInputModel = {
  name: string;
  initialBalance: number;
  exchangeRate: number;
  currencyCode: string;
};

export type CreatedAccountModel = {
  id: string;
  name: string;
  balance: number;
  currencyCode: string;
};

export type AccountDetailModel = {
  id: string;
  name: string;
  currencyCode: string;
  availableBalance: number;
  allocatedToGoalsBalance: number;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  transactions: TransactionModel[];
};
