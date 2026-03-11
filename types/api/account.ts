// CREATE ACCOUNT REQUEST/RESPONSE
export type CreateAccountRequestDTO = {
    currencyCode: string,
    name: string,
    initialBalance: number,
    exchangeRate: number,
    icon: string;
}

export type CreateAccountResponseDTO = {
  id: string;
  name: string;
  balance: number;
  currency: CreateAccountCurrencyResponseDTO;
  icon: string;
}

export type CreateAccountCurrencyResponseDTO = {
  id: string;
  code: string;
}


// GET ACCOUNTS RESPONSE
export type GetAccountsResponseDTO = GetAccountDTO[];

export type GetAccountDTO = {
  id: string;
  name: string;
  balance: number;
  currency: GetAccountsCurrencyResponseDTO;
  icon: string;
  totalBalance: number;
  availableBalance: number;
  
}

export type GetAccountsCurrencyResponseDTO = {
  id: string;
  code: string;
}

// GET ACCOUNT TRANSACTIONS RESPONSE
export type GetAccountTransactionsResponseDTO = AccountTransactionDTO[];

export type AccountTransactionDTO = {
  id: string;
  amount: number;
  description: string;
  date: string;
  transactionType: number;
  isRecurringTransaction: boolean;
  categoryName: string;
  accountName: string | null;
  exchangeRate: number;
  currencyCode: string | null;
  icon: string;
};

// ACCOUNT DETAIL RESPONSE
export type GetAccountDetailResponseDTODTO = {
  id: string;
  name: string;
  currencyCode: string;
  availableBalance: number;
  allocatedToGoalsBalance: number;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  transactions: AccountDetailTransactionDTO[];
};

export type AccountDetailTransactionDTO = {
  id: string;
  amount: number;
  description: string;
  date: string; // ISO string
  transactionType: number;
  isRecurringTransaction: boolean;
  categoryName: string;
  accountName: string | null;
  exchangeRate: number;
  currencyCode: string | null;
  icon: string;
};