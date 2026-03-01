import { apiDelete, apiGet, apiPost, apiPut } from "./api.client";
import { getAuthUserSnapshot, loadAuthenticatedUser } from "./auth.service";
import { getExchangeRateForCurrencies } from "./currencies.service";
import {
  RecurringPendingApprovalApiDTO,
  RecurringTransactionApiDTO
} from "../types/api/recurring";
import { RecurringTransactionsData, UpdateRecurringTransactionInput, CreateRecurringTransactionInput } from "../types/recurring";

const RECURRING_ENDPOINT_PATH = "/recurring-transactions";
const RECURRING_PENDING_ACTIONS_PATH = "/pending-approval-transactions";

type RecurringTransactionsResponse = RecurringTransactionApiDTO[] | null;
type PendingApprovalsResponse = RecurringPendingApprovalApiDTO[] | null;

function toApiDateString(value: string): string {
  const trimmedValue = String(value ?? "").trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  const parsedDate = new Date(trimmedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date format");
  }

  const year = parsedDate.getUTCFullYear();
  const month = String(parsedDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toApiUpsertPayload(input: CreateRecurringTransactionInput): CreateRecurringTransactionInput {
  const normalizedName = String(input.name ?? "").trim();
  const normalizedDescription = String(input.description ?? "").trim();
  const accountId = input.accountId;
  const normalizedAmount = Number(input.amount);

  if (!normalizedName) {
    throw new Error("Name is required");
  }

  if (!normalizedDescription) {
    throw new Error("Description is required");
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
    accountId: accountId,
    categoryId: input.categoryId,
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

async function getLoggedUserBaseCurrencyCode(): Promise<string> {
  const authUser = getAuthUserSnapshot();

  if (authUser?.baseCurrencyCode?.trim()) {
    return authUser.baseCurrencyCode.trim().toUpperCase();
  }

  try {
    const loadedUser = await loadAuthenticatedUser();
    if (loadedUser?.baseCurrencyCode?.trim()) {
      return loadedUser.baseCurrencyCode.trim().toUpperCase();
    }
  } catch {
  }

  return "USD";
}

export async function confirmPendingRecurringApproval(approvalId: string, sourceCurrencyCode: string): Promise<void> {
  const encodedId = ensurePendingApprovalId(approvalId);
  const sourceCurrency = String(sourceCurrencyCode ?? "").trim().toUpperCase();

  if (!sourceCurrency) {
    throw new Error("Source currency code is required");
  }

  const baseCurrencyCode = await getLoggedUserBaseCurrencyCode();
  const exchangeRate = await getExchangeRateForCurrencies(sourceCurrency, baseCurrencyCode);

  await apiPost<unknown>(`${RECURRING_PENDING_ACTIONS_PATH}/${encodedId}/approve`, exchangeRate ?? null);
}

export async function reschedulePendingRecurringApproval(approvalId: string, dueDate: string): Promise<void> {
  const encodedId = ensurePendingApprovalId(approvalId);
  await apiPost<unknown>(
    `${RECURRING_PENDING_ACTIONS_PATH}/${encodedId}/reschedule`,
    toApiDateString(dueDate),
  );
}

export async function cancelPendingRecurringApproval(approvalId: string): Promise<void> {
  const encodedId = ensurePendingApprovalId(approvalId);
  await apiPost<unknown>(`${RECURRING_PENDING_ACTIONS_PATH}/${encodedId}/cancel`, {});
}

export async function createRecurringTransaction(
  input: CreateRecurringTransactionInput,
): Promise<RecurringTransactionApiDTO> {
  const payload = toApiUpsertPayload(input);
  return apiPost<RecurringTransactionApiDTO>(RECURRING_ENDPOINT_PATH, payload);
}

export async function updateRecurringTransaction(
  transactionId: string,
  input: UpdateRecurringTransactionInput,
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
