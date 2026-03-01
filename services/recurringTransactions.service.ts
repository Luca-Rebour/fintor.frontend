import { apiGet } from "./api.client";
import {
  RecurringTransactionApiDTO,
  RecurringPendingApprovalApiDTO,
  RecurringTransactionsApiResponse,
} from "../types/api/recurring";
import { PendingTransactionStatus } from "../types/enums/pendingTransactionStatus";
import { TransactionType } from "../types/enums/transactionType";
import {
  RecurringPendingApproval,
  RecurringSubscription,
  RecurringTransactionType,
  RecurringTransactionsData,
} from "../types/recurring";

const RECURRING_ENDPOINT_PATH = "/transactions/recurring";

const MOCK_RECURRING_RESPONSE: RecurringTransactionsApiResponse = {
  pendingApproval: {
    id: "pending_salary_1",
    dueDate: "2026-09-30",
    status: PendingTransactionStatus.Pending,
    description: "Monthly Salary",
    transactionType: TransactionType.Income,
    amount: 4200,
    categoryName: "Salary",
    icon: "WalletCards",
    accountName: "Main Account",
    currencyCode: "USD",
  },
  recurringTransactions: [
    {
      id: "subscription_netflix",
      name: "Netflix Premium",
      amount: 19.99,
      description: "Monthly entertainment plan",
      transactionType: TransactionType.Expense,
      frequency: 3,
      startDate: "2026-01-01",
      endDate: "2030-01-01",
      lastGeneratedAt: "2026-09-02",
      nextChargeDate: "2026-10-02",
      currencyCode: "USD",
      accountName: "Savings Account",
    },
    {
      id: "subscription_rent",
      name: "Rent Payment",
      amount: 1250,
      description: "Monthly apartment rent",
      transactionType: TransactionType.Expense,
      frequency: 3,
      startDate: "2026-01-01",
      endDate: "2030-01-01",
      lastGeneratedAt: "2026-09-05",
      nextChargeDate: "2026-10-05",
      currencyCode: "USD",
      accountName: "Checking Account",
    },
    {
      id: "subscription_energy",
      name: "Electricity Bill",
      amount: 84.2,
      description: "Electricity usage",
      transactionType: TransactionType.Expense,
      frequency: 3,
      startDate: "2026-01-01",
      endDate: "2030-01-01",
      lastGeneratedAt: "2026-09-12",
      nextChargeDate: "2026-10-12",
      currencyCode: "USD",
      accountName: "Main Account",
    },
    {
      id: "subscription_spotify",
      name: "Spotify Family",
      amount: 15.99,
      description: "Music subscription",
      transactionType: TransactionType.Expense,
      frequency: 3,
      startDate: "2026-01-01",
      endDate: "2030-01-01",
      lastGeneratedAt: "2026-09-15",
      nextChargeDate: "2026-10-15",
      currencyCode: "USD",
      accountName: "Credit Card",
    },
    {
      id: "income_dividends",
      name: "ETF Dividends",
      amount: 130,
      description: "Monthly dividends",
      transactionType: TransactionType.Income,
      frequency: 3,
      startDate: "2026-01-01",
      endDate: "2030-01-01",
      lastGeneratedAt: "2026-09-03",
      nextChargeDate: "2026-10-03",
      currencyCode: "USD",
      accountName: "Broker Account",
    },
  ],
};

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

  if (!parsedDate) {
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

function mapRecurringResponse(response: RecurringTransactionsApiResponse): RecurringTransactionsData {
  const pendingApprovalRaw = response.pendingApproval ?? null;
  const subscriptionsRaw = response.recurringTransactions ?? [];

  return {
    pendingApproval: pendingApprovalRaw ? normalizePendingApproval(pendingApprovalRaw) : null,
    subscriptions: Array.isArray(subscriptionsRaw) ? subscriptionsRaw.map(normalizeSubscription) : [],
  };
}

export async function getRecurringTransactionsData(): Promise<RecurringTransactionsData> {
  try {
    const response = await apiGet<RecurringTransactionsApiResponse>(RECURRING_ENDPOINT_PATH);
    return mapRecurringResponse(response);
  } catch {
    return mapRecurringResponse(MOCK_RECURRING_RESPONSE);
  }
}
