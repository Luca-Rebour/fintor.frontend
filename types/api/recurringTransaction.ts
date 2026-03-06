import { Frequency } from "../enums/frequency";
import { TransactionType } from "../enums/transactionType";

export type CreateRecurringTransactionRequestDTO = {
  name: string;
  amount: number;
  description: string;
  transactionType: TransactionType;
  frequency: Frequency;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  accountId: string;
  categoryId: string;
};


export type CreateRecurringTransactionResponseDTO = {
  id: string;
  name: string;
  amount: number;
  description: string;
  transactionType: number;
  icon: string | null;
  frequency: number;
  startDate: string;      // YYYY-MM-DD
  endDate: string;        // YYYY-MM-DD
  lastGeneratedAt: string;
  nextChargeDate: string;
  currencyCode: string | null;
  accountName: string | null;
};

export type RecurringTransactionDTO = {
  id: string;
  name: string;
  amount: number;
  description: string;
  transactionType: number;
  icon: string | null;
  frequency: number;
  startDate: string;       // YYYY-MM-DD
  endDate: string;         // YYYY-MM-DD
  lastGeneratedAt: string; // viene como "0001-01-01"
  nextChargeDate: string;  // viene como "0001-01-01"
  currencyCode: string | null;
  accountName: string | null;
};

export type GetRecurringTransactionDTO = {
  id: string;
  name: string;
  amount: number;
  description: string;
  transactionType: number;
  icon: string | null;
  frequency: number;
  startDate: string;       // YYYY-MM-DD
  endDate: string;         // YYYY-MM-DD
  lastGeneratedAt: string;
  nextChargeDate: string;
  currencyCode: string | null;
  accountName: string | null;
};


export type GetRecurringTransactionsResponseDTO = GetRecurringTransactionDTO[];