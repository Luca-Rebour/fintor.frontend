export type TransactionTypeModel = 0 | 1;

export type TransactionModel = {
  id: string;
  date: string;
  amount: number;
  description: string;
  categoryName: string;
  transactionType: TransactionTypeModel;
  icon: string;
  accountName: string;
  categoryColor: string;
  currencyCode: string;
  isRecurringTransaction?: boolean;
  exchangeRate?: number | null;
  goalId?: string;
  goalTitle?: string;
};

export type CreateTransactionInputModel = {
  accountId: string;
  categoryId: string;
  recurringTransactionId?: string | null;
  goalId?: string | null;
  amount: number;
  description: string;
  exchangeRate: number | null;
  transactionType: TransactionTypeModel;
  icon?: string;
};
