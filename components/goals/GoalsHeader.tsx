import { Pressable, Text, View } from "react-native";

type GoalsHeaderProps = {
  title: string;
};

export function GoalsHeader({ title }: GoalsHeaderProps) {
  return (
    <View className="px-4 py-3 border-b border-[#1E2A47] flex-row items-center justify-between">

      <Text className="text-base font-semibold text-app-textPrimary">{title}</Text>

    </View>
  );
}
