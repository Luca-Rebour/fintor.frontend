import {
  CreateTransactionInputModel as CreateTransactionDTO,
  TransactionModel as TransactionDTO,
} from "../types/models/transaction.model";
import {
  CreateTransactionResponseDTO,
  GetTransactionsResponseDTO,
} from "../types/api/transaction";
import {
  mapCreateTransactionInputModelToRequestDto,
  mapTransactionDtoToModel,
} from "../mappers/transaction.mapper";
import { apiDelete, apiGet, apiPost } from "./api.client";

type TransactionsObserver = (transactions: TransactionDTO[]) => void;
type ExpenseCreatedObserver = () => void;
type TransactionDeletedObserver = () => void;

let transactionsStore: TransactionDTO[] = [];
const transactionsObservers = new Set<TransactionsObserver>();
const expenseCreatedObservers = new Set<ExpenseCreatedObserver>();
const transactionDeletedObservers = new Set<TransactionDeletedObserver>();

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

function notifyExpenseCreatedObservers() {
  for (const observer of expenseCreatedObservers) {
    observer();
  }
}

function notifyTransactionDeletedObservers() {
  for (const observer of transactionDeletedObservers) {
    observer();
  }
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

export function subscribeToExpenseCreated(observer: ExpenseCreatedObserver): () => void {
  expenseCreatedObservers.add(observer);

  return () => {
    expenseCreatedObservers.delete(observer);
  };
}

export function subscribeToTransactionDeleted(observer: TransactionDeletedObserver): () => void {
  transactionDeletedObservers.add(observer);

  return () => {
    transactionDeletedObservers.delete(observer);
  };
}

export async function getTransactionsData(): Promise<TransactionDTO[]> {
  try {
    const response = await apiGet<GetTransactionsResponseDTO>("/transactions");
    const mappedTransactions = response.map(mapTransactionDtoToModel);

    updateTransactionsStore(mappedTransactions);
    return mappedTransactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    updateTransactionsStore([]);
    return [];
  }
}

export async function addNewTransaction(
  transaction: CreateTransactionDTO,
): Promise<TransactionDTO> {
  try {
    const response = await apiPost<CreateTransactionResponseDTO>(
      "/transactions",
      mapCreateTransactionInputModelToRequestDto(transaction),
    );

    const createdTransaction = mapTransactionDtoToModel(response);
    updateTransactionsStore([createdTransaction, ...transactionsStore]);

    if (transaction.transactionType === 1) {
      notifyExpenseCreatedObservers();
    }

    return createdTransaction;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}

export async function deleteTransactionById(transactionId: string): Promise<void> {
  const normalizedId = String(transactionId).trim();

  if (!normalizedId) {
    throw new Error("El id de la transacción es obligatorio");
  }

  try {
    await apiDelete<unknown>(`/transactions/${encodeURIComponent(normalizedId)}`);

    updateTransactionsStore(
      transactionsStore.filter((transaction) => transaction.id !== normalizedId),
    );

    notifyTransactionDeletedObservers();
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
}
