import { Pressable, Text, View } from "react-native";
import { AppIcon } from "../shared/AppIcon";

type ConnectBankAccountButtonProps = {
  label: string;
  onPress?: () => void;
};

export function ConnectBankAccountButton({ label, onPress }: ConnectBankAccountButtonProps) {
  return (
    <Pressable onPress={onPress} className="mt-2 rounded-2xl border border-dashed border-[#1E2A47] bg-[#0A162F] px-4 py-4">
      <View className="flex-row items-center justify-center gap-2">
        <AppIcon name="CirclePlus" size={18} color="#5A7BB3" />
        <Text className="text-sm font-semibold text-[#5A7BB3]">{label}</Text>
      </View>
    </Pressable>
  );
}
