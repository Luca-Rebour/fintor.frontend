import { APP_COLORS } from "../../constants/colors";
import { Pressable, Text, View } from "react-native";
import { AppIcon } from "../shared/AppIcon";

type RecurringAdminHeaderProps = {
  title: string;
  onBackPress?: () => void;
  onActionPress?: () => void;
};

export function RecurringAdminHeader({ title, onBackPress, onActionPress }: RecurringAdminHeaderProps) {
  return (
    <View className="px-4 pb-2 pt-2">
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={onBackPress}
          className="h-10 w-10 items-center justify-center rounded-full"
        >
          <AppIcon name="ArrowLeft" size={18} color={APP_COLORS.textPrimary} />
        </Pressable>

        <Text className="text-xl font-bold text-app-textPrimary">{title}</Text>

        <Pressable
          onPress={onActionPress}
          className="h-10 w-10 items-center justify-center rounded-full"
        >
          <AppIcon name="EllipsisVertical" size={18} color={APP_COLORS.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

