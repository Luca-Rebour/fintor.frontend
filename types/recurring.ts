import {
  RecurringPendingApprovalApiDTO,
  RecurringTransactionApiDTO,
} from "./api/recurring";
import { Frequency } from "./enums/frequency";
import { TransactionType } from "./enums/transactionType";

export type RecurringTransactionsData = {
  pendingApprovals: RecurringPendingApprovalApiDTO[];
  recurringTransactions: RecurringTransactionApiDTO[];
};

export type UpdateRecurringTransactionInput = {
  name: string;
  amount: number;
  description: string;
  transactionType: TransactionType;
  frequency: Frequency;
  startDate: string;
  endDate: string;
  lastGeneratedAt: string;
  accountId: string;
  categoryId: string;
};

export type CreateRecurringTransactionInput = {
  name: string;
  amount: number;
  description: string;
  transactionType: TransactionType;
  frequency: Frequency;
  startDate: string;
  endDate: string;
  accountId: string;
  categoryId: string;
};