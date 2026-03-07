import { APP_COLORS } from "../../constants/colors";
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
      { wrapper: "border-app-danger/40 bg-app-danger/20", icon: APP_COLORS.danger },
      { wrapper: "border-app-success/40 bg-app-success/20", icon: APP_COLORS.success },
      { wrapper: "border-app-accentBlue/40 bg-app-accentBlue/20", icon: APP_COLORS.actionPrimary },
      { wrapper: "border-app-accentPurple/40 bg-app-accentPurple/20", icon: APP_COLORS.actionSecondary },
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
      className="mb-3 flex-row items-center rounded-2xl border border-app-border bg-app-surface px-3 py-3"
    >
      <View className={`mr-3 h-11 w-11 items-center justify-center rounded-xl border ${palette.wrapper}`}>
        <AppIcon name={transaction.icon || "WalletCards"} size={18} color={palette.icon} />
      </View>

      <View className="flex-1">
        <Text className="text-base font-semibold text-app-textPrimary">{transaction.name}</Text>
        <Text className="mt-0.5 text-xs text-app-textSecondary">{subtitle}</Text>
        <Text className="mt-0.5 text-[10px] font-semibold tracking-wide text-app-textMuted">{frequencyLabel}</Text>
      </View>

      <View className="ml-2 items-end">
        <Text className={`text-xl font-bold ${isIncome ? "text-app-accentBlue" : "text-app-danger"}`}>
          {formatAmount(transaction.amount, transaction.currencyCode || "USD", transaction.transactionType)}
        </Text>
        <Pressable onPress={() => onEdit(transaction)} className="mt-1 h-6 w-6 items-center justify-center rounded-full bg-app-border">
          <AppIcon name="Pencil" size={12} color={APP_COLORS.textMuted} />
        </Pressable>
      </View>
    </Pressable>
  );
}

