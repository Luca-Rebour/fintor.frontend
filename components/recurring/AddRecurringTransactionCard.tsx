import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AppIcon } from "../shared/AppIcon";

type AddRecurringTransactionCardProps = {
  onPress?: () => void;
};

export function AddRecurringTransactionCard({ onPress }: AddRecurringTransactionCardProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      className="mb-20 mt-1 items-center rounded-3xl border border-dashed border-[#334155] bg-[#111C33] px-4 py-8"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-[#1A243B]">
        <AppIcon name="Plus" color="#94A3B8" size={18} />
      </View>
      <Text className="mt-3 text-base font-semibold text-[#94A3B8]">{t("recurring.addCard.title")}</Text>
    </Pressable>
  );
}
