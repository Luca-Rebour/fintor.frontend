import { CATEGORY_COLOR_BY_NAME } from "../constants/colors";
import { apiGet } from "./api.client";
import { OverviewDetailedResponseDTO, OverviewResponseListDTO } from "../types/api/reports";

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

function createEmptyOverview(daysAgo: 7 | 30 | 182 | 365): OverviewDetailedResponseDTO {
  return {
    daysAgo,
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    categorySpending: [],
    categoryEarning: [],
  };
}

type OverviewDataset = Record<ReportFilterDays, OverviewDetailedResponseDTO>;

function pickOverviewByDays(
  response: OverviewDetailedResponseDTO | OverviewResponseListDTO,
  daysAgo: 7 | 30 | 182 | 365,
): OverviewDetailedResponseDTO | null {
  if (Array.isArray(response)) {
    return response.find((item) => item.daysAgo === daysAgo) ?? response[0] ?? null;
  }

  return response;
}

export async function getOverviewByFilter(filterDays: number): Promise<OverviewDetailedResponseDTO> {
  try {
    const safeFilterDays = toValidFilterDays(filterDays);

    const response = await apiGet<OverviewDetailedResponseDTO | OverviewResponseListDTO>(
      `/reports/overview?filter=${encodeURIComponent(String(safeFilterDays))}`,
    );

    return pickOverviewByDays(response, safeFilterDays) ?? createEmptyOverview(safeFilterDays);
  } catch (error) {
    console.error("Error fetching reports overview:", error);
    return createEmptyOverview(toValidFilterDays(filterDays));
  }
}

export async function getOverviewDataset(): Promise<OverviewDataset> {
  const filters: ReportFilterDays[] = [7, 30, 182, 365];

  try {
    const response = await apiGet<OverviewDetailedResponseDTO | OverviewResponseListDTO>(
      "/reports/overview?filter=365",
    );

    const list = Array.isArray(response) ? response : [response];

    const dataset: OverviewDataset = {
      7: createEmptyOverview(7),
      30: createEmptyOverview(30),
      182: createEmptyOverview(182),
      365: createEmptyOverview(365),
    };

    for (const item of list) {
      if (filters.includes(item.daysAgo as ReportFilterDays)) {
        dataset[item.daysAgo as ReportFilterDays] = item;
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
  overview: OverviewDetailedResponseDTO,
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
        color: hasValidHexColor ? apiColor : CATEGORY_COLOR_BY_NAME[category] || "#18C8FF",
      };
    })
    .filter((item): item is OverviewCategoryExpense => item !== null)
    .sort((a, b) => b.amount - a.amount);
}
