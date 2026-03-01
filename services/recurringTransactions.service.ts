import { apiDelete, apiGet, apiPost, apiPut } from "./api.client";
import {
  RecurringTransactionApiDTO,
  RecurringPendingApprovalApiDTO,
} from "../types/api/recurring";
import { Frequency } from "../types/enums/frequency";
import { PendingTransactionStatus } from "../types/enums/pendingTransactionStatus";
import { TransactionType } from "../types/enums/transactionType";
import {
  RecurringPendingApproval,
  RecurringTransaction,
  RecurringTransactionType,
  RecurringTransactionsData,
} from "../types/recurring";

const RECURRING_ENDPOINT_PATH = "/recurring-transactions";

const RECURRING_PENDING_ACTIONS_PATH = `/pending-approval-transactions`;

type RecurringTransactionsResponse = RecurringTransactionApiDTO[] | null;
type PendingApprovalsResponse = RecurringPendingApprovalApiDTO[] | null;

export type UpsertRecurringTransactionInput = {
  name: string;
  amount: number;
  description: string;
  transactionType: RecurringTransactionType;
  frequency: Frequency;
  startDate: string;
  endDate: string;
  accountName: string;
  currencyCode: string;
};

type UpsertRecurringTransactionApiPayload = {
  name: string;
  amount: number;
  description: string;
  transactionType: TransactionType;
  frequency: Frequency;
  startDate: string;
  endDate: string;
  accountName: string;
  currencyCode: string;
};

function normalizeTransactionType(value: TransactionType | number | unknown): RecurringTransactionType {
  const parsed = Number(value);
  return parsed === TransactionType.Income ? "income" : "expense";
}

function parseTransactionTypeToApi(value: RecurringTransactionType): TransactionType {
  return value === "income" ? TransactionType.Income : TransactionType.Expense;
}

function normalizeAmount(value: unknown): number {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return Math.abs(parsed);
  }

  return 0;
}

function normalizeCurrencyCode(value: unknown): string {
  const normalized = String(value ?? "").trim().toUpperCase();
  return normalized || "USD";
}

function normalizeDate(value: unknown): string {
  const parsedDate = String(value ?? "").trim();

  if (!parsedDate || parsedDate.startsWith("0001-01-01")) {
    return new Date().toISOString();
  }

  const asDate = new Date(parsedDate);
  if (Number.isNaN(asDate.getTime())) {
    return new Date().toISOString();
  }

  return asDate.toISOString();
}

function toApiDateString(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date format");
  }

  return parsed.toISOString();
}

function toApiUpsertPayload(input: UpsertRecurringTransactionInput): UpsertRecurringTransactionApiPayload {
  const normalizedName = input.name.trim();
  const normalizedDescription = input.description.trim();
  const normalizedAccountName = input.accountName.trim();
  const normalizedCurrencyCode = input.currencyCode.trim().toUpperCase();

  if (!normalizedName) {
    throw new Error("Name is required");
  }

  if (!normalizedDescription) {
    throw new Error("Description is required");
  }

  if (!normalizedAccountName) {
    throw new Error("Account name is required");
  }

  if (!normalizedCurrencyCode) {
    throw new Error("Currency code is required");
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  return {
    name: normalizedName,
    amount: Number(input.amount),
    description: normalizedDescription,
    transactionType: parseTransactionTypeToApi(input.transactionType),
    frequency: input.frequency,
    startDate: toApiDateString(input.startDate),
    endDate: toApiDateString(input.endDate),
    accountName: normalizedAccountName,
    currencyCode: normalizedCurrencyCode,
  };
}

function normalizePendingApproval(dto: RecurringPendingApprovalApiDTO): RecurringPendingApproval {
  const normalizedType = normalizeTransactionType(dto.transactionType);

  return {
    id: String(dto.id ?? `pending_${Date.now()}`),
    title: String(dto.description ?? dto.categoryName ?? "Pending approval").trim() || "Pending approval",
    amount: normalizeAmount(dto.amount),
    currencyCode: normalizeCurrencyCode(dto.currencyCode),
    expectedDate: normalizeDate(dto.dueDate),
    accountName: String(dto.accountName ?? "Main account").trim() || "Main account",
    transactionType: normalizedType,
    requiresAction: dto.status === PendingTransactionStatus.Pending,
  };
}

function resolveRecurringIcon(dto: RecurringTransactionApiDTO): string {
  const normalizedName = String(dto.name ?? "").trim().toLowerCase();

  if (normalizedName.includes("rent")) {
    return "Landmark";
  }

  if (normalizedName.includes("netflix") || normalizedName.includes("spotify")) {
    return "Play";
  }

  if (normalizedName.includes("electric")) {
    return "Zap";
  }

  return dto.transactionType === TransactionType.Income ? "TrendingUp" : "Repeat";
}

function normalizeRecurringTransaction(dto: RecurringTransactionApiDTO): RecurringTransaction {
  return {
    id: String(dto.id ?? `recurring_transaction_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
    name: String(dto.name ?? "Recurring transaction").trim() || "Recurring transaction",
    amount: normalizeAmount(dto.amount),
    currencyCode: normalizeCurrencyCode(dto.currencyCode),
    nextChargeDate: normalizeDate(dto.nextChargeDate),
    accountName: String(dto.accountName ?? "Main account").trim() || "Main account",
    transactionType: normalizeTransactionType(dto.transactionType),
    icon: resolveRecurringIcon(dto),
  };
}

function pickPendingApproval(
  pendingApprovals: RecurringPendingApprovalApiDTO[],
): RecurringPendingApprovalApiDTO | null {
  const pendingOnly = pendingApprovals.filter(
    (approval) => approval.status === PendingTransactionStatus.Pending,
  );

  if (!pendingOnly.length) {
    return null;
  }

  return [...pendingOnly].sort(
    (left, right) => +new Date(left.dueDate) - +new Date(right.dueDate),
  )[0];
}

function mapRecurringResponse(
  recurringTransactionsResponse: RecurringTransactionsResponse,
  pendingApprovalsResponse: PendingApprovalsResponse,
): RecurringTransactionsData {
  const recurringTransactionsRaw = Array.isArray(recurringTransactionsResponse)
    ? recurringTransactionsResponse
    : [];
  const pendingApprovalsRaw = Array.isArray(pendingApprovalsResponse)
    ? pendingApprovalsResponse
    : [];
  const pendingApprovalRaw = pickPendingApproval(pendingApprovalsRaw);

  return {
    pendingApproval: pendingApprovalRaw ? normalizePendingApproval(pendingApprovalRaw) : null,
    recurringTransactions: recurringTransactionsRaw.map(normalizeRecurringTransaction),
  };
}

export async function getRecurringTransactionsData(): Promise<RecurringTransactionsData> {
  const [recurringTransactionsResponse, pendingApprovalsResponse] = await Promise.all([
    apiGet<RecurringTransactionsResponse>(RECURRING_ENDPOINT_PATH),
    apiGet<PendingApprovalsResponse>(RECURRING_PENDING_ACTIONS_PATH),
  ]);

  return mapRecurringResponse(recurringTransactionsResponse, pendingApprovalsResponse);
}

export async function getRecurringTransactionsList(): Promise<RecurringTransactionApiDTO[]> {
  const response = await apiGet<RecurringTransactionsResponse>(RECURRING_ENDPOINT_PATH);
  return Array.isArray(response) ? response : [];
}

function ensurePendingApprovalId(approvalId: string): string {
  const normalizedId = String(approvalId ?? "").trim();

  if (!normalizedId) {
    throw new Error("Pending approval id is required");
  }

  return encodeURIComponent(normalizedId);
}

export async function confirmPendingRecurringApproval(approvalId: string): Promise<void> {
  const encodedId = ensurePendingApprovalId(approvalId);
  await apiPost<unknown>(`${RECURRING_PENDING_ACTIONS_PATH}/${encodedId}/confirm`, {});
}

export async function reschedulePendingRecurringApproval(approvalId: string, dueDate: string): Promise<void> {
  const encodedId = ensurePendingApprovalId(approvalId);
  await apiPost<unknown>(`${RECURRING_PENDING_ACTIONS_PATH}/${encodedId}/reschedule`, {
    dueDate,
  });
}

export async function createRecurringTransaction(
  input: UpsertRecurringTransactionInput,
): Promise<RecurringTransactionApiDTO> {
  const payload = toApiUpsertPayload(input);
  return apiPost<RecurringTransactionApiDTO>(RECURRING_ENDPOINT_PATH, payload);
}

export async function updateRecurringTransaction(
  transactionId: string,
  input: UpsertRecurringTransactionInput,
): Promise<RecurringTransactionApiDTO> {
  const normalizedId = String(transactionId ?? "").trim();

  if (!normalizedId) {
    throw new Error("Recurring transaction id is required");
  }

  const payload = toApiUpsertPayload(input);
  return apiPut<RecurringTransactionApiDTO>(
    `${RECURRING_ENDPOINT_PATH}/${encodeURIComponent(normalizedId)}`,
    payload,
  );
}

export async function deleteRecurringTransaction(transactionId: string): Promise<void> {
  const normalizedId = String(transactionId ?? "").trim();

  if (!normalizedId) {
    throw new Error("Recurring transaction id is required");
  }

  await apiDelete<unknown>(`${RECURRING_ENDPOINT_PATH}/${encodeURIComponent(normalizedId)}`);
}
