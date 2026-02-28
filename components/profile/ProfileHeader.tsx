import { Pressable, Text, View } from "react-native";
import { AppIcon } from "../shared/AppIcon";

type ProfileHeaderProps = {
  fullName: string;
  membershipLabel: string;
  onBackPress?: () => void;
};

export function ProfileHeader({ fullName, membershipLabel, onBackPress }: ProfileHeaderProps) {
  return (
    <View>
      <View className="mb-6 flex-row items-center justify-between">
        <Pressable onPress={onBackPress} className="h-10 w-10 items-center justify-center rounded-full bg-app-cardSoft">
          <AppIcon name="ArrowLeft" size={18} color="#FFFFFF" />
        </Pressable>
        <Text className="text-3xl font-bold text-app-textPrimary">Profile</Text>
        <View className="w-10" />
      </View>

      <View className="mb-8 items-center">
        <View className="h-28 w-28 items-center justify-center rounded-full border-4 border-app-primary bg-slate-300">
          <Text className="text-4xl font-bold text-slate-700">AR</Text>
          <View className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-app-primary" />
        </View>

        <Text className="mt-4 text-4xl font-bold text-app-textPrimary">{fullName}</Text>
        <Text className="mt-2 rounded-full bg-app-primary/20 px-3 py-1 text-sm font-semibold text-app-primary">
          {membershipLabel}
        </Text>
      </View>
    </View>
  );
}
