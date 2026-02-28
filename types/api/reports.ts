export type OverviewDetailedResponseDTO = {
  daysAgo: 7 | 30 | 182 | 365;
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  categorySpending: CategorySummaryDto[];
  categoryEarning: CategorySummaryDto[];
};

export type CategorySummaryDto = {
  categoryId: string;   // Guid
  categoryName: string;
  categoryColor: string; // Hex color code
  total: number;
};

export type OverviewResponseListDTO = OverviewDetailedResponseDTO[];