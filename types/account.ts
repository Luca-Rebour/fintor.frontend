
export type AccountApiItem = {
    id: string;
    name: string;
    balance: number;
    currency: {
      id: string;
      code: string;
      symbol: string;
      name: string;
    };
};

export type AccountsResponse =
	| AccountApiItem[]
	| { accounts: AccountApiItem[] }
  | { data: AccountApiItem[] };

export type AccountOption = {
  label: string;
  value: string;
  currencyCode: string;
};

export type CreateAccountDTO = {
  name: string;
  initialBalance: number;
  currencyCode: string;
};

export type CreateAccountResponse = AccountApiItem;