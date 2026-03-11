import {
  AccountDetailModel as AccountDetail,
  AccountOptionModel as AccountOption,
  AccountSummaryModel as AccountSummary,
  CreateAccountInputModel as CreateAccountDTO,
  CreatedAccountModel as CreateAccountResponse,
} from "../types/models/account.model";
import {
  CreateAccountResponseDTO,
  GetAccountDetailResponseDTODTO,
  GetAccountsResponseDTO,
} from "../types/api/account";
import {
  mapAccountDetailDtoToModel,
  mapAccountsDtoToOptionModels,
  mapAccountsDtoToSummaryModels,
  mapCreateAccountInputModelToRequestDto,
  mapCreateAccountResponseDtoToModel,
} from "../mappers/account.mapper";
import { apiGet, apiPost } from "./api.client";

export async function getAccountsData(): Promise<AccountOption[]> {
  try {
    const dtoItems = await apiGet<GetAccountsResponseDTO>("/accounts");
    return mapAccountsDtoToOptionModels(dtoItems);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return [];
  }
}

export async function getAccountsSummaryData(): Promise<AccountSummary[]> {
  try {
    const dtoItems = await apiGet<GetAccountsResponseDTO>("/accounts");    
    console.log(dtoItems);
    return mapAccountsDtoToSummaryModels(dtoItems);
  } catch (error) {
    console.error("Error fetching account summaries:", error);
    return [];
  }
}

export async function getAccountDetailData(accountId: string): Promise<AccountDetail | null> {
  const normalizedAccountId = accountId.trim();

  if (!normalizedAccountId) {
    return null;
  }

  try {
    const response = await apiGet<GetAccountDetailResponseDTODTO>(`/accounts/${encodeURIComponent(normalizedAccountId)}/detail`);
    console.log(response);
    
    return mapAccountDetailDtoToModel(response);
    
    
  } catch (error) {
    console.error("Error fetching account detail:", error);
    return null;
  }
}

export async function createAccount(payload: CreateAccountDTO): Promise<CreateAccountResponse> {
  const requestDto = mapCreateAccountInputModelToRequestDto(payload);  
  const response = await apiPost<CreateAccountResponseDTO>("/accounts", requestDto);
  return mapCreateAccountResponseDtoToModel(response);
}
