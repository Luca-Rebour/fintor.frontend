import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { TransactionDTO } from "../../types/transaction";

type TransactionListItemProps = {
  transaction: TransactionDTO;
  isExpanded: boolean;
  onToggle: (id: string) => void;
};

function getNeonBackgroundColor(color?: string, alpha = 0.2) {
  const hex = (color ?? "").trim();

  if (/^#([0-9a-fA-F]{3})$/.test(hex)) {
    const [r, g, b] = hex
      .slice(1)
      .split("")
      .map((c) => parseInt(c + c, 16));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(hex)) {
    const raw = hex.slice(1, 7);
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const rgbMatch = hex.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return "rgba(24, 200, 255, 0.2)";
}

function TransactionExpandedDetails({
  transaction,
}: {
  transaction: TransactionDTO;
}) {
  const txnDate = new Date(transaction.date);

  return (
    <View className="px-4 pb-4 pt-2 border-t border-[#1E2A47]">
      <View className="rounded-xl border border-[#223250] bg-[#0C1830] p-3">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-[11px] uppercase tracking-wide text-app-textSecondary">
              Descripción
            </Text>
            <Text className="text-sm text-app-textPrimary mt-1 leading-5">
              {transaction.description?.trim() || "Sin descripción"}
            </Text>
          </View>
        </View>

        <View className="mt-3 pt-3 border-t border-[#1E2A47] flex-row">
          <View className="flex-1 pr-2">
            <Text className="text-[11px] uppercase tracking-wide text-app-textSecondary">
              Fecha
            </Text>
            <Text className="text-sm text-app-textPrimary mt-1">
              {txnDate.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Text>
          </View>

          <View className="flex-1 pl-2">
            <Text className="text-[11px] uppercase tracking-wide text-app-textSecondary">
              Hora
            </Text>
            <Text className="text-sm text-app-textPrimary mt-1">
              {txnDate.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function TransactionListItem({
  transaction,
  isExpanded,
  onToggle,
}: TransactionListItemProps) {
  const color = transaction.categoryColor || "#18C8FF";
  const categoryLabel = transaction.categoryName?.trim() || "Other";
  const accountLabel = transaction.accountName?.trim() || "Main account";

  return (
    <View className="mb-3 overflow-hidden">
      <Pressable
        onPress={() => onToggle(transaction.id)}
        className="py-5 px-4 flex-row items-center"
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: getNeonBackgroundColor(color),
            marginRight: 10,
          }}
        >
          <Feather
            name={transaction.icon as any}
            color={color}
            size={20}
          />
        </View>

        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text
            numberOfLines={1}
            className="text-base font-semibold text-app-textPrimary"
          >
            {categoryLabel}
          </Text>
          <Text className="text-xs text-app-textSecondary mt-1">
            {accountLabel} -{" "}
            {new Date(transaction.date).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </Text>
        </View>

        <View style={{ width: 90, alignItems: "flex-end" }}>
          <Text
            className={`text-base font-semibold ${
              transaction.transactionType == 1 ? "text-red-500" : "text-green-500"
            }`}
          >
            {transaction.transactionType == 1 ? "-" : "+"}$
            {transaction.amount.toFixed(2)}
          </Text>
        </View>
      </Pressable>

      {isExpanded && <TransactionExpandedDetails transaction={transaction} />}
    </View>
  );
}
