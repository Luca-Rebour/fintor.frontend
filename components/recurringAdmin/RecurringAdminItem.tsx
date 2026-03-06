import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { RecurringTransactionApiDTO } from "../../types/recurring";
import { Frequency } from "../../types/enums/frequency";
import { TransactionType } from "../../types/enums/transactionType";
import { AppIcon } from "../shared/AppIcon";

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
  const isIncome = Number(transaction.transactionType) === TransactionType.Income;

  function formatDueDate(value: string): string {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return "--";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
    }).format(parsed);
  }

  function getIconPalette(iconName: string | null): { wrapper: string; icon: string } {
    const palettes = [
      { wrapper: "border-[#7F1D1D] bg-[#3A1A2A]", icon: "#EF4444" },
      { wrapper: "border-[#14532D] bg-[#0F2A27]", icon: "#22C55E" },
      { wrapper: "border-[#1E3A8A] bg-[#142A57]", icon: "#3B82F6" },
      { wrapper: "border-[#581C87] bg-[#2B1744]", icon: "#A855F7" },
    ];

    const key = String(iconName || "walletcards");
    const hash = key.split("").reduce((accumulator, current) => accumulator + current.charCodeAt(0), 0);
    return palettes[hash % palettes.length];
  }

  const palette = getIconPalette(transaction.icon);
  const accountLabel = transaction.accountName || t("recurringAdmin.item.mainAccount");
  const subtitle = `${formatDueDate(transaction.nextChargeDate)} • ${accountLabel}`;
  const frequencyLabel = frequencyLabelByValue[Number(transaction.frequency)] ?? t("recurringAdmin.item.customFrequency");

  return (
    <Pressable
      onLongPress={() => onDelete(transaction)}
      delayLongPress={280}
      className="mb-3 flex-row items-center rounded-2xl border border-[#1E2A47] bg-[#111C33] px-3 py-3"
    >
      <View className={`mr-3 h-11 w-11 items-center justify-center rounded-xl border ${palette.wrapper}`}>
        <AppIcon name={transaction.icon || "WalletCards"} size={18} color={palette.icon} />
      </View>

      <View className="flex-1">
        <Text className="text-base font-semibold text-app-textPrimary">{transaction.name}</Text>
        <Text className="mt-0.5 text-xs text-[#94A3B8]">{subtitle}</Text>
        <Text className="mt-0.5 text-[10px] font-semibold tracking-wide text-[#64748B]">{frequencyLabel}</Text>
      </View>

      <View className="ml-2 items-end">
        <Text className={`text-xl font-bold ${isIncome ? "text-[#18C8FF]" : "text-[#F43F5E]"}`}>
          {formatAmount(transaction.amount, transaction.currencyCode || "USD", transaction.transactionType)}
        </Text>
        <Pressable onPress={() => onEdit(transaction)} className="mt-1 h-6 w-6 items-center justify-center rounded-full bg-[#1A243B]">
          <AppIcon name="Pencil" size={12} color="#64748B" />
        </Pressable>
      </View>
    </Pressable>
  );
}
