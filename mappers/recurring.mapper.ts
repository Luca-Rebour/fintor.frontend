import {
  GetRecurringTransactionDTO,
  RecurringTransactionDTO,
} from "../types/api/recurringTransaction";
import {
  RecurringTransactionModel,
} from "../types/models/recurring.model";

type RecurringPendingApprovalDtoLike = {
  id: string;
  dueDate: string;
  status: number;
  description: string;
  transactionType: number;
  amount: number;
  categoryName: string;
  icon: string;
  accountName: string;
  currencyCode: string;
};

export function mapRecurringTransactionDtoToModel(
  dto: GetRecurringTransactionDTO | RecurringTransactionDTO,
): RecurringTransactionModel {
  return {
    id: String(dto.id ?? ""),
    name: String(dto.name ?? "").trim(),
    amount: Number.isFinite(Number(dto.amount)) ? Number(dto.amount) : 0,
    description: String(dto.description ?? "").trim(),
    transactionType: (dto.transactionType === 0 ? 0 : 1) as RecurringTransactionModel["transactionType"],
    icon: String(dto.icon ?? "Repeat").trim() || "Repeat",
    frequency: Number(dto.frequency) as RecurringTransactionModel["frequency"],
    startDate: dto.startDate || "",
    endDate: dto.endDate || "",
    lastGeneratedAt: dto.lastGeneratedAt || "",
    nextChargeDate: dto.nextChargeDate || "",
    currencyCode: String(dto.currencyCode ?? "USD").trim().toUpperCase() || "USD",
    accountName: String(dto.accountName ?? "Main account").trim() || "Main account",
  };
}

export function mapRecurringPendingApprovalDtoToModel(dto: RecurringPendingApprovalDtoLike) {
  return {
    id: String(dto.id ?? ""),
    dueDate: dto.dueDate || "",
    status: Number(dto.status),
    description: String(dto.description ?? "").trim(),
    transactionType: dto.transactionType,
    amount: Number.isFinite(Number(dto.amount)) ? Number(dto.amount) : 0,
    categoryName: String(dto.categoryName ?? "").trim(),
    icon: String(dto.icon ?? "").trim(),
    accountName: String(dto.accountName ?? "").trim(),
    currencyCode: String(dto.currencyCode ?? "USD").trim().toUpperCase() || "USD",
  };
}
