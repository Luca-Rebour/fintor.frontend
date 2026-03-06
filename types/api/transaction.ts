export type CreateTransactionRequestDTO = {
  accountId: string;
  categoryId: string;
  recurringTransactionId: string | null;
  goalId: string | null;
  amount: number;
  description: string;
  exchangeRate: number;
  transactionType: number;
};

export type CreateTransactionResponseDTO = {
  id: string;
  amount: number;
  description: string;
  date: string; // ISO string
  transactionType: number;
  isRecurringTransaction: boolean;
  categoryName: string;
  accountName: string;
  exchangeRate: number;
  currencyCode: string | null;
  icon: string;
};

export type GetTransactionDTO = {
  id: string;
  amount: number;
  description: string;
  date: string; // ISO string
  transactionType: number;
  isRecurringTransaction: boolean;
  categoryName: string;
  accountName: string | null;
  exchangeRate: number;
  currencyCode: string | null;
  icon: string;
};

export type GetTransactionsResponseDTO = GetTransactionDTO[];