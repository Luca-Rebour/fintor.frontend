import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { getTransactionsData } from "../../services/transactions.service";
import { TransactionDTO } from "../../types/transaction";
import { APP_COLORS, APP_GRADIENTS } from "../../constants/colors";
import { LinearGradient } from "expo-linear-gradient";

type TransactionGroup = {
  dateKey: string;
  title: string;
  items: TransactionDTO[];
};

function getLocalDateKey(input: string) {
  const d = new Date(input);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function TransactionsScreen() {
  const [transactionsData, setTransactionsData] = useState<TransactionDTO[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedTransactionId, setExpandedTransactionId] = useState<
    string | null
  >(null);

  async function loadTransactions() {
    try {
      setIsLoading(true);
      setError("");
      const data = await getTransactionsData();
      setTransactionsData(data);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Failed to load transactions";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  const groupedTransactions = useMemo<TransactionGroup[]>(() => {
    const map = new Map<string, TransactionDTO[]>();

    for (const txn of transactionsData) {
      const key = getLocalDateKey(txn.date);
      const current = map.get(key) ?? [];
      current.push(txn);
      map.set(key, current);
    }

    return [...map.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1)) // fecha descendente
      .map(([dateKey, items]) => ({
        dateKey,
        title: new Date(`${dateKey}T00:00:00`).toLocaleDateString("es-ES", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        items: items.sort((a, b) => +new Date(b.date) - +new Date(a.date)),
      }));
  }, [transactionsData]);

  const toggleExpanded = (id: string) => {
    setExpandedTransactionId((prev) => (prev === id ? null : id));
  };

  return (
    <View className="flex-1 bg-[#060F24]">
      <View className="px-4 py-3 border-b border-[#1E2A47]">
        <Text className="text-lg font-semibold text-app-textPrimary">
          Transactions
        </Text>
      </View>

      <View className="flex-row px-4 mt-4 gap-3">
        <View className="flex-1 bg-[#111C33] rounded-xl p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-app-textSecondary text-xs uppercase">
              Monthly Spending
            </Text>
            <Feather name="arrow-down" size={16} color="#EF4444" />
          </View>

          <Text className="text-app-textPrimary text-xl font-semibold">
            $1,250.00
          </Text>
        </View>

        <View className="flex-1 bg-[#111C33] rounded-xl p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-app-textSecondary text-xs uppercase">
              Monthly Income
            </Text>
            <Feather name="arrow-up" size={16} color="#22C55E" />
          </View>

          <Text className="text-app-textPrimary text-xl font-semibold">
            $3,400.00
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mt-4 px-4 gap-3">
        <Pressable
          style={{ backgroundColor: APP_COLORS.actionPrimary }}
          className="flex-1 flex-row items-center justify-center px-4 py-3.5 rounded-xl border border-[#1E2A47]"
        >
          <Feather name="plus-circle" size={16} color="#FFFFFF" />
          <Text className="text-sm text-white font-semibold ml-2">
            Add Expense
          </Text>
        </Pressable>

        <Pressable className="flex-1 flex-row items-center justify-center px-4 py-3.5 rounded-xl border border-[#1E2A47]">
          <Feather
            name="dollar-sign"
            size={16}
            color={APP_COLORS.actionPrimary}
          />
          <Text className="text-sm text-app-primary font-semibold ml-2">
            Add Income
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-20 pt-2 px-4"
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#18C8FF" />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-base text-app-textPrimary">
              {error}
            </Text>
          </View>
        ) : (
          groupedTransactions.map((group) => (
            <View key={group.dateKey} className="mb-3">
              <Text className="text-app-textSecondary text-xs uppercase mb-2 px-1">
                {group.title}
              </Text>

              {group.items.map((txn) => {
                const isExpanded = expandedTransactionId === txn.id;
                const txnDate = new Date(txn.date);

                return (
                  <View
                    key={txn.id}
                    className="bg-[#111C33] rounded-lg mb-3 overflow-hidden"
                  >
                    <Pressable
                      onPress={() => toggleExpanded(txn.id)}
                      className="py-5 px-4 flex-row items-center"
                    >
                      <View style={{ width: 26, alignItems: "center" }}>
                        <Feather
                          name={txn.icon as any}
                          color="#18C8FF"
                          size={16}
                        />
                      </View>

                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text
                          numberOfLines={1}
                          className="text-base font-semibold text-app-textPrimary"
                        >
                          {txn.category}
                        </Text>
                      </View>

                      <View style={{ width: 90, alignItems: "flex-end" }}>
                        <Text
                          className={`text-base font-semibold ${
                            txn.type === "expense"
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {txn.type === "expense" ? "-" : "+"}$
                          {txn.amount.toFixed(2)}
                        </Text>
                      </View>
                    </Pressable>

                    {isExpanded && (
                      <View className="px-4 pb-4 pt-1 border-t border-[#1E2A47]">
                        <Text className="text-app-textSecondary text-sm">
                          Fecha:{" "}
                          {txnDate.toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </Text>
                        <Text className="text-app-textSecondary text-sm mt-1">
                          Hora:{" "}
                          {txnDate.toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
