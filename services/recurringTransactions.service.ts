import { apiGet, apiPost } from "./api.client";
import {
  RecurringTransactionApiDTO,
  RecurringPendingApprovalApiDTO,
} from "../types/api/recurring";
import { PendingTransactionStatus } from "../types/enums/pendingTransactionStatus";
import { TransactionType } from "../types/enums/transactionType";
import {
  RecurringPendingApproval,
  RecurringSubscription,
  RecurringTransactionType,
  RecurringTransactionsData,
} from "../types/recurring";

const RECURRING_ENDPOINT_PATH = "/recurring-transactions";

const RECURRING_PENDING_ACTIONS_PATH = `/pending-approval-transactions`;

type RecurringTransactionsResponse = RecurringTransactionApiDTO[] | null;
type PendingApprovalsResponse = RecurringPendingApprovalApiDTO[] | null;

function normalizeTransactionType(value: TransactionType | number | unknown): RecurringTransactionType {
  const parsed = Number(value);
  return parsed === TransactionType.Income ? "income" : "expense";
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

function normalizeSubscription(dto: RecurringTransactionApiDTO): RecurringSubscription {
  return {
    id: String(dto.id ?? `subscription_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
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
  const subscriptionsRaw = Array.isArray(recurringTransactionsResponse)
    ? recurringTransactionsResponse
    : [];
  const pendingApprovalsRaw = Array.isArray(pendingApprovalsResponse)
    ? pendingApprovalsResponse
    : [];
  const pendingApprovalRaw = pickPendingApproval(pendingApprovalsRaw);

  return {
    pendingApproval: pendingApprovalRaw ? normalizePendingApproval(pendingApprovalRaw) : null,
    subscriptions: subscriptionsRaw.map(normalizeSubscription),
  };
}

export async function getRecurringTransactionsData(): Promise<RecurringTransactionsData> {
  const [recurringTransactionsResponse, pendingApprovalsResponse] = await Promise.all([
    apiGet<RecurringTransactionsResponse>(RECURRING_ENDPOINT_PATH),
    apiGet<PendingApprovalsResponse>(RECURRING_PENDING_ACTIONS_PATH),
  ]);

  return mapRecurringResponse(recurringTransactionsResponse, pendingApprovalsResponse);
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
