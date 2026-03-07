import { APP_COLORS } from "../../constants/colors";
import { Pressable, Text, View } from "react-native";
import { RecurringPendingApprovalApiDTO } from "../../types/recurring";
import { AppIcon } from "../shared/AppIcon";

type PendingIncomeCardProps = {
  pendingTransactions: RecurringPendingApprovalApiDTO[];
  onConfirm: (pendingTransaction: RecurringPendingApprovalApiDTO) => void;
  isSubmitting?: boolean;
};

function formatCurrency(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(input: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(input));
}

export function PendingIncomeCard({ pendingTransactions, onConfirm, isSubmitting = false }: PendingIncomeCardProps) {
  if (!pendingTransactions.length) {
    return null;
  }

  const topPendingTransaction = pendingTransactions[0];
  const hasSecondLayer = pendingTransactions.length > 1;
  const hasThirdLayer = pendingTransactions.length > 2;

  return (
    <View className="mb-6">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xs font-semibold tracking-widest text-app-textSecondary">PENDING TRANSACTIONS</Text>
        <View className="rounded-full bg-app-accentBlue/20 px-2.5 py-1">
          <Text className="text-[10px] font-bold text-app-accentBlue">{pendingTransactions.length}</Text>
        </View>
      </View>

      <View className="relative pb-5 pt-1">
        {hasThirdLayer ? (
          <View className="absolute left-5 right-5 top-5 h-24 rounded-2xl border border-app-border bg-app-bgSecondary opacity-35" />
        ) : null}

        {hasSecondLayer ? (
          <View className="absolute left-4 right-4 top-4 h-24 rounded-2xl border border-app-border bg-app-surface opacity-40" />
        ) : null}

        <View className="rounded-2xl border border-app-border bg-app-surface px-4 py-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center pr-3">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-app-success/20">
                <AppIcon name={topPendingTransaction.icon || "WalletCards"} color={APP_COLORS.success} size={18} />
              </View>

              <View className="flex-1">
                <Text className="text-sm font-semibold text-white">
                  Pending {topPendingTransaction.transactionType === 0 ? "Income" : "Expense"}
                </Text>
                <Text className="text-xs text-app-textSecondary" numberOfLines={1}>
                  {topPendingTransaction.description}
                </Text>
                <Text className="mt-1 text-3xl font-bold text-white">
                  {formatCurrency(topPendingTransaction.amount, topPendingTransaction.currencyCode)}
                </Text>
              </View>
            </View>

            <View className="items-end">
              <Pressable
                disabled={isSubmitting}
                onPress={() => onConfirm(topPendingTransaction)}
                className="rounded-full bg-app-accentBlue px-5 py-2"
              >
                <Text className="text-sm font-semibold text-white">
                  {isSubmitting ? "..." : "Confirm"}
                </Text>
              </Pressable>

              <Text className="mt-2 text-[10px] font-semibold tracking-wide text-app-textSecondary">
                {formatDate(topPendingTransaction.dueDate)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

