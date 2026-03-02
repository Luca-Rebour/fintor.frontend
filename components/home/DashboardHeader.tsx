import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { AppIcon } from "../shared/AppIcon";

type DashboardHeaderProps = {
  userName: string;
};

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const { t } = useTranslation();
  return (
    <View className="mb-6 flex-row items-center justify-between" >
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-200">
          <Text className="text-xs font-bold text-slate-700">AM</Text>
        </View>
        <View >
          <Text className="text-xs text-app-textSecondary">{t("home.header.welcomeBack")}</Text>
          <Text className="text-2xl font-bold text-app-textPrimary">{userName}</Text>
        </View>
      </View>

      <View className="h-10 w-10 items-center justify-center rounded-full bg-app-cardSoft">
        <AppIcon name="Bell" size={18} color="#D1D5DB" />
      </View>
    </View>
  );
}
