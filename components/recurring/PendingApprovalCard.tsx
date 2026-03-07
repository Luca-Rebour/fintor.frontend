import { APP_COLORS } from "../../constants/colors";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AppIcon } from "../shared/AppIcon";
import { RecurringPendingApprovalApiDTO } from "../../types/recurring";
import { PendingTransactionStatus } from "../../types/enums/pendingTransactionStatus";

type PendingApprovalCardProps = {
  approval: RecurringPendingApprovalApiDTO;
  onConfirm?: (approval: RecurringPendingApprovalApiDTO) => void;
  onReschedule?: (approval: RecurringPendingApprovalApiDTO) => void;
  onCancel?: (approval: RecurringPendingApprovalApiDTO) => void;
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

export function PendingApprovalCard({ approval, onConfirm, onReschedule, onCancel }: PendingApprovalCardProps) {
  const { t } = useTranslation();
  const isRescheduled =
    approval.status === PendingTransactionStatus.Rescheduled ||
    String(approval.status).toLowerCase() === "rescheduled";

  return (
    <View className="mb-6 rounded-3xl border border-app-border bg-app-surface p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-xs font-semibold tracking-widest text-app-textSecondary">{t("recurring.labels.pendingApproval")}</Text>
          
        </View>

        <Pressable
          onPress={() => onCancel?.(approval)}
          className="h-8 w-8 items-center justify-center rounded-full bg-app-border"
        >
          <AppIcon name="Trash2" color="#F87171" size={16} />
        </Pressable>
      </View>

      <View className="mb-4 flex-row items-center rounded-2xl bg-app-bgSecondary px-3 py-3">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-app-surface">
          <AppIcon name={approval.icon || "WalletCards"} color={APP_COLORS.actionPrimary} size={18} />
        </View>

        <View className="flex-1">
          <Text className="text-xs text-app-textSecondary">{approval.description}</Text>
          <Text className="mt-0.5 text-3xl font-bold text-white">{formatCurrency(approval.amount, approval.currencyCode)}</Text>
          <Text className="mt-1 text-xs font-semibold tracking-wide text-app-textSecondary">
            {approval.currencyCode}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-[10px] font-semibold tracking-wide text-app-textSecondary">{t("recurring.labels.expected")}</Text>
          <Text className="mt-0.5 text-base font-bold text-app-accentBlue">{formatDate(approval.dueDate)}</Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        {!isRescheduled ? (
          <Pressable
            onPress={() => onConfirm?.(approval)}
            className="flex-1 rounded-2xl bg-app-accentBlue px-4 py-3"
          >
            <Text className="text-center text-sm font-semibold text-white">{t("recurring.actions.confirm")}</Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => onReschedule?.(approval)}
          className={`${isRescheduled ? "w-full" : "flex-1"} rounded-2xl border border-app-border bg-app-border px-4 py-3`}
        >
          <Text className="text-center text-sm font-semibold text-app-textSecondary">{t("recurring.actions.reschedule")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

