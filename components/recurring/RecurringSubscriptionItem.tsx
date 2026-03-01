import { Pressable, Text, View } from "react-native";
import { AppIcon } from "../shared/AppIcon";
import { RecurringSubscription } from "../../types/recurring";

type RecurringSubscriptionItemProps = {
  subscription: RecurringSubscription;
  onPress?: (subscription: RecurringSubscription) => void;
};

function formatAmount(amount: number, currencyCode: string, transactionType: RecurringSubscription["transactionType"]) {
  const prefix = transactionType === "expense" ? "-" : "+";
  const value = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(amount);

  return `${prefix}${value}`;
}

function formatChargeDate(dateInput: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  }).format(new Date(dateInput));
}

export function RecurringSubscriptionItem({ subscription, onPress }: RecurringSubscriptionItemProps) {
  const isExpense = subscription.transactionType === "expense";

  return (
    <Pressable
      onPress={() => onPress?.(subscription)}
      className="mb-3 flex-row items-center rounded-2xl bg-[#111C33] px-3 py-3"
    >
      <View className="mr-3 h-12 w-12 items-center justify-center rounded-full border border-[#1E2A47] bg-[#0F172A]">
        <AppIcon name={subscription.icon} color={isExpense ? "#B63BFF" : "#18C8FF"} size={18} />
      </View>

      <View className="flex-1">
        <Text className="text-base font-semibold text-app-textPrimary">{subscription.name}</Text>
        <Text className="mt-0.5 text-xs text-[#94A3B8]">
          {`Next: ${formatChargeDate(subscription.nextChargeDate)} · ${subscription.accountName}`}
        </Text>
      </View>

      <View className="flex-row items-center">
        <Text className={`text-lg font-bold ${isExpense ? "text-[#F43F5E]" : "text-[#18C8FF]"}`}>
          {formatAmount(subscription.amount, subscription.currencyCode, subscription.transactionType)}
        </Text>
        <AppIcon name="ChevronRight" color="#334155" size={16} />
      </View>
    </Pressable>
  );
}
