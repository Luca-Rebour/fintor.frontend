import {
  CreateGoalInputModel as CreateGoalDTO,
  GoalModel as GoalApi,
} from "../types/models/goal.model";
import { TransactionModel as TransactionDTO } from "../types/models/transaction.model";
import {
  CreateGoalResponseDTO,
  GetGoalTransactionsResponseDTO,
  GetGoalsResponseDTO,
} from "../types/api/goal";
import {
  mapCreateGoalInputModelToRequestDto,
  mapGoalDtoToModel,
  mapGoalTransactionDtoToModel,
} from "../mappers/goal.mapper";
import { apiGet, apiPost } from "./api.client";

export async function getGoalsData(): Promise<GoalApi[]> {
  try {
    const goalDtos = await apiGet<GetGoalsResponseDTO>("/goals");
    return goalDtos.map(mapGoalDtoToModel);
  } catch {
    return [];
  }
}

export async function createGoal(payload: CreateGoalDTO): Promise<GoalApi> {
  const requestDto = mapCreateGoalInputModelToRequestDto(payload);
  const response = await apiPost<CreateGoalResponseDTO>("/goals", requestDto);
  return mapGoalDtoToModel(response);
}

export async function getGoalTransactionsData(goalId: string): Promise<TransactionDTO[]> {
  const normalizedGoalId = goalId.trim();

  if (!normalizedGoalId) {
    return [];
  }

  try {
    const rawTransactions = await apiGet<GetGoalTransactionsResponseDTO>(`/goals/${encodeURIComponent(normalizedGoalId)}/transactions`);
    return rawTransactions.map(mapGoalTransactionDtoToModel);
  } catch {
    return [];
  }
}
