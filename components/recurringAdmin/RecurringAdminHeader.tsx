import { Pressable, Text, View } from "react-native";
import { AppIcon } from "../shared/AppIcon";

type RecurringAdminHeaderProps = {
  title: string;
  onBackPress?: () => void;
  onCreatePress?: () => void;
};

export function RecurringAdminHeader({ title, onBackPress, onCreatePress }: RecurringAdminHeaderProps) {
  return (
    <View className="px-4 pb-3 pt-2">
      <View className="mb-3 flex-row items-center justify-between">
        <Pressable
          onPress={onBackPress}
          className="h-10 w-10 items-center justify-center rounded-full bg-[#111C33]"
        >
          <AppIcon name="ArrowLeft" size={18} color="#FFFFFF" />
        </Pressable>

        <Text className="text-xl font-bold text-app-textPrimary">{title}</Text>

        <Pressable
          onPress={onCreatePress}
          className="h-10 w-10 items-center justify-center rounded-full bg-[#18C8FF]"
        >
          <AppIcon name="Plus" size={18} color="#060F24" />
        </Pressable>
      </View>
    </View>
  );
}
