import { APP_COLORS } from "../../constants/colors";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AppIcon } from "../shared/AppIcon";

type TransactionSummaryCardsProps = {
  monthlySpending: number;
  monthlyIncome: number;
  balance: number;
  currencyCode: string;
};

export function TransactionSummaryCards({
  monthlySpending,
  monthlyIncome,
  balance,
  currencyCode,
}: TransactionSummaryCardsProps) {
  const { t } = useTranslation();
  const normalizedCurrencyCode = currencyCode?.trim().toUpperCase() || "USD";

  return (
    <View className="px-4 mt-4 gap-3">
      <View className="flex-row gap-3">
        <View className="flex-1 bg-app-surface rounded-xl p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-app-textSecondary text-xs uppercase">
              {t("transactions.summary.monthlySpending")}
            </Text>
            <AppIcon name="ArrowDown" size={16} color={APP_COLORS.danger} />
          </View>

          <Text className="text-app-textPrimary text-xl font-semibold">
            {normalizedCurrencyCode} {monthlySpending.toFixed(2)}
          </Text>
        </View>

        <View className="flex-1 bg-app-surface rounded-xl p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-app-textSecondary text-xs uppercase">
              {t("transactions.summary.monthlyIncome")}
            </Text>
            <AppIcon name="ArrowUp" size={16} color={APP_COLORS.success} />
          </View>

          <Text className="text-app-textPrimary text-xl font-semibold">
            {normalizedCurrencyCode} {monthlyIncome.toFixed(2)}
          </Text>
        </View>
      </View>

      <View className="bg-app-surface rounded-xl p-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-app-textSecondary text-xs uppercase">
            {t("transactions.summary.balance")}
          </Text>
          <AppIcon
            name={balance >= 0 ? "TrendingUp" : "TrendingDown"}
            size={16}
            color={balance >= 0 ? APP_COLORS.success : APP_COLORS.danger}
          />
        </View>

        <Text className={`text-xl font-semibold ${balance >= 0 ? "text-green-500" : "text-red-500"}`}>
          {normalizedCurrencyCode} {balance.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

