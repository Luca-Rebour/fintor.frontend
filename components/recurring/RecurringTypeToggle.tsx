import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { TransactionType } from "../../types/enums/transactionType";

type RecurringTypeToggleProps = {
  value: TransactionType;
  onChange: (transactionType: TransactionType) => void;
};

type ToggleOption = {
  value: TransactionType;
  labelKey: "recurring.type.income" | "recurring.type.expense";
};

const OPTIONS: ToggleOption[] = [
  { value: TransactionType.Income, labelKey: "recurring.type.income" },
  { value: TransactionType.Expense, labelKey: "recurring.type.expense" },
];

export function RecurringTypeToggle({ value, onChange }: RecurringTypeToggleProps) {
  const { t } = useTranslation();
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
              {t(option.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
