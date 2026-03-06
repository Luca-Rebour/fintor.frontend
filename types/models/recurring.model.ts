import { Frequency } from "../enums/frequency";
import { TransactionType } from "../enums/transactionType";

export type RecurringTransactionModel = {
  id: string;
  name: string;
  amount: number;
  description: string;
  transactionType: TransactionType;
  icon: string;
  frequency: Frequency;
  startDate: string;
  endDate: string;
  lastGeneratedAt: string;
  nextChargeDate: string;
  currencyCode: string;
  accountName: string;
};

export type RecurringPendingApprovalModel = {
  id: string;
  dueDate: string;
  status: number;
  description: string;
  transactionType: TransactionType;
  amount: number;
  categoryName: string;
  icon: string;
  accountName: string;
  currencyCode: string;
};
