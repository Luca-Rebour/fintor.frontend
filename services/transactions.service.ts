import { ProfileData } from "../types/profile";
import { TransactionDTO } from "../types/transaction";

type TransactionApiResponse = TransactionDTO;

const MOCK_TRANSACTIONS_RESPONSE: TransactionApiResponse[] = [
    {
        id: "txn_12345",
        date: "2024-06-1T14:30:00Z",
        amount: 75.50,
        description: "Grocery Store",
        category: "Food & Dining",
        type: "expense",
        icon: "shopping-cart",
        account: "Checking Account",
    },
    {
        id: "txn_12346",
        date: "2024-06-14T09:00:00Z",
        amount: 1500.00,
        description: "Salary",
        category: "Income",
        type: "income",
        icon: "dollar-sign",
        account: "Checking Account",
    },
    {   
        id: "txn_12347",
        date: "2024-06-13T18:45:00Z",
        amount: 25.00,
        description: "Coffee Shop",
        category: "Food & Dining",
        type: "expense",
        icon: "coffee",
        account: "Credit Card",
    }
];

function mapTransactionResponse(response: TransactionApiResponse[]): TransactionDTO[] {
  return response;
}

export async function getTransactionsData(): Promise<TransactionDTO[]> {
  return mapTransactionResponse(MOCK_TRANSACTIONS_RESPONSE);
}