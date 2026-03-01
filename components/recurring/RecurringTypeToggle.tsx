import { Pressable, Text, View } from "react-native";
import { RecurringTransactionType } from "../../types/recurring";

type RecurringTypeToggleProps = {
  value: RecurringTransactionType;
  onChange: (transactionType: RecurringTransactionType) => void;
};

type ToggleOption = {
  value: RecurringTransactionType;
  label: string;
};

const OPTIONS: ToggleOption[] = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expenses" },
];

export function RecurringTypeToggle({ value, onChange }: RecurringTypeToggleProps) {
  return (
    <View className="mb-4 mt-1 flex-row rounded-full bg-[#111C33] p-1">
      {OPTIONS.map((option) => {
        const isActive = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`flex-1 rounded-full px-4 py-2.5 ${isActive ? "bg-[#1D4ED8]" : "bg-transparent"}`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                isActive ? "text-white" : "text-[#94A3B8]"
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
