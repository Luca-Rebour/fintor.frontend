import { Feather } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native";

import {
	CurrencyOption,
	getCurrencyOptionsSnapshot,
	subscribeToCurrencyOptions,
} from "../../services/currencies.service";
import { CreateAccountDTO } from "../../types/account";
import { getTransactionsData } from "../../services/transactions.service";

type CreateAccountModalProps = {
	visible: boolean;
	onClose: () => void;
	onCreateAccount: (payload: CreateAccountDTO) => Promise<void> | void;
};

function getCurrencyLabel(options: CurrencyOption[], selectedCode: string) {
	const selected = options.find((option) => option.code === selectedCode);
	return selected ? `${selected.code} - ${selected.name}` : selectedCode;
}

export function CreateAccountModal({
	visible,
	onClose,
	onCreateAccount,
}: CreateAccountModalProps) {
	const [accountName, setAccountName] = useState("");
	const [initialBalance, setInitialBalance] = useState("");
	const [currencyCode, setCurrencyCode] = useState("USD");
	const [currencyOptions, setCurrencyOptions] = useState<CurrencyOption[]>(getCurrencyOptionsSnapshot());
	const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
	const [currencySearchText, setCurrencySearchText] = useState("");
	const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(currencyOptions.length === 0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [nameError, setNameError] = useState("");
	const [balanceError, setBalanceError] = useState("");

	const parsedBalance = useMemo(() => Number(initialBalance.replace(",", ".")), [initialBalance]);

	const filteredCurrencyOptions = useMemo(() => {
		const normalizedQuery = currencySearchText.trim().toLowerCase();

		if (!normalizedQuery) {
			return currencyOptions;
		}

		return currencyOptions.filter((option) => {
			const normalizedCode = option.code.toLowerCase();
			const normalizedName = option.name.toLowerCase();
			return normalizedCode.includes(normalizedQuery) || normalizedName.includes(normalizedQuery);
		});
	}, [currencyOptions, currencySearchText]);

	useEffect(() => {
		const unsubscribe = subscribeToCurrencyOptions((options) => {
			setCurrencyOptions(options);
			setIsLoadingCurrencies(options.length === 0);
		});

		return unsubscribe;
	}, []);

	useEffect(() => {
		if (currencyOptions.length > 0 && !currencyOptions.some((option) => option.code === currencyCode)) {
			setCurrencyCode(currencyOptions[0]?.code ?? "USD");
		}
	}, [currencyOptions, currencyCode]);

	function resetForm() {
		setAccountName("");
		setInitialBalance("");
		setCurrencyCode("USD");
		setCurrencySearchText("");
		setIsCurrencyOpen(false);
		setNameError("");
		setBalanceError("");
	}

	function handleClose() {
		if (isSubmitting) {
			return;
		}

		resetForm();
		onClose();
	}

	async function handleCreate() {
		const normalizedName = accountName.trim();

		if (!normalizedName) {
			setNameError("Ingresa un nombre de cuenta");
			return;
		}

		if (!Number.isFinite(parsedBalance) || parsedBalance < 0) {
			setBalanceError("Ingresa un saldo inicial válido");
			return;
		}

		setIsSubmitting(true);

		try {
			await onCreateAccount({
				name: normalizedName,
				initialBalance: parsedBalance,
				currencyCode,
			});

			resetForm();
			onClose();
		} finally {
            getTransactionsData();
			setIsSubmitting(false);
		}
	}

	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
			<KeyboardAvoidingView
				className="flex-1"
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={20}
			>
				<View className="flex-1 justify-end bg-black/60">
					<Pressable className="flex-1" onPress={handleClose} />

					<View className="rounded-t-3xl border-t border-[#1E2A47] bg-[#111C33] px-5 pt-3 pb-6">
						<View className="mb-5 items-center">
							<View className="h-1.5 w-12 rounded-full bg-[#334155]" />
						</View>

						<View>
							<Text className="text-3xl font-bold text-app-textPrimary">Add New Account</Text>
							<Text className="mt-1 text-sm text-app-textSecondary">
								Connect a new funding source to your wallet
							</Text>

					<View className="mt-6">
						<Text className="mb-2 text-xs uppercase text-app-primary">Account Name</Text>
						<View className="flex-row items-center rounded-2xl border border-[#1E2A47] bg-[#0C1830] px-3 py-3">
							<Feather name="home" size={17} color="#94A3B8" />
							<TextInput
								value={accountName}
								onChangeText={(value) => {
									setAccountName(value);
									if (nameError) setNameError("");
								}}
								placeholder="e.g. Chase Savings"
								placeholderTextColor="#64748B"
								className="ml-3 flex-1 text-base text-app-textPrimary"
							/>
						</View>
						{nameError ? <Text className="mt-2 text-xs text-red-400">{nameError}</Text> : null}
					</View>

					<View className="mt-4">
						<Text className="mb-2 text-xs uppercase text-app-primary">Initial Balance</Text>
						<View className="flex-row items-center rounded-2xl border border-[#1E2A47] bg-[#0C1830] px-3 py-3">
							<Feather name="dollar-sign" size={17} color="#18C8FF" />
							<TextInput
								value={initialBalance}
								onChangeText={(value) => {
									setInitialBalance(value);
									if (balanceError) setBalanceError("");
								}}
								keyboardType="decimal-pad"
								placeholder="0.00"
								placeholderTextColor="#64748B"
								className="ml-3 flex-1 text-base text-app-textPrimary"
							/>
						</View>
						{balanceError ? <Text className="mt-2 text-xs text-red-400">{balanceError}</Text> : null}
					</View>

					<View className="mt-4 z-50" style={{ elevation: 30 }}>
						<Text className="mb-2 text-xs uppercase text-app-primary">Currency</Text>
						<View className="relative z-50" style={{ elevation: 30 }}>
							<Pressable
								onPress={() => setIsCurrencyOpen((previous) => !previous)}
								className="bg-[#0C1830] border border-[#1E2A47] rounded-2xl px-3 py-3 flex-row items-center justify-between"
							>
								<Text className="text-sm text-app-textPrimary">{getCurrencyLabel(currencyOptions, currencyCode)}</Text>
								<Feather name={isCurrencyOpen ? "chevron-up" : "chevron-down"} size={16} color="#94A3B8" />
							</Pressable>

							{isCurrencyOpen ? (
								<View
									className="absolute left-0 right-0 bottom-full mb-2 bg-[#0C1830] border border-[#1E2A47] rounded-2xl overflow-hidden z-50"
									style={{ elevation: 30, maxHeight: 300 }}
								>
									<View className="px-3 py-3 border-b border-[#1E2A47]">
										<View className="flex-row items-center rounded-xl border border-[#1E2A47] bg-[#111C33] px-3 py-2">
											<Feather name="search" size={15} color="#94A3B8" />
											<TextInput
												value={currencySearchText}
												onChangeText={setCurrencySearchText}
												placeholder="Buscar por código o nombre"
												placeholderTextColor="#64748B"
												className="ml-2 flex-1 text-sm text-app-textPrimary"
												autoCapitalize="none"
											/>
										</View>
									</View>

									{isLoadingCurrencies ? (
										<View className="py-6 items-center justify-center">
											<ActivityIndicator color="#18C8FF" />
										</View>
									) : (
										<FlatList
											data={filteredCurrencyOptions}
											keyExtractor={(item) => item.code}
											keyboardShouldPersistTaps="handled"
											initialNumToRender={16}
											maxToRenderPerBatch={20}
											windowSize={6}
											ListEmptyComponent={
												<View className="px-3 py-5">
													<Text className="text-center text-sm text-app-textSecondary">No se encontraron monedas</Text>
												</View>
											}
											renderItem={({ item }) => {
												const isSelected = item.code === currencyCode;
												return (
													<Pressable
														onPress={() => {
															setCurrencyCode(item.code);
															setIsCurrencyOpen(false);
															setCurrencySearchText("");
														}}
														className="px-3 py-3 flex-row items-center justify-between border-b border-[#1E2A47]"
													>
														<View>
															<Text className={`text-sm ${isSelected ? "text-app-primary font-semibold" : "text-app-textPrimary"}`}>
																{item.code}
															</Text>
															<Text className="mt-0.5 text-xs text-app-textSecondary">{item.name}</Text>
														</View>
														{isSelected ? <Feather name="check" size={14} color="#18C8FF" /> : null}
													</Pressable>
												);
											}}
										/>
									)}
								</View>
							) : null}
						</View>
					</View>

							<Pressable
								onPress={handleCreate}
								disabled={isSubmitting}
								className="mt-7 flex-row items-center justify-center rounded-2xl bg-[#18C8FF] py-4"
							>
								{isSubmitting ? (
									<ActivityIndicator color="#061324" />
								) : (
									<>
										<Text className="text-base font-bold text-[#061324]">Create Account</Text>
										<Feather name="arrow-right" size={18} color="#061324" style={{ marginLeft: 8 }} />
									</>
								)}
							</Pressable>
						</View>
					</View>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
}
