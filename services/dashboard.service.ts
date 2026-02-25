import { DashboardData } from "../types/dashboard";

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
    { id: "topup", label: "Top Up", icon: "plus" },
    { id: "send", label: "Send", icon: "send" },
    { id: "scan", label: "Scan", icon: "maximize-2" },
    { id: "more", label: "More", icon: "more-horizontal" },
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
  return mapDashboardResponse(MOCK_DASHBOARD_RESPONSE);
}
