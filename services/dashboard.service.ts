import { DashboardData } from "../types/dashboard";
import { apiGet } from "./api.client";

type DashboardApiResponse = DashboardData;

const MOCK_DASHBOARD_RESPONSE: DashboardApiResponse = {
  userName: "Alex Morgan",
  totalNetWorth: "$142,590.00",
  monthlyChange: "+12.5%",
  pendingIncomeAmount: "$4,200.00",
  pendingIncomeSource: "Tech Corp Inc.",
  cashFlow: [
    { id: "income", label: "Income", amount: "$8,450", trend: "up" },
    { id: "expenses", label: "Expenses", amount: "$3,240", trend: "down" },
  ],
  quickActions: [
    { id: "topup", label: "Top Up", icon: "Plus" },
    { id: "send", label: "Send", icon: "Send" },
    { id: "scan", label: "Scan", icon: "Maximize2" },
    { id: "more", label: "More", icon: "MoreHorizontal" },
  ],
  goal: {
    title: "Tesla Model 3",
    current: 45000,
    target: 60000,
    progressPercent: 75,
  },
};

function mapDashboardResponse(response: DashboardApiResponse): DashboardData {
  return response;
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const response = await apiGet<DashboardApiResponse>("/dashboard");
    return mapDashboardResponse(response);
  } catch {
    return mapDashboardResponse(MOCK_DASHBOARD_RESPONSE);
  }
}
