import { APP_COLORS } from "../constants/colors";
import { CATEGORY_COLOR_BY_NAME } from "../constants/colors";
import { mapFinancialSummaryDtoToModel } from "../mappers/report.mapper";
import { FinancialSummaryDTO, GetFinancialSummaryResponseDTO } from "../types/api/report";
import { apiGet } from "./api.client";

export type ReportFilterDays = 7 | 30 | 182 | 365;

export type OverviewCategoryExpense = {
  category: string;
  amount: number;
  color: string;
};

function toValidFilterDays(filterDays: number): ReportFilterDays {
  const safe = Number.isFinite(filterDays) ? Math.max(1, Math.floor(filterDays)) : 30;

  if (safe <= 7) return 7;
  if (safe <= 30) return 30;
  if (safe <= 182) return 182;
  return 365;
}

function createEmptyOverview(daysAgo: ReportFilterDays): FinancialSummaryDTO {
  return {
    daysAgo,
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    categorySpending: [],
    categoryEarning: [],
  };
}

type OverviewDataset = Record<ReportFilterDays, FinancialSummaryDTO>;

function pickOverviewByDays(response: GetFinancialSummaryResponseDTO, daysAgo: ReportFilterDays): FinancialSummaryDTO | null {
  return response.find((item) => item.daysAgo === daysAgo) ?? response[0] ?? null;
}

export async function getOverviewByFilter(filterDays: number): Promise<FinancialSummaryDTO> {
  try {
    const safeFilterDays = toValidFilterDays(filterDays);
    const dataset = await getOverviewDataset();
    return dataset[safeFilterDays] ?? createEmptyOverview(safeFilterDays);
  } catch (error) {
    console.error("Error fetching reports overview:", error);
    return createEmptyOverview(toValidFilterDays(filterDays));
  }
}

export async function getOverviewDataset(): Promise<OverviewDataset> {
  const filters: ReportFilterDays[] = [7, 30, 182, 365];

  try {
    const response = await apiGet<GetFinancialSummaryResponseDTO>("/reports/overview");

    const dataset: OverviewDataset = {
      7: createEmptyOverview(7),
      30: createEmptyOverview(30),
      182: createEmptyOverview(182),
      365: createEmptyOverview(365),
    };

    for (const daysAgo of filters) {
      const overview = pickOverviewByDays(response, daysAgo);
      if (overview) {
        const model = mapFinancialSummaryDtoToModel(overview);
        dataset[daysAgo] = {
          daysAgo,
          totalBalance: model.totalBalance,
          totalIncome: model.totalIncome,
          totalExpense: model.totalExpense,
          categorySpending: model.categorySpending,
          categoryEarning: model.categoryEarning,
        };
      }
    }

    return dataset;
  } catch (error) {
    console.error("Error fetching reports overview dataset:", error);
    return {
      7: createEmptyOverview(7),
      30: createEmptyOverview(30),
      182: createEmptyOverview(182),
      365: createEmptyOverview(365),
    };
  }
}

export function mapOverviewSpendingToChartData(
  overview: FinancialSummaryDTO,
): OverviewCategoryExpense[] {
  return overview.categorySpending
    .map((item) => {
      const category = item.categoryName?.trim() || "Sin categoría";
      const amount = Math.abs(Number(item.total) || 0);
      const apiColor = item.categoryColor?.trim();

      const hasValidHexColor =
        typeof apiColor === "string" && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(apiColor);

      if (amount <= 0) {
        return null;
      }

      return {
        category,
        amount,
        color: hasValidHexColor ? apiColor : CATEGORY_COLOR_BY_NAME[category] || APP_COLORS.actionPrimary,
      };
    })
    .filter((item): item is OverviewCategoryExpense => item !== null)
    .sort((a, b) => b.amount - a.amount);
}

