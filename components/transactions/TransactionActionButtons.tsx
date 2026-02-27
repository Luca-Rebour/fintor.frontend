import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { APP_COLORS } from "../../constants/colors";

type TransactionActionButtonsProps = {
  onAddExpense?: () => void;
  onAddIncome?: () => void;
};

export function TransactionActionButtons({
  onAddExpense,
  onAddIncome,
}: TransactionActionButtonsProps) {
  return (
    <View className="flex-row items-center mt-4 px-4 gap-3 mb-2">
      <Pressable
        onPress={onAddExpense}
        style={{ backgroundColor: APP_COLORS.actionPrimary }}
        className="flex-1 flex-row items-center justify-center px-4 py-3.5 rounded-xl border border-[#1E2A47]"
      >
        <Feather name="plus-circle" size={16} color="#FFFFFF" />
        <Text className="text-sm text-white font-semibold ml-2">Add Expense</Text>
      </Pressable>

      <Pressable
        onPress={onAddIncome}
        className="flex-1 flex-row items-center justify-center px-4 py-3.5 rounded-xl border border-[#1E2A47]"
      >
        <Feather name="dollar-sign" size={16} color={APP_COLORS.actionPrimary} />
        <Text className="text-sm text-app-primary font-semibold ml-2">Add Income</Text>
      </Pressable>
    </View>
  );
}
