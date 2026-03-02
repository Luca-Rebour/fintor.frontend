import { Pressable, Text, View } from "react-native";
import { RecurringPendingApprovalApiDTO } from "../../types/api/recurring";
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
        <Text className="text-xs font-semibold tracking-widest text-[#94A3B8]">PENDING TRANSACTIONS</Text>
        <View className="rounded-full bg-[#18C8FF]/20 px-2.5 py-1">
          <Text className="text-[10px] font-bold text-[#18C8FF]">{pendingTransactions.length}</Text>
        </View>
      </View>

      <View className="relative pb-5 pt-1">
        {hasThirdLayer ? (
          <View className="absolute left-5 right-5 top-5 h-24 rounded-2xl border border-[#1E2A47] bg-[#0F1B33] opacity-35" />
        ) : null}

        {hasSecondLayer ? (
          <View className="absolute left-4 right-4 top-4 h-24 rounded-2xl border border-[#1E2A47] bg-[#12203A] opacity-40" />
        ) : null}

        <View className="rounded-2xl border border-[#1E2A47] bg-[#12213D] px-4 py-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center pr-3">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#0F5132]">
                <AppIcon name={topPendingTransaction.icon || "WalletCards"} color="#22C55E" size={18} />
              </View>

              <View className="flex-1">
                <Text className="text-sm font-semibold text-white">
                  Pending {topPendingTransaction.transactionType === 0 ? "Income" : "Expense"}
                </Text>
                <Text className="text-xs text-[#94A3B8]" numberOfLines={1}>
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
                className="rounded-full bg-[#2563EB] px-5 py-2"
              >
                <Text className="text-sm font-semibold text-white">
                  {isSubmitting ? "..." : "Confirm"}
                </Text>
              </Pressable>

              <Text className="mt-2 text-[10px] font-semibold tracking-wide text-[#94A3B8]">
                {formatDate(topPendingTransaction.dueDate)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
