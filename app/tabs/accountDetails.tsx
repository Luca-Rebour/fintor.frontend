import { APP_COLORS } from "../../constants/colors";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { resolveApiErrorMessage } from "../../i18n/resolve-api-error-message";

import { AppIcon } from "../../components/shared/AppIcon";
import { TransactionListItem } from "../../components/transactions/TransactionListItem";
import { getAccountDetailData } from "../../services/account.service";
import { deleteTransactionById, getTransactionsData } from "../../services/transactions.service";
import { AccountDetailModel as AccountDetail } from "../../types/models/account.model";
import { TransactionModel as TransactionDTO } from "../../types/models/transaction.model";

function resolveParamValue(input: string | string[] | undefined): string {
  if (Array.isArray(input)) {
    return input[0]?.trim() ?? "";
  }

  return input?.trim() ?? "";
}

function formatCurrency(amount: number, currencyCode: string) {
  const normalizedCurrency = currencyCode?.trim().toUpperCase() || "USD";

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: normalizedCurrency,
      currencyDisplay: "code",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${normalizedCurrency} ${amount.toFixed(2)}`;
  }
}

function isCurrentMonth(date: string) {
  const now = new Date();
  const parsed = new Date(date);

  return parsed.getMonth() === now.getMonth() && parsed.getFullYear() === now.getFullYear();
}

function getMonthDeltaPercent(monthlyIncome: number, monthlySpending: number) {
  if (monthlySpending <= 0) {
    return monthlyIncome > 0 ? 100 : 0;
  }

  return ((monthlyIncome - monthlySpending) / monthlySpending) * 100;
}

function MetricCard({
  label,
  value,
  icon,
  iconColor,
  iconBackground,
  className,
}: {
  label: string;
  value: string;
  icon: string;
  iconColor: string;
  iconBackground: string;
  className?: string;
}) {
  return (
    <View className={`rounded-3xl border border-app-border bg-app-surface p-4 ${className ?? ""}`}>
      <View
        className="mb-4 h-10 w-10 items-center justify-center rounded-2xl"
        style={{ backgroundColor: iconBackground }}
      >
        <AppIcon name={icon} size={18} color={iconColor} />
      </View>
      <Text className="text-xs font-medium text-app-textSecondary">{label}</Text>
      <Text
        className="mt-1 text-3xl font-semibold text-app-textPrimary"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.55}
      >
        {value}
      </Text>
    </View>
  );
}

export default function AccountDetailsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{
    accountId?: string | string[];
    accountName?: string | string[];
    currencyCode?: string | string[];
    balance?: string | string[];
  }>();

  const accountName = resolveParamValue(params.accountName);
  const accountId = resolveParamValue(params.accountId);
  const currencyCode = resolveParamValue(params.currencyCode) || "USD";
  const availableBalance = Number(resolveParamValue(params.balance)) || 0;

  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [accountDetail, setAccountDetail] = useState<AccountDetail | null>(null);
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);
  const [isItemSwipeActive, setIsItemSwipeActive] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadData() {
        setIsLoading(true);

        if (!accountId) {
          if (isActive) {
            setTransactions([]);
            setAccountDetail(null);
            setIsLoading(false);
          }
          return;
        }

        const detail = await getAccountDetailData(accountId);

        if (!detail) {
          const transactionsData = await getTransactionsData();
          if (!isActive) {
            return;
          }

          const normalizedAccountName = accountName.trim().toLowerCase();
          const accountTransactions = transactionsData
            .filter((item) => item.accountName?.trim().toLowerCase() === normalizedAccountName)
            .sort((a, b) => +new Date(b.date) - +new Date(a.date));

          setAccountDetail(null);
          setTransactions(accountTransactions);
          setIsLoading(false);
          return;
        }

        if (!isActive) {
          return;
        }

        setAccountDetail(detail);
        setTransactions((detail.transactions ?? []).slice().sort((a, b) => +new Date(b.date) - +new Date(a.date)));
        setIsLoading(false);
      }

      loadData();

      return () => {
        isActive = false;
      };
    }, [accountId, accountName]),
  );

  const monthlySpending = useMemo(() => {
    if (accountDetail) {
      return Math.abs(Number(accountDetail.monthlyExpense) || 0);
    }

    return transactions.reduce((total, item) => {
      if (item.transactionType !== 1 || !isCurrentMonth(item.date)) {
        return total;
      }

      return total + Math.abs(item.amount);
    }, 0);
  }, [accountDetail, transactions]);

  const monthlyIncome = useMemo(() => {
    if (accountDetail) {
      return Math.abs(Number(accountDetail.monthlyIncome) || 0);
    }

    return transactions.reduce((total, item) => {
      if (item.transactionType !== 0 || !isCurrentMonth(item.date)) {
        return total;
      }

      return total + Math.abs(item.amount);
    }, 0);
  }, [accountDetail, transactions]);

  const allocatedToGoals = useMemo(() => {
    if (accountDetail) {
      return Math.abs(Number(accountDetail.allocatedToGoalsBalance) || 0);
    }

    return 0;
  }, [accountDetail]);

  const resolvedAccountName = accountDetail?.name?.trim() || accountName;
  const resolvedCurrencyCode = accountDetail?.currencyCode?.trim().toUpperCase() || currencyCode;
  const resolvedAvailableBalance = Number.isFinite(Number(accountDetail?.availableBalance))
    ? Number(accountDetail?.availableBalance)
    : availableBalance;

  const monthDeltaPercent = useMemo(
    () => getMonthDeltaPercent(monthlyIncome, monthlySpending),
    [monthlyIncome, monthlySpending],
  );

  const monthDeltaLabel = `${monthDeltaPercent >= 0 ? "+" : ""}${monthDeltaPercent.toFixed(1)}% ${t("accounts.thisMonth")}`;

  function handleToggleTransaction(id: string) {
    setExpandedTransactionId((current) => (current === id ? null : id));
  }

  function handleRequestDeleteTransaction(transactionId: string) {
    Alert.alert(
      t("transactions.delete.title"),
      t("transactions.delete.message"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("transactions.delete.confirm"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransactionById(transactionId);
              setTransactions((previous) => previous.filter((transaction) => transaction.id !== transactionId));
              setAccountDetail((previous) =>
                previous
                  ? {
                      ...previous,
                      transactions: previous.transactions.filter((transaction) => transaction.id !== transactionId),
                    }
                  : previous,
              );
            } catch (deleteError) {
              const message = resolveApiErrorMessage(deleteError, t, "transactions.errors.deleteTransactionFailed");
              Alert.alert(t("transactions.errors.genericTitle"), message);
            }
          },
        },
      ],
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bgPrimary">
        <ActivityIndicator size="large" color={APP_COLORS.actionPrimary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-bgPrimary px-4 pt-2">
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-app-surface"
        >
          <AppIcon name="ArrowLeft" size={18} color={APP_COLORS.textPrimary} />
        </Pressable>

        <Text className="text-xl font-bold text-app-textPrimary">{resolvedAccountName || t("accounts.detailsTitle")}</Text>

        <View className="h-10 w-10 items-center justify-center rounded-full bg-app-surface">
          <AppIcon name="Ellipsis" size={18} color={APP_COLORS.textPrimary} />
        </View>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isItemSwipeActive}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListHeaderComponent={
          <>
            <View className="mb-7 items-center rounded-3xl border border-app-border bg-app-surface px-5 py-7">
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-app-primary">
                {t("accounts.availableBalance")}
              </Text>
              <Text className="mt-3 text-5xl font-bold text-app-primary">
                {formatCurrency(resolvedAvailableBalance, resolvedCurrencyCode)}
              </Text>
            </View>

            <View className="mb-6 flex-row gap-3">
              <MetricCard
                label={t("accounts.monthlySpending")}
                value={formatCurrency(monthlySpending, resolvedCurrencyCode)}
                icon="ArrowUpRight"
                iconColor="#A855F7"
                iconBackground="#2E1A4D"
                className="flex-1"
              />
              <MetricCard
                label={t("accounts.monthlyIncome")}
                value={formatCurrency(monthlyIncome, resolvedCurrencyCode)}
                icon="ArrowDownLeft"
                iconColor={APP_COLORS.success}
                iconBackground="#0D3B2A"
                className="flex-1"
              />
            </View>

            <View className="mb-8">
              <MetricCard
                label={t("accounts.allocatedToGoals")}
                value={formatCurrency(allocatedToGoals, resolvedCurrencyCode)}
                icon="Target"
                iconColor={APP_COLORS.actionPrimary}
                iconBackground="#083A4B"
              />
            </View>

            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-3xl font-bold text-app-textPrimary">{t("accounts.recentActivity")}</Text>
              <Text className="text-base font-semibold text-app-primary">{t("common.viewAll")}</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View className="rounded-2xl border border-app-border bg-app-bgSecondary p-4">
            <Text className="text-center text-app-textSecondary">{t("accounts.noTransactions")}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="px-2">
            <TransactionListItem
              transaction={item}
              isExpanded={expandedTransactionId === item.id}
              onToggle={handleToggleTransaction}
              onSwipeLeft={handleRequestDeleteTransaction}
              onDeleteRequest={handleRequestDeleteTransaction}
              onSwipeGestureChange={setIsItemSwipeActive}
            />
          </View>
        )}
      />
    </View>
  );
}

