import { AccountApiItem, AccountOption, AccountsResponse } from "../types/account";
import { apiGet } from "./api.client";

function normalizeAccount(item: AccountApiItem): AccountOption | null {
	const rawId = item.id ?? item.id;
	const rawLabel = item.name ?? item.name;

	if (rawId === undefined || rawId === null || !rawLabel) {
		return null;
	}

	return {
		value: String(rawId),
		label: String(rawLabel).trim(),
	};
}

export async function getAccountsData(): Promise<AccountOption[]> {
	try {
		const response = await apiGet<AccountsResponse>("/accounts");
		const items = Array.isArray(response)
			? response
			: "accounts" in response
				? response.accounts
				: response.data;

		return items
			.map(normalizeAccount)
			.filter((account): account is AccountOption => account !== null);
	} catch (error) {
		console.error("Error fetching accounts:", error);
		return [];
	}
}
