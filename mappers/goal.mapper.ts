import {
  CreateGoalRequestDTO,
  CreateGoalResponseDTO,
  GetGoalDTO,
  GetGoalTransaction,
} from "../types/api/goal";
import {
  CreateGoalInputModel,
  GoalModel,
} from "../types/models/goal.model";
import { mapTransactionDtoToModel } from "./transaction.mapper";

export function mapGoalDtoToModel(dto: GetGoalDTO | CreateGoalResponseDTO): GoalModel {
  return {
    id: String(dto.id ?? `goal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
    title: String(dto.title ?? "Sin título").trim() || "Sin título",
    description: String(dto.description ?? "").trim(),
    targetAmount: Number.isFinite(Number(dto.targetAmount)) && Number(dto.targetAmount) > 0 ? Number(dto.targetAmount) : 0,
    currentAmount: Number.isFinite(Number(dto.currentAmount)) && Number(dto.currentAmount) > 0 ? Number(dto.currentAmount) : 0,
    icon: String(dto.icon ?? "Target").trim() || "Target",
    targetDate: dto.targetDate || new Date().toISOString(),
    accentColor: String(dto.accentColor ?? "#8B5CF6").trim() || "#8B5CF6",
    accountName: String(dto.accountName ?? "Cuenta principal").trim() || "Cuenta principal",
    currencyCode: String(dto.currencyCode ?? "USD").trim().toUpperCase() || "USD",
  };
}

export function mapGoalTransactionDtoToModel(dto: GetGoalTransaction) {
  return mapTransactionDtoToModel(dto);
}

export function mapCreateGoalInputModelToRequestDto(model: CreateGoalInputModel): CreateGoalRequestDTO {
  return {
    title: model.title,
    description: model.description,
    targetAmount: model.targetAmount,
    currentAmount: model.currentAmount,
    icon: model.icon,
    targetDate: model.targetDate,
    accentColor: model.accentColor,
    accountId: model.accountId,
    exchangeRate: model.exchangeRate,
  };
}
