export type CategorySummaryModel = {
  categoryId: string;
  categoryName: string;
  total: number;
  categoryColor: string;
};

export type FinancialSummaryModel = {
  daysAgo: number;
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  categorySpending: CategorySummaryModel[];
  categoryEarning: CategorySummaryModel[];
};
