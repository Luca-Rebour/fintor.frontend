import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { getTransactionsData } from "../../services/transactions.service";
import { Feather } from "@expo/vector-icons";

export default function TransactionsScreen() {
  const router = useRouter();
  const [transactionsData, setTransactionsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <View className="flex-1 bg-[#060F24]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-20 pt-2 px-4 "
      >
        <Text className="text-2xl font-bold text-app-textPrimary mb-4">
          Transactions
        </Text>
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
          transactionsData.map((txn) => (
            <View
              key={txn.id}
              className="bg-[#111C33] rounded-lg py-6 px-4 mb-3 flex-row items-center"
            >
              <View style={{ width: 26, alignItems: "center" }}>
                <Feather name={txn.icon} color="#18C8FF" size={16} />
              </View>

              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text
                  numberOfLines={1}
                  className="text-base font-semibold text-app-textPrimary"
                >
                  {txn.category}
                </Text>
              </View>

              <View style={{ width: 92 }}>
                <Text className="text-xs text-app-textSecondary">
                  {new Date(txn.date).toLocaleDateString()}
                </Text>
              </View>

              <View style={{ width: 90, alignItems: "flex-end" }}>
                <Text
                  className={`text-base font-semibold ${
                    txn.type === "expense" ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {txn.type === "expense" ? "-" : "+"}${txn.amount.toFixed(2)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
