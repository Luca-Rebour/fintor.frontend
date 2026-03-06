import { FinancialSummaryDTO } from "../types/api/report";
import { FinancialSummaryModel } from "../types/models/report.model";

export function mapFinancialSummaryDtoToModel(dto: FinancialSummaryDTO): FinancialSummaryModel {
  return {
    daysAgo: Number.isFinite(Number(dto.daysAgo)) ? Number(dto.daysAgo) : 0,
    totalBalance: Number.isFinite(Number(dto.totalBalance)) ? Number(dto.totalBalance) : 0,
    totalIncome: Number.isFinite(Number(dto.totalIncome)) ? Number(dto.totalIncome) : 0,
    totalExpense: Number.isFinite(Number(dto.totalExpense)) ? Number(dto.totalExpense) : 0,
    categorySpending: Array.isArray(dto.categorySpending)
      ? dto.categorySpending.map((item) => ({
          categoryId: String(item.categoryId ?? ""),
          categoryName: String(item.categoryName ?? "Sin categoría").trim() || "Sin categoría",
          total: Number.isFinite(Number(item.total)) ? Number(item.total) : 0,
          categoryColor: String(item.categoryColor ?? "").trim(),
        }))
      : [],
    categoryEarning: Array.isArray(dto.categoryEarning)
      ? dto.categoryEarning.map((item) => ({
          categoryId: String(item.categoryId ?? ""),
          categoryName: String(item.categoryName ?? "Sin categoría").trim() || "Sin categoría",
          total: Number.isFinite(Number(item.total)) ? Number(item.total) : 0,
          categoryColor: String(item.categoryColor ?? "").trim(),
        }))
      : [],
  };
}
