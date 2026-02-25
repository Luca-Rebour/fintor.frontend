import { ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";

type AuthPrimaryButtonProps = {
  label: string;
  colors: readonly [string, string];
  iconRight?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
};

export function AuthPrimaryButton({ label, colors, iconRight, onPress, disabled }: AuthPrimaryButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled} className="overflow-hidden rounded-full disabled:opacity-70">
      <LinearGradient colors={colors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}>
        <View className="h-14 flex-row items-center justify-center">
          <Text className="text-lg font-bold text-app-textPrimary">{label}</Text>
          {iconRight ? <View className="ml-2">{iconRight}</View> : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}
