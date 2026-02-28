import { CreateTransactionDTO, TransactionDTO } from "../types/transaction";
import { apiGet, apiPost } from "./api.client";
import { CATEGORY_COLOR_BY_NAME } from "../constants/colors";

type TransactionsResponse = TransactionDTO[] | { transactions: TransactionDTO[] } | TransactionDTO;
type TransactionsObserver = (transactions: TransactionDTO[]) => void;

let transactionsStore: TransactionDTO[] = [];
const transactionsObservers = new Set<TransactionsObserver>();

function notifyTransactionsObservers() {
  const snapshot = [...transactionsStore];
  for (const observer of transactionsObservers) {
    observer(snapshot);
  }
}

function updateTransactionsStore(transactions: TransactionDTO[]) {
  transactionsStore = transactions;
  notifyTransactionsObservers();
}

export function subscribeToTransactions(observer: TransactionsObserver): () => void {
  transactionsObservers.add(observer);
  observer([...transactionsStore]);

  return () => {
    transactionsObservers.delete(observer);
  };
}

export function getTransactionsSnapshot(): TransactionDTO[] {
  return [...transactionsStore];
}

function normalizeTransaction(transaction: TransactionDTO): TransactionDTO {
  const category = (transaction.categoryName ?? transaction.categoryName ?? "Other").trim();
  const type = transaction.transactionType ?? transaction.transactionType ?? 1;
  const account = (transaction.accountName ?? transaction.accountName ?? "Main account").trim();
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
    icon: transaction.icon || (type === 0 ? "dollar-sign" : "shopping-cart"),
    accountName: account,
    categoryColor,
    currencyCode: currencyCode || "USD",
    exchangeRate,
  };
}

function normalizeTransactions(transactions: TransactionDTO[]): TransactionDTO[] {
  return transactions.map(normalizeTransaction);
}

export async function getTransactionsData(): Promise<TransactionDTO[]> {
  try {
    const response = await apiGet<TransactionsResponse>("/transactions");

    const rawTransactions = Array.isArray(response)
      ? response
      : "transactions" in response
        ? response.transactions
        : [response];

    const normalizedTransactions = normalizeTransactions(rawTransactions);
    updateTransactionsStore(normalizedTransactions);
    return normalizedTransactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    updateTransactionsStore([]);
    return [];
  }
}

export async function addNewTransaction(
  transaction: CreateTransactionDTO
): Promise<TransactionDTO> {
  try {
    const response = await apiPost<TransactionDTO>(
      "/transactions",
      transaction
    );

    const createdTransaction = normalizeTransaction(response);
    updateTransactionsStore([createdTransaction, ...transactionsStore]);
    return createdTransaction;

  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}