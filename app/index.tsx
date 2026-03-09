import { APP_COLORS } from "../constants/colors";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AuthInput } from "../components/auth/AuthInput";
import { AuthPrimaryButton } from "../components/auth/AuthPrimaryButton";
import { AuthScreenFrame } from "../components/auth/AuthScreenFrame";
import { AppIcon } from "../components/shared/AppIcon";
import { APP_GRADIENTS } from "../constants/colors";
import { signInWithEmail } from "../services/auth.service";
import { resolveApiErrorMessage } from "../i18n/resolve-api-error-message";

export default function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  async function handleSignIn() {
    
    setIsSubmitting(true);
    setAuthMessage("");

    try {
      const session = await signInWithEmail(email, password);
      router.replace("/tabs/home");
      
    } catch (error) {
      const message = resolveApiErrorMessage(error, t, "auth.errors.unableToSignIn");
      setAuthMessage(`❌ ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreenFrame variant="login">
      <View className="mt-4 flex-1 justify-between">
        <View>
          <View className="mx-auto mb-8 h-16 w-16 items-center justify-center rounded-2xl border border-app-border bg-app-cardSoft">
            <AppIcon name="Lock" size={24} color="#19C7FF" />
          </View>

          <Text className="text-center text-4xl font-bold text-app-textPrimary">{t("auth.login.title")}</Text>
          <Text className="mt-3 text-center text-base text-app-textSecondary">
            {t("auth.login.subtitle")}
          </Text>

          <View className="mt-10">
            <AuthInput
              label={t("auth.login.emailLabel")}
              placeholder={t("auth.login.emailPlaceholder")}
              icon="Mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <AuthInput
              label={t("auth.login.passwordLabel")}
              placeholder={t("auth.login.passwordPlaceholder")}
              icon="Lock"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              isPasswordVisible={isPasswordVisible}
              onTogglePasswordVisibility={() => setIsPasswordVisible((current) => !current)}
            />
          </View>

          <Text className="mb-7 text-right text-sm font-semibold text-app-primary">{t("auth.login.forgotPassword")}</Text>

          {authMessage ? (
            <Text className="mb-4 text-center text-sm font-medium text-app-textPrimary">{authMessage}</Text>
          ) : null}

          <AuthPrimaryButton
            label={isSubmitting ? t("auth.login.signingIn") : t("auth.login.signIn")}
            colors={APP_GRADIENTS.actionPrimary}
            iconRight={isSubmitting ? null : <AppIcon name="ArrowRight" size={18} color={APP_COLORS.textPrimary} />}
            onPress={handleSignIn}
            disabled={isSubmitting}
          />
        </View>

        <View className="mt-10">
          <View className="mb-6 flex-row items-center">
            <View className="h-px flex-1 bg-app-border" />
            <Text className="mx-4 text-sm text-app-textSecondary">{t("auth.login.orSignInWith")}</Text>
            <View className="h-px flex-1 bg-app-border" />
          </View>

          <View className="mb-7 items-center">
            <View className="mb-2 h-14 w-14 items-center justify-center rounded-full border border-app-border bg-app-cardSoft">
              <AppIcon name="Shield" size={22} color="#19C7FF" />
            </View>
            <Text className="text-app-textSecondary">{t("auth.login.faceId")}</Text>
          </View>

          <Text className="text-center text-sm text-app-textSecondary">
            {t("auth.login.noAccount")} {" "}
            <Link href="/signup" className="font-bold text-app-primary">
              {t("auth.login.signUp")}
            </Link>
          </Text>
        </View>
      </View>
    </AuthScreenFrame>
  );
}
