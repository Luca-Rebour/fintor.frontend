import {
	AccountApiItem,
	AccountOption,
	AccountSummary,
	AccountsResponse,
	CreateAccountDTO,
	CreateAccountResponse,
} from "../types/account";
import { apiGet, apiPost } from "./api.client";

function normalizeAccount(item: AccountApiItem): AccountOption | null {
	const rawId = item.id ?? item.id;
	const rawLabel = item.name ?? item.name;
	const rawCurrencyCode = item.currency?.code;

	if (rawId === undefined || rawId === null || !rawLabel) {
		return null;
	}

	return {
		value: String(rawId),
		label: String(rawLabel).trim(),
		currencyCode: String(rawCurrencyCode || "USD").trim().toUpperCase(),
	};
}

function normalizeAccountSummary(item: AccountApiItem): AccountSummary | null {
	const rawId = item.id ?? item.id;
	const rawLabel = item.name ?? item.name;
	const rawCurrencyCode = item.currency?.code;
	const rawCurrencySymbol = item.currency?.symbol;
	const rawBalance = Number(item.balance);

	if (rawId === undefined || rawId === null || !rawLabel) {
		return null;
	}

	return {
		value: String(rawId),
		label: String(rawLabel).trim(),
		currencyCode: String(rawCurrencyCode || "USD").trim().toUpperCase(),
		currencySymbol: String(rawCurrencySymbol || "$"),
		balance: Number.isFinite(rawBalance) ? rawBalance : 0,
	};
}

function unwrapAccountsResponse(response: AccountsResponse): AccountApiItem[] {
	return Array.isArray(response)
		? response
		: "accounts" in response
			? response.accounts
			: response.data;
}

export async function getAccountsData(): Promise<AccountOption[]> {
	try {
		const response = await apiGet<AccountsResponse>("/accounts");
		const items = unwrapAccountsResponse(response);

		return items
			.map(normalizeAccount)
			.filter((account): account is AccountOption => account !== null);
	} catch (error) {
		console.error("Error fetching accounts:", error);
		return [];
	}
}

export async function getAccountsSummaryData(): Promise<AccountSummary[]> {
	try {
		const response = await apiGet<AccountsResponse>("/accounts");
		const items = unwrapAccountsResponse(response);

		return items
			.map(normalizeAccountSummary)
			.filter((account): account is AccountSummary => account !== null);
	} catch (error) {
		console.error("Error fetching account summaries:", error);
		return [];
	}
}

export async function createAccount(payload: CreateAccountDTO): Promise<CreateAccountResponse> {
	return apiPost<CreateAccountResponse>("/accounts", payload);
}
