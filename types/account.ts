import { TransactionDTO } from "./transaction";
import {
  CreateAccountRequestDTO,
  CreateAccountResponseDTO,
  GetAccountDetailResponseDTODTO,
} from "./api/account";

export type AccountOption = {
  label: string;
  value: string;
  currencyCode: string;
};

export type AccountSummary = AccountOption & {
  balance: number;
  currencySymbol: string;
};

export type CreateAccountDTO = CreateAccountRequestDTO;

export type CreateAccountResponse = CreateAccountResponseDTO;

export type AccountDetail = Omit<GetAccountDetailResponseDTODTO, "transactions"> & {
  transactions: TransactionDTO[];
};
