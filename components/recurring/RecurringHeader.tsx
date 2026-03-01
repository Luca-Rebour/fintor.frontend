import { Pressable, Text, View } from "react-native";
import { AppIcon } from "../shared/AppIcon";

type RecurringHeaderProps = {
  title: string;
  onBackPress?: () => void;
  onSearchPress?: () => void;
};

export function RecurringHeader({ title, onBackPress, onSearchPress }: RecurringHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-4 pb-3 pt-2">
      <Pressable
        onPress={onBackPress}
        className="h-10 w-10 items-center justify-center rounded-full bg-[#111C33]"
      >
        <AppIcon name="ArrowLeft" size={18} color="#FFFFFF" />
      </Pressable>

      <Text className="text-xl font-bold text-app-textPrimary">{title}</Text>

      <Pressable
        onPress={onSearchPress}
        className="h-10 w-10 items-center justify-center rounded-full bg-[#111C33]"
      >
        <AppIcon name="Search" size={18} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
