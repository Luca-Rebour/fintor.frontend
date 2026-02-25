import { Pressable, Text } from "react-native";

type AuthSocialButtonProps = {
  label: string;
};

export function AuthSocialButton({ label }: AuthSocialButtonProps) {
  return (
    <Pressable className="h-12 flex-1 items-center justify-center rounded-2xl border border-app-border bg-app-cardSoft">
      <Text className="font-semibold text-app-textPrimary">{label}</Text>
    </Pressable>
  );
}
