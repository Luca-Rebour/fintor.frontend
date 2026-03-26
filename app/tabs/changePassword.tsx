import { APP_COLORS } from "../../constants/colors";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { AppIcon } from "../../components/shared/AppIcon";
import { changePassword } from "../../services/auth.service";
import { resolveApiErrorMessage } from "../../i18n/resolve-api-error-message";

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert(t("profile.changePassword.errors.title"), t("profile.changePassword.errors.requiredFields"));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t("profile.changePassword.errors.title"), t("profile.changePassword.errors.minLength"));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t("profile.changePassword.errors.title"), t("profile.changePassword.errors.passwordMismatch"));
      return;
    }

    if (newPassword === currentPassword) {
      Alert.alert(t("profile.changePassword.errors.title"), t("profile.changePassword.errors.samePassword"));
      return;
    }

    try {
      setIsSubmitting(true);
      await changePassword(currentPassword, newPassword);
      Alert.alert(t("profile.changePassword.success.title"), t("profile.changePassword.success.message"));
      router.replace("/tabs/profile");
    } catch (error) {
      const message = resolveApiErrorMessage(error, t, "profile.changePassword.errors.generic");
      Alert.alert(t("profile.changePassword.errors.title"), message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View className="flex-1 bg-app-bgPrimary px-4 pt-2">
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.replace("/tabs/profile")}
          className="h-10 w-10 items-center justify-center rounded-full bg-app-surface"
        >
          <AppIcon name="ArrowLeft" size={18} color={APP_COLORS.textPrimary} />
        </Pressable>

        <Text className="text-xl font-bold text-app-textPrimary">{t("profile.changePassword.title")}</Text>

        <View className="h-10 w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="rounded-2xl border border-app-border bg-app-bgSecondary p-4">
          <Text className="mb-2 text-sm text-app-textSecondary">{t("profile.changePassword.currentPassword")}</Text>
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            autoCapitalize="none"
            placeholder={t("profile.changePassword.placeholders.currentPassword")}
            placeholderTextColor={APP_COLORS.textMuted}
            className="mb-4 rounded-xl border border-app-border bg-app-surface px-3 py-3 text-app-textPrimary"
          />

          <Text className="mb-2 text-sm text-app-textSecondary">{t("profile.changePassword.newPassword")}</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
            placeholder={t("profile.changePassword.placeholders.newPassword")}
            placeholderTextColor={APP_COLORS.textMuted}
            className="mb-4 rounded-xl border border-app-border bg-app-surface px-3 py-3 text-app-textPrimary"
          />

          <Text className="mb-2 text-sm text-app-textSecondary">{t("profile.changePassword.confirmPassword")}</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            placeholder={t("profile.changePassword.placeholders.confirmPassword")}
            placeholderTextColor={APP_COLORS.textMuted}
            className="rounded-xl border border-app-border bg-app-surface px-3 py-3 text-app-textPrimary"
          />
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          className="mt-4 rounded-xl bg-app-accentBlue px-4 py-4"
        >
          <Text className="text-center text-base font-bold text-[#061324]">
            {isSubmitting ? t("profile.changePassword.actions.saving") : t("profile.changePassword.actions.save")}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
