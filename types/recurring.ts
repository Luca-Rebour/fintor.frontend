export type RecurringTransactionType = "income" | "expense";

export type RecurringPendingApproval = {
  id: string;
  title: string;
  amount: number;
  currencyCode: string;
  expectedDate: string;
  accountName: string;
  transactionType: RecurringTransactionType;
  requiresAction: boolean;
};

export type RecurringTransaction = {
  id: string;
  name: string;
  amount: number;
  currencyCode: string;
  nextChargeDate: string;
  accountName: string;
  transactionType: RecurringTransactionType;
  icon: string;
};

export type RecurringTransactionsData = {
  pendingApproval: RecurringPendingApproval | null;
  recurringTransactions: RecurringTransaction[];
};
