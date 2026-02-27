import { GoalsData } from "../types/goals.types";
import { apiGet } from "./api.client";

const MOCK_GOALS_DATA: GoalsData = {
  overview: {
    totalSavings: 45250,
    monthlyChangePercent: 12,
    currentValue: 45250,
    goalValue: 62000,
  },
  targets: [
    {
      id: "goal-car",
      title: "Comprar Auto",
      subtitle: "Tesla Model 3",
      currentAmount: 13000,
      targetAmount: 20000,
      targetDate: "Dec 2024",
      icon: "truck",
      accentColor: "#8B5CF6",
    },
    {
      id: "goal-house",
      title: "Comprar Casa",
      subtitle: "Down payment",
      currentAmount: 28000,
      targetAmount: 100000,
      targetDate: "Aug 2026",
      icon: "home",
      accentColor: "#EC4899",
    },
  ],
};

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function getGoalsData(): Promise<GoalsData> {
  try {
    const response = await apiGet<GoalsData>("/goals");
    return response;
  } catch {
    await wait(650);
    return MOCK_GOALS_DATA;
  }
}
