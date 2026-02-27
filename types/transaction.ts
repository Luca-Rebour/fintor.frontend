export type TransactionDTO = {
  id: string;
  date: string;
  amount: number;
  description: string;
  categoryName: string;
  transactionType: 0 | 1;
  icon: string;
  accountName: string;
  categoryColor: string;
};


export type CreateTransactionDTO = {
  amount: number;
  description: string;
  transactionType: 0 | 1;
  icon: string;
  accountId: string;
  categoryId: string;
};
