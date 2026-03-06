import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { AppIcon } from "../../components/shared/AppIcon";
import { getAccountsSummaryData } from "../../services/account.service";
import { AccountSummary } from "../../types/account";

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

export default function AccountsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadAccounts() {
      setIsLoading(true);
      const data = await getAccountsSummaryData();
      if (!isMounted) {
        return;
      }

      setAccounts(data);
      setIsLoading(false);
    }

    loadAccounts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View className="flex-1 bg-[#060F24] px-4 pt-2">
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-[#111C33]"
        >
          <AppIcon name="ArrowLeft" size={18} color="#FFFFFF" />
        </Pressable>

        <Text className="text-xl font-bold text-app-textPrimary">{t("accounts.title")}</Text>

        <View className="h-10 w-10" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#18C8FF" />
        </View>
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.value}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <View className="mt-10 rounded-2xl border border-[#1E2A47] bg-[#111C33] p-4">
              <Text className="text-center text-app-textSecondary">{t("accounts.empty")}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              className="mb-3 rounded-2xl border border-[#1E2A47] bg-[#111C33] p-4"
              onPress={() =>
                router.push({
                  pathname: "/tabs/accountDetails",
                  params: {
                    accountId: item.value,
                    accountName: item.label,
                    currencyCode: item.currencyCode,
                    balance: String(item.balance),
                  },
                })
              }
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-base font-semibold text-app-textPrimary">{item.label}</Text>
                  <Text className="mt-1 text-xs text-app-textSecondary">{item.currencyCode}</Text>
                </View>

                <View className="items-end">
                  <Text className="text-sm font-semibold text-app-primary">
                    {formatCurrency(item.balance, item.currencyCode)}
                  </Text>
                  <AppIcon name="ChevronRight" size={16} color="#94A3B8" />
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
