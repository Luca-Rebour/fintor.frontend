import { APP_COLORS } from "../../constants/colors";
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
      className="mb-20 mt-1 items-center rounded-3xl border border-dashed border-app-border bg-app-surface px-4 py-8"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-app-border">
        <AppIcon name="Plus" color={APP_COLORS.textSecondary} size={18} />
      </View>
      <Text className="mt-3 text-base font-semibold text-app-textSecondary">{t("recurring.addCard.title")}</Text>
    </Pressable>
  );
}

