import { CreateGoalDTO, GoalApi } from "../types/goals.types";
import { apiGet, apiPost } from "./api.client";

type GoalsResponse = GoalApi[] | { goals: GoalApi[] } | GoalApi;

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
    currencyCode: goal.currencyCode?.trim().toUpperCase() || "USD",
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

export async function getGoalsData(): Promise<GoalApi[]> {
  try {
    const response = await apiGet<GoalsResponse>("/goals");
    return normalizeGoals(unwrapGoalsResponse(response));
  } catch {
    return [];
  }
}

export async function createGoal(payload: CreateGoalDTO): Promise<GoalApi> {
  const response = await apiPost<GoalApi>("/goals", payload);
  return normalizeGoal(response);
}
