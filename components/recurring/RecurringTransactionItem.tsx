import { APP_COLORS } from "../../constants/colors";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AppIcon } from "../shared/AppIcon";
import { RecurringTransactionApiDTO } from "../../types/recurring";
import { TransactionType } from "../../types/enums/transactionType";

type RecurringTransactionItemProps = {
  recurringTransaction: RecurringTransactionApiDTO;
  onPress?: (recurringTransaction: RecurringTransactionApiDTO) => void;
};

function formatAmount(amount: number, currencyCode: string, transactionType: TransactionType) {
  const prefix = transactionType === TransactionType.Expense ? "-" : "+";
  const value = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode || "USD",
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);

  return `${prefix}${value}`;
}

function formatChargeDate(dateInput: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  }).format(new Date(dateInput));
}

export function RecurringTransactionItem({ recurringTransaction, onPress }: RecurringTransactionItemProps) {
  const { t } = useTranslation();
  const isExpense = Number(recurringTransaction.transactionType) === TransactionType.Expense;

  return (
    <Pressable
      onPress={() => onPress?.(recurringTransaction)}
      className="mb-3 flex-row items-center rounded-2xl bg-app-bgSecondary px-3 py-3"
    >
      <View className="mr-3 h-12 w-12 items-center justify-center rounded-full border border-app-border bg-app-surface">
        <AppIcon name={recurringTransaction.icon} color={isExpense ? APP_COLORS.actionSecondary : APP_COLORS.actionPrimary} size={18} />
      </View>

      <View className="flex-1">
        <Text className="text-base font-semibold text-app-textPrimary">{recurringTransaction.name}</Text>
        <Text className="mt-0.5 text-xs text-app-textSecondary">
          {t("recurring.labels.next", {
            date: formatChargeDate(recurringTransaction.nextChargeDate),
            account: recurringTransaction.accountName,
          })}
        </Text>
      </View>

      <View className="flex-row items-center">
        <View className="items-end mr-1">
          <Text className={`text-lg font-bold ${isExpense ? "text-app-danger" : "text-app-accentBlue"}`}>
            {formatAmount(recurringTransaction.amount, recurringTransaction.currencyCode, recurringTransaction.transactionType)}
          </Text>
          <Text className="text-[10px] font-semibold tracking-wide text-app-textSecondary">
            {recurringTransaction.currencyCode}
          </Text>
        </View>
        <AppIcon name="ChevronRight" color={APP_COLORS.border} size={16} />
      </View>
    </Pressable>
  );
}

