import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { AccountListCard } from "../../components/accounts/AccountListCard";
import { AccountsHeader } from "../../components/accounts/AccountsHeader";
import { AccountsSectionHeader } from "../../components/accounts/AccountsSectionHeader";
import { ConnectBankAccountButton } from "../../components/accounts/ConnectBankAccountButton";
import { CreateAccountModal } from "../../components/transactions/CreateAccountModal";
import { createAccount, getAccountsSummaryData } from "../../services/account.service";
import { getAuthUserSnapshot } from "../../services/auth.service";
import { getExchangeRateForCurrencies, loadCurrencyOptions } from "../../services/currencies.service";
import { AccountSummaryModel as AccountSummary, CreateAccountInputModel as CreateAccountDTO } from "../../types/models/account.model";


function formatCurrency(amount: number, currencyCode: string) {
  const normalizedCurrency = currencyCode?.trim().toUpperCase() || "USD";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizedCurrency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export default function AccountsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateAccountModalVisible, setIsCreateAccountModalVisible] = useState(false);
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);

  const decoratedAccounts = useMemo(
    () =>
      accounts.map((account, index) => ({
        ...account,
        iconName: account.icon,
        subtitle: account.currencyCode,
        totalBalance: account.totalBalance,
        availableBalance: account.availableBalance,
      })),
    [accounts],
  );

  async function loadAccounts(showInitialLoader = true) {
    try {
      if (showInitialLoader) {
        setIsLoading(true);
      }

      const data = await getAccountsSummaryData();
      setAccounts(data);
    } finally {
      if (showInitialLoader) {
        setIsLoading(false);
      }
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadAccounts(false);
    setIsRefreshing(false);
  }

  function getUserBaseCurrencyCode() {
    const user = getAuthUserSnapshot();
    const rawCode =
      (user as unknown as { baseCurrencyCode?: string; BaseCurrencyCode?: string })?.baseCurrencyCode ??
      (user as unknown as { baseCurrencyCode?: string; BaseCurrencyCode?: string })?.BaseCurrencyCode;

    if (typeof rawCode === "string" && rawCode.trim()) {
      return rawCode.trim().toUpperCase();
    }

    return "USD";
  }

  async function handleCreateAccount(payload: Omit<CreateAccountDTO, "exchangeRate">) {
    try {
      const normalizedInitialBalance = Number(payload.initialBalance);

      if (!Number.isFinite(normalizedInitialBalance)) {
        Alert.alert("Error", "El saldo inicial no es válido.");
        return;
      }

      const accountCurrencyCode = payload.currencyCode.trim().toUpperCase() || "USD";
      const userBaseCurrencyCode = getUserBaseCurrencyCode();

      let exchangeRate = 1;
      if (accountCurrencyCode !== userBaseCurrencyCode) {
        const resolvedRate = await getExchangeRateForCurrencies(accountCurrencyCode, userBaseCurrencyCode);

        if (resolvedRate === null) {
          Alert.alert("Error", "No se pudo obtener el tipo de cambio para crear la cuenta.");
          return;
        }

        exchangeRate = resolvedRate;
      }

      await createAccount({
        ...payload,
        initialBalance: normalizedInitialBalance,
        currencyCode: accountCurrencyCode,
        exchangeRate,
      });

      setIsCreateAccountModalVisible(false);
      await loadAccounts(false);
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : "No se pudo crear la cuenta";
      Alert.alert("Error", message);
    }
  }

  useEffect(() => {
    loadAccounts();
    loadCurrencyOptions();
  }, []);

  return (
    <View className="flex-1 bg-[#060F24] px-4 pt-4">
      <AccountsHeader onAddPress={() => setIsCreateAccountModalVisible(true)} />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#18C8FF" />
        </View>
      ) : (
        <FlatList
          data={decoratedAccounts}
          keyExtractor={(item) => item.value}
          showsVerticalScrollIndicator={false}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListHeaderComponent={
            <>
              <AccountsSectionHeader
                activeAccountsLabel="ACTIVE ACCOUNTS"
                accountsCountLabel={`${decoratedAccounts.length} ACCOUNTS`}
              />
            </>
          }
          ListEmptyComponent={
            <View className="mt-10 rounded-2xl border border-[#1E2A47] bg-[#111C33] p-4">
              <Text className="text-center text-app-textSecondary">{t("accounts.empty")}</Text>
            </View>
          }
          ListFooterComponent={
            <ConnectBankAccountButton label="Add Account" onPress={() => setIsCreateAccountModalVisible(true)} />
          }
          renderItem={({ item }) => (
            <AccountListCard
              iconName={item.iconName}
              accountName={item.label}
              subtitle={item.subtitle}
              totalBalanceLabel="TOTAL BALANCE"
              availableLabel="AVAILABLE"
              totalBalance={formatCurrency(item.totalBalance, item.currencyCode)}
              availableBalance={formatCurrency(item.availableBalance, item.currencyCode)}
              onPress={() =>
                router.push({
                  pathname: "/tabs/accountDetails",
                  params: {
                    accountId: item.value,
                    accountName: item.label,
                    currencyCode: item.currencyCode,
                    balance: String(item.totalBalance),
                  },
                })
              }
            />
          )}
        />
      )}

      <CreateAccountModal
        visible={isCreateAccountModalVisible}
        onClose={() => setIsCreateAccountModalVisible(false)}
        onCreateAccount={handleCreateAccount}
      />
    </View>
  );
}
