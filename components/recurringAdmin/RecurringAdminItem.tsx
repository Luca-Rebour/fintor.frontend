import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { RecurringTransactionApiDTO } from "../../types/api/recurring";
import { Frequency } from "../../types/enums/frequency";
import { TransactionType } from "../../types/enums/transactionType";

type RecurringAdminItemProps = {
  transaction: RecurringTransactionApiDTO;
  onEdit: (transaction: RecurringTransactionApiDTO) => void;
  onDelete: (transaction: RecurringTransactionApiDTO) => void;
};

function formatAmount(amount: number, currencyCode: string, transactionType: TransactionType): string {
  const prefix = transactionType === TransactionType.Income ? "+" : "-";
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode || "USD",
    minimumFractionDigits: 2,
  }).format(Math.abs(Number(amount) || 0));

  return `${prefix}${formatted}`;
}

export function RecurringAdminItem({ transaction, onEdit, onDelete }: RecurringAdminItemProps) {
  const { t } = useTranslation();
  const frequencyLabelByValue: Record<number, string> = {
    [Frequency.Daily]: t("recurringAdmin.item.frequency.daily"),
    [Frequency.Weekly]: t("recurringAdmin.item.frequency.weekly"),
    [Frequency.BiWeekly]: t("recurringAdmin.item.frequency.biWeekly"),
    [Frequency.Monthly]: t("recurringAdmin.item.frequency.monthly"),
    [Frequency.Quarterly]: t("recurringAdmin.item.frequency.quarterly"),
    [Frequency.Yearly]: t("recurringAdmin.item.frequency.yearly"),
  };
  const frequencyLabel = frequencyLabelByValue[Number(transaction.frequency)] ?? t("recurringAdmin.item.customFrequency");
  const isIncome = Number(transaction.transactionType) === TransactionType.Income;

  return (
    <View className="mb-3 rounded-2xl border border-[#1E2A47] bg-[#111C33] p-4">
      <View className="flex-row items-start justify-between">
        <View className="mr-3 flex-1">
          <Text className="text-base font-semibold text-app-textPrimary">{transaction.name}</Text>
          <Text className="mt-1 text-sm text-[#94A3B8]">{transaction.description}</Text>
          <Text className="mt-2 text-xs font-medium text-[#64748B]">
            {`${frequencyLabel} · ${transaction.accountName || t("recurringAdmin.item.mainAccount")}`}
          </Text>
        </View>

        <Text className={`text-lg font-bold ${isIncome ? "text-[#18C8FF]" : "text-[#F43F5E]"}`}>
          {formatAmount(transaction.amount, transaction.currencyCode || "USD", transaction.transactionType)}
        </Text>
      </View>

      <View className="mt-4 flex-row gap-3">
        <Pressable
          onPress={() => onEdit(transaction)}
          className="flex-1 rounded-xl bg-[#1A243B] px-3 py-2.5"
        >
          <Text className="text-center text-sm font-semibold text-[#18C8FF]">{t("recurringAdmin.item.edit")}</Text>
        </Pressable>

        <Pressable
          onPress={() => onDelete(transaction)}
          className="flex-1 rounded-xl bg-[#3A1F2C] px-3 py-2.5"
        >
          <Text className="text-center text-sm font-semibold text-[#F43F5E]">{t("recurringAdmin.item.delete")}</Text>
        </Pressable>
      </View>
    </View>
  );
}
