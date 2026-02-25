import { ProfileData } from "../types/profile";
import { TransactionDTO } from "../types/transaction";

type TransactionApiResponse = TransactionDTO;

let MOCK_TRANSACTIONS_RESPONSE: TransactionApiResponse[] = [
    {
        id: "txn_12345",
        date: "2026-02-13T14:30:00Z",
        amount: 75.50,
        description: "Grocery Store",
        category: "Food & Dining",
        type: "expense",
        icon: "shopping-cart",
        account: "Checking Account",
        categoryColor: "#FF6B6B",
    },
    {
        id: "txn_12346",
        date: "2026-02-14T09:00:00Z",
        amount: 1500.00,
        description: "Salary",
        category: "Income",
        type: "income",
        icon: "dollar-sign",
        account: "Checking Account",
        categoryColor: "#4ECDC4",
    },
    {   
        id: "txn_12347",
        date: "2026-02-13T18:45:00Z",
        amount: 25.00,
        description: "Coffee Shop",
        category: "Food & Dining",
        type: "expense",
        icon: "coffee",
        account: "Credit Card",
        categoryColor: "#FF6B6B",
    },
        {   
        id: "txn_12348",
        date: "2026-02-13T18:45:00Z",
        amount: 30.00,
        description: "Restaurant",
        category: "Breakfast",
        type: "expense",
        icon: "coffee",
        account: "Credit Card",
        categoryColor: "#FF6B6B",
    }
];

function mapTransactionResponse(response: TransactionApiResponse[]): TransactionDTO[] {
  return response;
}

export async function getTransactionsData(): Promise<TransactionDTO[]> {
  return mapTransactionResponse(MOCK_TRANSACTIONS_RESPONSE);
}

function addNewTransaction(transaction: TransactionDTO): void {
    MOCK_TRANSACTIONS_RESPONSE.unshift(transaction);
    console.log("Nueva transacción agregada:", transaction);
}