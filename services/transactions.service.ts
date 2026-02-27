import { CreateTransactionDTO, TransactionDTO } from "../types/transaction";
import { apiGet, apiPost } from "./api.client";
import { CATEGORY_COLOR_BY_NAME } from "../constants/colors";

type TransactionsResponse = TransactionDTO[] | { transactions: TransactionDTO[] } | TransactionDTO;

function normalizeTransaction(transaction: TransactionDTO): TransactionDTO {
  const category = (transaction.categoryName ?? transaction.categoryName ?? "Other").trim();
  const type = transaction.transactionType ?? transaction.transactionType ?? 1;
  const account = (transaction.accountName ?? transaction.accountName ?? "Main account").trim();
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
  };
}

function normalizeTransactions(transactions: TransactionDTO[]): TransactionDTO[] {
  return transactions.map(normalizeTransaction);
}

export async function getTransactionsData(): Promise<TransactionDTO[]> {
  try {
    const response = await apiGet<TransactionsResponse>("/transactions");

    if (Array.isArray(response)) return normalizeTransactions(response);

    console.error("Unexpected transactions response shape:", response);
    return [];
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

export async function addNewTransaction(
  transaction: CreateTransactionDTO
): Promise<TransactionDTO> {
  try {
    console.log("Attempting to create transaction:", transaction);
    
    const response = await apiPost<TransactionDTO>(
      "/transactions",
      transaction
    );

    return normalizeTransaction(response);

  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}