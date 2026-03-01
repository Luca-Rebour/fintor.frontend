import { apiDelete, apiGet, apiPost, apiPut } from "./api.client";
import {
  RecurringPendingApprovalApiDTO,
  RecurringTransactionApiDTO
} from "../types/api/recurring";
import { RecurringTransactionsData } from "../types/recurring";

const RECURRING_ENDPOINT_PATH = "/recurring-transactions";
const RECURRING_PENDING_ACTIONS_PATH = "/pending-approval-transactions";

type RecurringTransactionsResponse = RecurringTransactionApiDTO[] | null;
type PendingApprovalsResponse = RecurringPendingApprovalApiDTO[] | null;

export type UpsertRecurringTransactionInput = Pick<
  RecurringTransactionApiDTO,
  | "name"
  | "amount"
  | "description"
  | "transactionType"
  | "frequency"
  | "startDate"
  | "endDate"
  | "accountName"
  | "currencyCode"
>;

function toApiDateString(value: string): string {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date format");
  }

  return parsedDate.toISOString();
}

function toApiUpsertPayload(input: UpsertRecurringTransactionInput): UpsertRecurringTransactionInput {
  const normalizedName = String(input.name ?? "").trim();
  const normalizedDescription = String(input.description ?? "").trim();
  const normalizedAccountName = String(input.accountName ?? "").trim();
  const normalizedCurrencyCode = String(input.currencyCode ?? "").trim().toUpperCase();
  const normalizedAmount = Number(input.amount);

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

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  return {
    name: normalizedName,
    amount: normalizedAmount,
    description: normalizedDescription,
    transactionType: input.transactionType,
    frequency: input.frequency,
    startDate: toApiDateString(input.startDate),
    endDate: toApiDateString(input.endDate),
    accountName: normalizedAccountName,
    currencyCode: normalizedCurrencyCode,
  };
}

export async function getRecurringTransactionsData(): Promise<RecurringTransactionsData> {
  const [recurringTransactionsResponse, pendingApprovalsResponse] = await Promise.all([
    apiGet<RecurringTransactionsResponse>(RECURRING_ENDPOINT_PATH),
    apiGet<PendingApprovalsResponse>(RECURRING_PENDING_ACTIONS_PATH),
  ]);

  return {
    recurringTransactions: Array.isArray(recurringTransactionsResponse)
      ? recurringTransactionsResponse
      : [],
    pendingApprovals: Array.isArray(pendingApprovalsResponse)
      ? pendingApprovalsResponse
      : [],
  };
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
