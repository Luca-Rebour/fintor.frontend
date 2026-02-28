import { Text, TextInput, TextInputProps, Pressable, View } from "react-native";
import { AppIcon } from "../shared/AppIcon";

type IconName = string;

type AuthInputProps = {
  label: string;
  placeholder: string;
  icon: IconName;
  value?: string;
  onChangeText?: (value: string) => void;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  secureTextEntry?: boolean;
  isPasswordVisible?: boolean;
  onTogglePasswordVisibility?: () => void;
};

export function AuthInput({
  label,
  placeholder,
  icon,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
  isPasswordVisible,
  onTogglePasswordVisibility,
}: AuthInputProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-app-textPrimary">{label}</Text>
      <View className="h-14 flex-row items-center rounded-2xl border border-app-border bg-app-cardSoft px-4">
        <AppIcon name={icon} size={18} color="#8A85AD" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8A85AD"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={Boolean(secureTextEntry && !isPasswordVisible)}
          className="ml-3 flex-1 text-base text-app-textPrimary"
        />
        {secureTextEntry ? (
          <Pressable onPress={onTogglePasswordVisibility} hitSlop={8}>
            <AppIcon name={isPasswordVisible ? "Eye" : "EyeOff"} size={18} color="#8A85AD" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
