import { CreateGoalDTO, GoalApi } from "../types/goals.types";
import { apiGet, apiPost } from "./api.client";

type GoalsResponse = GoalApi[] | { goals: GoalApi[] } | GoalApi;

const MOCK_GOALS_DATA: GoalApi[] = [
  {
    id: "goal-car",
    title: "Comprar Auto",
    description: "Tesla Model 3",
    targetAmount: 20000,
    currentAmount: 13000,
    icon: "Truck",
    targetDate: "2026-12-01",
    accentColor: "#8B5CF6",
    accountName: "Cuenta principal",
  },
  {
    id: "goal-house",
    title: "Comprar Casa",
    description: "Down payment",
    targetAmount: 100000,
    currentAmount: 28000,
    icon: "House",
    targetDate: "2027-08-01",
    accentColor: "#EC4899",
    accountName: "Cuenta principal",
  },
];

function normalizeGoal(goal: GoalApi): GoalApi {
  const normalizedTargetAmount = Number(goal.targetAmount);
  const normalizedCurrentAmount = Number(goal.currentAmount);

  return {
    id: String(goal.id ?? `goal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
    title: goal.title?.trim() || "Sin título",
    description: goal.description?.trim() || "",
    targetAmount: Number.isFinite(normalizedTargetAmount) && normalizedTargetAmount > 0 ? normalizedTargetAmount : 0,
    currentAmount: Number.isFinite(normalizedCurrentAmount) && normalizedCurrentAmount > 0 ? normalizedCurrentAmount : 0,
    icon: goal.icon?.trim() || "Target",
    targetDate: goal.targetDate || new Date().toISOString(),
    accentColor: goal.accentColor?.trim() || "#8B5CF6",
    accountName: goal.accountName?.trim() || "Cuenta principal",
  };
}

function normalizeGoals(goals: GoalApi[]): GoalApi[] {
  return goals.map(normalizeGoal);
}

function unwrapGoalsResponse(response: GoalsResponse): GoalApi[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && typeof response === "object" && "goals" in response && Array.isArray(response.goals)) {
    return response.goals;
  }

  if (response && typeof response === "object") {
    return [response];
  }

  return [];
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function getGoalsData(): Promise<GoalApi[]> {
  try {
    const response = await apiGet<GoalsResponse>("/goals");
    return normalizeGoals(unwrapGoalsResponse(response));
  } catch {
    await wait(650);
    return normalizeGoals(MOCK_GOALS_DATA);
  }
}

export async function createGoal(payload: CreateGoalDTO): Promise<GoalApi> {
  const response = await apiPost<GoalApi>("/goals", payload);
  return normalizeGoal(response);
}
