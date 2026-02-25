import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

type DashboardHeaderProps = {
  userName: string;
};

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <View className="mb-6 flex-row items-center justify-between" >
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-200">
          <Text className="text-xs font-bold text-slate-700">AM</Text>
        </View>
        <View >
          <Text className="text-xs text-app-textSecondary">Welcome back</Text>
          <Text className="text-2xl font-bold text-app-textPrimary">{userName}</Text>
        </View>
      </View>

      <View className="h-10 w-10 items-center justify-center rounded-full bg-app-cardSoft">
        <Feather name="bell" size={18} color="#D1D5DB" />
      </View>
    </View>
  );
}
