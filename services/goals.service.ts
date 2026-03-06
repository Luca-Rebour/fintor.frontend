import { CreateGoalDTO, GoalApi } from "../types/goals.types";
import { TransactionDTO } from "../types/transaction";
import { CATEGORY_COLOR_BY_NAME } from "../constants/colors";
import { apiGet, apiPost } from "./api.client";

type GoalsResponse = GoalApi[] | { goals: GoalApi[] } | GoalApi;
type GoalTransactionsResponse = TransactionDTO[] | { transactions: TransactionDTO[] } | TransactionDTO;

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

function normalizeGoalTransaction(transaction: TransactionDTO): TransactionDTO {
  const category = (transaction.categoryName ?? "Other").trim();
  const type = transaction.transactionType ?? 1;
  const account = (transaction.accountName ?? "Main account").trim();
  const currencyCode = (transaction.currencyCode ?? "USD").trim().toUpperCase();
  const rawExchangeRate =
    (transaction as unknown as { exchangeRate?: unknown; ExchangeRate?: unknown; rate?: unknown }).exchangeRate ??
    (transaction as unknown as { exchangeRate?: unknown; ExchangeRate?: unknown; rate?: unknown }).ExchangeRate ??
    (transaction as unknown as { exchangeRate?: unknown; ExchangeRate?: unknown; rate?: unknown }).rate;
  const exchangeRate =
    rawExchangeRate == null
      ? null
      : Number.isFinite(Number(rawExchangeRate)) && Number(rawExchangeRate) > 0
        ? Number(rawExchangeRate)
        : null;
  const categoryColor =
    transaction.categoryColor ??
    CATEGORY_COLOR_BY_NAME[category] ??
    (type === 1 ? "#18C8FF" : "#FF6B6B");

  return {
    id: String(transaction.id ?? `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
    date: transaction.date ?? new Date().toISOString(),
    amount: typeof transaction.amount === "number" ? transaction.amount : 0,
    description: transaction.description?.trim() || "Sin descripción",
    categoryName: category,
    transactionType: type,
    icon: transaction.icon || (type === 0 ? "DollarSign" : "ShoppingCart"),
    accountName: account,
    categoryColor,
    currencyCode: currencyCode || "USD",
    exchangeRate,
    goalId: transaction.goalId,
    goalTitle: transaction.goalTitle,
  };
}

function unwrapGoalTransactionsResponse(response: GoalTransactionsResponse): TransactionDTO[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && typeof response === "object" && "transactions" in response && Array.isArray(response.transactions)) {
    return response.transactions;
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

export async function getGoalTransactionsData(goalId: string): Promise<TransactionDTO[]> {
  const normalizedGoalId = goalId.trim();

  if (!normalizedGoalId) {
    return [];
  }

  try {
    const response = await apiGet<GoalTransactionsResponse>(`/goals/${encodeURIComponent(normalizedGoalId)}/transactions`);
    const rawTransactions = unwrapGoalTransactionsResponse(response);
    return rawTransactions.map(normalizeGoalTransaction);
  } catch {
    return [];
  }
}
