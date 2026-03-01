import { Pressable, Text, View } from "react-native";
import { AppIcon } from "../shared/AppIcon";
import { RecurringPendingApprovalApiDTO } from "../../types/api/recurring";
import { PendingTransactionStatus } from "../../types/enums/pendingTransactionStatus";

type PendingApprovalCardProps = {
  approval: RecurringPendingApprovalApiDTO;
  onConfirm?: (approval: RecurringPendingApprovalApiDTO) => void;
  onReschedule?: (approval: RecurringPendingApprovalApiDTO) => void;
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

export function PendingApprovalCard({ approval, onConfirm, onReschedule }: PendingApprovalCardProps) {
  const requiresAction = approval.status === PendingTransactionStatus.Pending;

  return (
    <View className="mb-6 rounded-3xl border border-[#1E2A47] bg-[#111C33] p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xs font-semibold tracking-widest text-[#94A3B8]">PENDING APPROVAL</Text>
        {requiresAction ? (
          <View className="rounded-full bg-[#18C8FF]/20 px-2.5 py-1">
            <Text className="text-[10px] font-bold text-[#18C8FF]">1 ACTION REQUIRED</Text>
          </View>
        ) : null}
      </View>

      <View className="mb-4 flex-row items-center rounded-2xl bg-[#1A243B] px-3 py-3">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#111C33]">
          <AppIcon name={approval.icon || "WalletCards"} color="#18C8FF" size={18} />
        </View>

        <View className="flex-1">
          <Text className="text-xs text-[#94A3B8]">{approval.description}</Text>
          <Text className="mt-0.5 text-3xl font-bold text-white">{formatCurrency(approval.amount, approval.currencyCode)}</Text>
        </View>

        <View className="items-end">
          <Text className="text-[10px] font-semibold tracking-wide text-[#94A3B8]">EXPECTED</Text>
          <Text className="mt-0.5 text-base font-bold text-[#18C8FF]">{formatDate(approval.dueDate)}</Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        <Pressable
          onPress={() => onConfirm?.(approval)}
          className="flex-1 rounded-2xl bg-[#1D4ED8] px-4 py-3"
        >
          <Text className="text-center text-sm font-semibold text-white">Confirm</Text>
        </Pressable>

        <Pressable
          onPress={() => onReschedule?.(approval)}
          className="flex-1 rounded-2xl border border-[#334155] bg-[#1A243B] px-4 py-3"
        >
          <Text className="text-center text-sm font-semibold text-[#94A3B8]">Reschedule</Text>
        </Pressable>
      </View>
    </View>
  );
}
