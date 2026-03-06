export type FinancialSummaryDTO  = {
  daysAgo: number;
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  categorySpending: CategorySummaryDTO[];
  categoryEarning: CategorySummaryDTO[];
};

export type CategorySummaryDTO  = {
  categoryId: string;
  categoryName: string;
  total: number;
  categoryColor: string;
};

export type GetFinancialSummaryResponseDTO = FinancialSummaryDTO [];