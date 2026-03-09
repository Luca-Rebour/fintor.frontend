import {
  AccountDetailTransactionDTO,
  CreateAccountRequestDTO,
  CreateAccountResponseDTO,
  GetAccountDTO,
  GetAccountDetailResponseDTODTO,
  GetAccountsResponseDTO,
} from "../types/api/account";
import {
  AccountDetailModel,
  AccountOptionModel,
  AccountSummaryModel,
  CreateAccountInputModel,
  CreatedAccountModel,
} from "../types/models/account.model";
import { mapTransactionDtoToModel } from "./transaction.mapper";

function resolveCurrencyCode(input: unknown): string {
  const item = input as {
    currency?: { code?: string; Code?: string } | string;
    currencyCode?: string;
    CurrencyCode?: string;
    currency_code?: string;
  };

  const rawCode =
    item.currencyCode ??
    item.CurrencyCode ??
    item.currency_code ??
    (typeof item.currency === "string" ? item.currency : undefined) ??
    (typeof item.currency === "object" && item.currency
      ? item.currency.code ?? item.currency.Code
      : undefined);

  const normalizedCode = String(rawCode ?? "").trim().toUpperCase();
  return normalizedCode || "USD";
}

function mapAccountListItemToOption(item: GetAccountDTO): AccountOptionModel | null {
  const id = String(item.id ?? "").trim();
  const name = String(item.name ?? "").trim();

  if (!id || !name) {
    return null;
  }

  return {
    value: id,
    label: name,
    currencyCode: resolveCurrencyCode(item),
    icon: String(item.icon ?? "WalletCards").trim() || "WalletCards",
  };
}

export function mapAccountsDtoToOptionModels(items: GetAccountsResponseDTO): AccountOptionModel[] {
  return items
    .map(mapAccountListItemToOption)
    .filter((item): item is AccountOptionModel => item !== null);
}

export function mapAccountsDtoToSummaryModels(items: GetAccountsResponseDTO): AccountSummaryModel[] {
  return items
    .map((item) => {
      const option = mapAccountListItemToOption(item);
      if (!option) {
        return null;
      }

      return {
        ...option,
        balance: Number.isFinite(Number(item.balance)) ? Number(item.balance) : 0,
        totalBalance: Number.isFinite(Number(item.totalBalance))
          ? Number(item.totalBalance)
          : Number.isFinite(Number(item.balance))
            ? Number(item.balance)
            : 0,
        availableBalance: Number.isFinite(Number(item.availableBalance))
          ? Number(item.availableBalance)
          : Number.isFinite(Number(item.balance))
            ? Number(item.balance)
            : 0,
        currencySymbol: "$",
      };
    })
    .filter((item): item is AccountSummaryModel => item !== null);
}

function mapAccountDetailTransactionDtoToModel(dto: AccountDetailTransactionDTO) {
  return mapTransactionDtoToModel(dto);
}

export function mapAccountDetailDtoToModel(dto: GetAccountDetailResponseDTODTO): AccountDetailModel {
  return {
    id: String(dto.id ?? ""),
    name: String(dto.name ?? "").trim(),
    currencyCode: String(dto.currencyCode ?? "USD").trim().toUpperCase() || "USD",
    availableBalance: Number.isFinite(Number(dto.availableBalance)) ? Number(dto.availableBalance) : 0,
    allocatedToGoalsBalance: Number.isFinite(Number(dto.allocatedToGoalsBalance)) ? Number(dto.allocatedToGoalsBalance) : 0,
    totalBalance: Number.isFinite(Number(dto.totalBalance)) ? Number(dto.totalBalance) : 0,
    monthlyIncome: Number.isFinite(Number(dto.monthlyIncome)) ? Number(dto.monthlyIncome) : 0,
    monthlyExpense: Number.isFinite(Number(dto.monthlyExpense)) ? Number(dto.monthlyExpense) : 0,
    transactions: Array.isArray(dto.transactions)
      ? dto.transactions.map(mapAccountDetailTransactionDtoToModel)
      : [],
  };
}

export function mapCreateAccountInputModelToRequestDto(model: CreateAccountInputModel): CreateAccountRequestDTO {
  return {
    name: model.name.trim(),
    currencyCode: model.currencyCode.trim().toUpperCase(),
    initialBalance: Number(model.initialBalance),
    exchangeRate: Number(model.exchangeRate),
    icon: String(model.icon ?? "WalletCards").trim() || "WalletCards",
  };
}

export function mapCreateAccountResponseDtoToModel(dto: CreateAccountResponseDTO): CreatedAccountModel {
  return {
    id: String(dto.id ?? ""),
    name: String(dto.name ?? "").trim(),
    balance: Number.isFinite(Number(dto.balance)) ? Number(dto.balance) : 0,
    currencyCode: resolveCurrencyCode(dto),
    icon: String(dto.icon ?? "WalletCards").trim() || "WalletCards",
  };
}
