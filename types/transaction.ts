export type TransactionDTO = {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  type: "income" | "expense";
  icon: string;
  account: string;
};
