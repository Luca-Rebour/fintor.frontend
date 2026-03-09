import { APP_COLORS } from "../../constants/colors";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { resolveApiErrorMessage } from "../../i18n/resolve-api-error-message";

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
        Alert.alert(t("accounts.errors.genericTitle"), t("accounts.errors.invalidInitialBalance"));
        return;
      }

      const accountCurrencyCode = payload.currencyCode.trim().toUpperCase() || "USD";
      const userBaseCurrencyCode = getUserBaseCurrencyCode();

      let exchangeRate = 1;
      if (accountCurrencyCode !== userBaseCurrencyCode) {
        const resolvedRate = await getExchangeRateForCurrencies(accountCurrencyCode, userBaseCurrencyCode);

        if (resolvedRate === null) {
          Alert.alert(t("accounts.errors.genericTitle"), t("accounts.errors.exchangeRateUnavailable"));
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
      const message = resolveApiErrorMessage(createError, t, "accounts.errors.createAccountFailed");
      Alert.alert(t("accounts.errors.genericTitle"), message);
    }
  }

  useEffect(() => {
    loadAccounts();
    loadCurrencyOptions();
  }, []);

  return (
    <View className="flex-1 bg-app-bgPrimary px-4 pt-4">
      <AccountsHeader onAddPress={() => setIsCreateAccountModalVisible(true)} />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={APP_COLORS.actionPrimary} />
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
                activeAccountsLabel={t("accounts.activeAccounts")}
                accountsCountLabel={t("accounts.accountsCount", { count: decoratedAccounts.length })}
              />
            </>
          }
          ListEmptyComponent={
            <View className="mt-10 rounded-2xl border border-app-border bg-app-bgSecondary p-4">
              <Text className="text-center text-app-textSecondary">{t("accounts.empty")}</Text>
            </View>
          }
          ListFooterComponent={
            <ConnectBankAccountButton label={t("accounts.addAccountButton")} onPress={() => setIsCreateAccountModalVisible(true)} />
          }
          renderItem={({ item }) => (
            <AccountListCard
              iconName={item.iconName}
              accountName={item.label}
              subtitle={item.subtitle}
              totalBalanceLabel={t("accounts.totalBalanceLabel")}
              availableLabel={t("accounts.availableLabel")}
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

