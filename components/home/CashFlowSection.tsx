import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AppIcon } from "../shared/AppIcon";

import { CashFlowMetric } from "../../types/dashboard";

type CashFlowSectionProps = {
  metrics: CashFlowMetric[];
};

export function CashFlowSection({ metrics }: CashFlowSectionProps) {
  const { t } = useTranslation();
  return (
    <View className="mb-6">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-app-textPrimary">{t("home.cashFlow.title")}</Text>
        <Text className="text-sm text-app-primary">{t("home.cashFlow.viewReport")}</Text>
      </View>

      <View className="flex-row gap-3">
        {metrics.map((metric) => (
          <View key={metric.id} className="flex-1 rounded-2xl bg-app-cardSoft p-4">
            <View
              className={`mb-3 h-7 w-7 items-center justify-center rounded-full ${
                metric.trend === "up" ? "bg-emerald-500/20" : "bg-red-500/20"
              }`}
            >
              <AppIcon
                name={metric.trend === "up" ? "ArrowDown" : "ArrowUp"}
                size={12}
                color={metric.trend === "up" ? "#10B981" : "#EF4444"}
              />
            </View>
            <Text className="text-xs text-app-textSecondary">{metric.label}</Text>
            <Text className="mt-1 text-3xl font-bold text-app-textPrimary">{metric.amount}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
