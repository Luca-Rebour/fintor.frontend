import {
  CreateTransactionRequestDTO,
  CreateTransactionResponseDTO,
  GetTransactionDTO,
} from "../types/api/transaction";
import {
  CreateTransactionInputModel,
  TransactionModel,
} from "../types/models/transaction.model";
import { CATEGORY_COLOR_BY_NAME } from "../constants/colors";

function normalizeTransactionType(value: number): 0 | 1 {
  return value === 0 ? 0 : 1;
}

export function mapTransactionDtoToModel(
  dto: GetTransactionDTO | CreateTransactionResponseDTO,
): TransactionModel {
  const transactionType = normalizeTransactionType(dto.transactionType);
  const categoryName = String(dto.categoryName ?? "Other").trim() || "Other";

  return {
    id: String(dto.id ?? `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
    date: dto.date ?? new Date().toISOString(),
    amount: Number.isFinite(Number(dto.amount)) ? Number(dto.amount) : 0,
    description: String(dto.description ?? "Sin descripción").trim() || "Sin descripción",
    categoryName,
    transactionType,
    icon: String(dto.icon ?? (transactionType === 0 ? "DollarSign" : "ShoppingCart")),
    accountName: String(dto.accountName ?? "Main account").trim() || "Main account",
    categoryColor: CATEGORY_COLOR_BY_NAME[categoryName] ?? (transactionType === 1 ? "#18C8FF" : "#FF6B6B"),
    currencyCode: String(dto.currencyCode ?? "USD").trim().toUpperCase() || "USD",
    exchangeRate:
      Number.isFinite(Number(dto.exchangeRate)) && Number(dto.exchangeRate) > 0
        ? Number(dto.exchangeRate)
        : null,
    isRecurringTransaction: Boolean(dto.isRecurringTransaction),
    goalId:
      typeof (dto as unknown as { goalId?: unknown }).goalId === "string"
        ? ((dto as unknown as { goalId?: string }).goalId?.trim() || undefined)
        : undefined,
    goalTitle:
      typeof (dto as unknown as { goalTitle?: unknown }).goalTitle === "string"
        ? ((dto as unknown as { goalTitle?: string }).goalTitle?.trim() || undefined)
        : undefined,
  };
}

export function mapCreateTransactionInputModelToRequestDto(
  model: CreateTransactionInputModel,
): CreateTransactionRequestDTO {
  return {
    accountId: model.accountId,
    categoryId: model.categoryId,
    recurringTransactionId: model.recurringTransactionId ?? null,
    goalId: model.goalId ?? null,
    amount: model.amount,
    description: model.description,
    exchangeRate: Number.isFinite(Number(model.exchangeRate)) && Number(model.exchangeRate) > 0 ? Number(model.exchangeRate) : 1,
    transactionType: model.transactionType,
  };
}
