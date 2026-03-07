import { APP_COLORS } from "../../constants/colors";
import { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	KeyboardAvoidingView,
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
import { CreateAccountInputModel as CreateAccountDTO } from "../../types/models/account.model";
import { getTransactionsData } from "../../services/transactions.service";
import { AppIcon } from "../shared/AppIcon";
import { IconColorPicker } from "../shared/IconColorPicker";
import { AppBottomSheetModal } from "../shared/AppBottomSheetModal";

type CreateAccountModalProps = {
	visible: boolean;
	onClose: () => void;
	onCreateAccount: (payload: Omit<CreateAccountDTO, "exchangeRate">) => Promise<void> | void;
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
	const [selectedIcon, setSelectedIcon] = useState("WalletCards");
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
		setSelectedIcon("WalletCards");
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
				icon: selectedIcon,
			});

			resetForm();
			onClose();
		} finally {
            getTransactionsData();
			setIsSubmitting(false);
		}
	}

	return (
		<AppBottomSheetModal visible={visible} onClose={handleClose} snapPoints={["92%"]} debugName="CreateAccountModal">
			<KeyboardAvoidingView
				className="flex-1"
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={20}
			>
					<View className="h-full max-h-[92%] rounded-t-3xl border-t border-app-border bg-app-bgSecondary px-5 pt-3 pb-6">
						<Text className="text-3xl font-bold text-app-textPrimary">Add New Account</Text>
						<Text className="mt-1 text-sm text-app-textSecondary">
							Connect a new funding source to your wallet
						</Text>

						<FlatList
							className="mt-4"
							data={[]}
							renderItem={() => null}
							showsVerticalScrollIndicator={false}
							keyboardShouldPersistTaps="handled"
							keyboardDismissMode="on-drag"
							ListHeaderComponent={
								<>
							<View className="mt-2">
								<Text className="mb-2 text-xs uppercase text-app-primary">Account Name</Text>
								<View className="flex-row items-center rounded-2xl border border-app-border bg-app-surface px-3 py-3">
									<AppIcon name="House" size={17} color={APP_COLORS.textSecondary} />
									<TextInput
										value={accountName}
										onChangeText={(value) => {
											setAccountName(value);
											if (nameError) setNameError("");
										}}
										placeholder="e.g. Chase Savings"
										placeholderTextColor={APP_COLORS.textMuted}
										className="ml-3 flex-1 text-base text-app-textPrimary"
									/>
								</View>
								{nameError ? <Text className="mt-2 text-xs text-red-400">{nameError}</Text> : null}
							</View>

							<View className="mt-4">
								<Text className="mb-2 text-xs uppercase text-app-primary">Initial Balance</Text>
								<View className="flex-row items-center rounded-2xl border border-app-border bg-app-surface px-3 py-3">
									<AppIcon name="DollarSign" size={17} color={APP_COLORS.actionPrimary} />
									<TextInput
										value={initialBalance}
										onChangeText={(value) => {
											setInitialBalance(value);
											if (balanceError) setBalanceError("");
										}}
										keyboardType="decimal-pad"
										placeholder="0.00"
										placeholderTextColor={APP_COLORS.textMuted}
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
										className="bg-app-surface border border-app-border rounded-2xl px-3 py-3 flex-row items-center justify-between"
									>
										<Text className="text-sm text-app-textPrimary">{getCurrencyLabel(currencyOptions, currencyCode)}</Text>
										<AppIcon name={isCurrencyOpen ? "ChevronUp" : "ChevronDown"} size={16} color={APP_COLORS.textSecondary} />
									</Pressable>

									{isCurrencyOpen ? (
										<View
											className="mt-2 bg-app-surface border border-app-border rounded-2xl overflow-hidden"
											style={{ maxHeight: 300 }}
										>
											<View className="px-3 py-3 border-b border-app-border">
												<View className="flex-row items-center rounded-xl border border-app-border bg-app-bgSecondary px-3 py-2">
													<AppIcon name="Search" size={15} color={APP_COLORS.textSecondary} />
													<TextInput
														value={currencySearchText}
														onChangeText={setCurrencySearchText}
														placeholder="Buscar por código o nombre"
														placeholderTextColor={APP_COLORS.textMuted}
														className="ml-2 flex-1 text-sm text-app-textPrimary"
														autoCapitalize="none"
													/>
												</View>
											</View>

											{isLoadingCurrencies ? (
												<View className="py-6 items-center justify-center">
													<ActivityIndicator color={APP_COLORS.actionPrimary} />
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
																className="px-3 py-3 flex-row items-center justify-between border-b border-app-border"
															>
																<View>
																	<Text className={`text-sm ${isSelected ? "text-app-primary font-semibold" : "text-app-textPrimary"}`}>
																		{item.code}
																	</Text>
																	<Text className="mt-0.5 text-xs text-app-textSecondary">{item.name}</Text>
																</View>
																{isSelected ? <AppIcon name="Check" size={14} color={APP_COLORS.actionPrimary} /> : null}
															</Pressable>
														);
													}}
												/>
											)}
										</View>
									) : null}
								</View>
							</View>

							<IconColorPicker
								selectedIcon={selectedIcon}
								selectedColor={APP_COLORS.actionPrimary}
								onChangeIcon={setSelectedIcon}
								onChangeColor={() => {}}
								selectedIconLabel="Selected account icon"
								searchPlaceholder="Search account icon"
								iconSectionLabel="Account icons"
								showColorSection={false}
							/>

							<Pressable
								onPress={handleCreate}
								disabled={isSubmitting}
								className="mt-7 mb-2 flex-row items-center justify-center rounded-2xl bg-app-accentBlue py-4"
							>
								{isSubmitting ? (
									<ActivityIndicator color="#061324" />
								) : (
									<>
										<Text className="text-base font-bold text-[#061324]">Create Account</Text>
										<AppIcon name="ArrowRight" size={18} color="#061324" style={{ marginLeft: 8 }} />
									</>
								)}
							</Pressable>
								</>
							}
						/>
					</View>
			</KeyboardAvoidingView>
		</AppBottomSheetModal>
	);
}

