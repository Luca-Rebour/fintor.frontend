import { APP_COLORS } from "../constants/colors";
import { Link, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AuthInput } from "../components/auth/AuthInput";
import { AuthPrimaryButton } from "../components/auth/AuthPrimaryButton";
import { AuthScreenFrame } from "../components/auth/AuthScreenFrame";
import { AuthSocialButton } from "../components/auth/AuthSocialButton";
import { AppIcon } from "../components/shared/AppIcon";
import { AppDatePicker } from "../components/shared/DatePicker";
import { APP_GRADIENTS } from "../constants/colors";
import { CurrencyOption, loadCurrencyOptions } from "../services/currencies.service";
import { signUpWithEmail } from "../services/auth.service";

type PasswordStrengthLabelKey =
  | ""
  | "auth.passwordStrength.weak"
  | "auth.passwordStrength.medium"
  | "auth.passwordStrength.strong"
  | "auth.passwordStrength.veryStrong";

function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (password.length === 0) {
    return { score: 0, labelKey: "" as PasswordStrengthLabelKey, colorClass: "text-app-textSecondary" };
  }

  if (score <= 1) {
    return { score: 1, labelKey: "auth.passwordStrength.weak" as PasswordStrengthLabelKey, colorClass: "text-app-primary" };
  }

  if (score === 2) {
    return { score: 2, labelKey: "auth.passwordStrength.medium" as PasswordStrengthLabelKey, colorClass: "text-app-primaryStrong" };
  }

  if (score === 3) {
    return { score: 3, labelKey: "auth.passwordStrength.strong" as PasswordStrengthLabelKey, colorClass: "text-app-primaryStrong" };
  }

  return { score: 4, labelKey: "auth.passwordStrength.veryStrong" as PasswordStrengthLabelKey, colorClass: "text-app-success" };
}

export default function SignupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [mainCurrencyCode, setMainCurrencyCode] = useState("USD");
  const [currencyOptions, setCurrencyOptions] = useState<CurrencyOption[]>([]);
  const [isCurrencyPickerOpen, setIsCurrencyPickerOpen] = useState(false);
  const [currencySearchText, setCurrencySearchText] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  useEffect(() => {
    loadCurrencyOptions().then((options) => {
      setCurrencyOptions(options);

      if (!options.some((currency) => currency.code === mainCurrencyCode) && options.length > 0) {
        setMainCurrencyCode(options[0].code);
      }
    });
  }, []);

  const selectedCurrencyLabel =
    currencyOptions.find((currency) => currency.code === mainCurrencyCode)?.name ?? mainCurrencyCode;

  const filteredCurrencyOptions = useMemo(() => {
    const normalizedQuery = currencySearchText.trim().toLowerCase();

    if (!normalizedQuery) {
      return currencyOptions;
    }

    return currencyOptions.filter((currency) => {
      const normalizedCode = currency.code.toLowerCase();
      const normalizedName = currency.name.toLowerCase();

      return normalizedCode.includes(normalizedQuery) || normalizedName.includes(normalizedQuery);
    });
  }, [currencyOptions, currencySearchText]);

  function isValidEmail(value: string) {
    const normalizedEmail = value.trim();
    return normalizedEmail.includes("@") && normalizedEmail.length >= 5;
  }

  const canGoToStepTwo =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    isValidEmail(email);

  function handleGoToStepTwo() {
    if (!canGoToStepTwo) {
      setAuthMessage(`❌ ${t("auth.errors.completeStepOne")}`);
      return;
    }

    setAuthMessage("");
    setStep(2);
  }

  async function handleSignUp() {
    setIsSubmitting(true);
    setAuthMessage("");

    try {
      const session = await signUpWithEmail(
        firstName,
        lastName,
        email,
        password,
        dateOfBirth,
        mainCurrencyCode,
      );
      const displayName = `${session.user.name ?? ""} ${session.user.lastName ?? ""}`.trim() || session.user.email;

      setAuthMessage(`✅ ${t("auth.signup.accountCreatedFor", { name: displayName })}`);
      router.replace("/tabs/home");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("auth.errors.unableToCreateAccount");
      setAuthMessage(`❌ ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreenFrame variant="signup">
      <View className="mt-2">
        <View className="mb-7 flex-row items-center justify-between">
          <Pressable
            onPress={() => {
              if (step === 2) {
                setStep(1);
                setIsCurrencyPickerOpen(false);
                setCurrencySearchText("");
                return;
              }

              router.back();
            }}
            className="h-10 w-10 items-center justify-center"
          >
            <AppIcon name="ArrowLeft" size={22} color={APP_COLORS.textPrimary} />
          </Pressable>
          <Text className="text-xl font-bold text-app-textPrimary">{t("auth.signup.title")}</Text>
          <View className="w-10" />
        </View>

        <View className="mb-6 flex-row justify-center gap-2">
          <View className={`h-2 rounded-full ${step === 1 ? "w-7 bg-app-primaryStrong" : "w-2 bg-app-border"}`} />
          <View className={`h-2 rounded-full ${step === 2 ? "w-7 bg-app-primaryStrong" : "w-2 bg-app-border"}`} />
        </View>

        {step === 1 ? (
          <>
            <Text className="text-4xl font-bold text-app-textPrimary">{t("auth.signup.createAccountTitle")}</Text>
            <Text className="mt-3 mb-8 text-base leading-6 text-app-textSecondary">
              {t("auth.signup.createAccountSubtitle")}
            </Text>

            <AuthInput
              label={t("auth.signup.firstNameLabel")}
              placeholder={t("auth.signup.firstNamePlaceholder")}
              icon="User"
              value={firstName}
              onChangeText={setFirstName}
            />

            <AuthInput
              label={t("auth.signup.lastNameLabel")}
              placeholder={t("auth.signup.lastNamePlaceholder")}
              icon="User"
              value={lastName}
              onChangeText={setLastName}
            />

            <AuthInput
              label={t("auth.signup.emailLabel")}
              placeholder={t("auth.signup.emailPlaceholder")}
              icon="Mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {authMessage ? (
              <Text className="mb-4 text-center text-sm font-medium text-app-textPrimary">{authMessage}</Text>
            ) : null}

            <AuthPrimaryButton
              label={t("auth.signup.next")}
              colors={APP_GRADIENTS.actionSecondary}
              onPress={handleGoToStepTwo}
              disabled={!canGoToStepTwo}
            />
          </>
        ) : (
          <>
            <Text className="text-4xl font-bold text-app-textPrimary">{t("auth.signup.securityTitle")}</Text>
            <Text className="mt-3 mb-8 text-base leading-6 text-app-textSecondary">
              {t("auth.signup.securitySubtitle")}
            </Text>

            <AuthInput
              label={t("auth.signup.passwordLabel")}
              placeholder={t("auth.signup.passwordPlaceholder")}
              icon="Lock"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              isPasswordVisible={isPasswordVisible}
              onTogglePasswordVisibility={() => setIsPasswordVisible((current) => !current)}
            />

            <View className="mb-4 mt-1 gap-2">
              <View className="flex-row gap-2">
                {[0, 1, 2, 3].map((index) => {
                  const isActive = index < passwordStrength.score;
                  const barClass =
                    passwordStrength.score >= 4
                      ? "bg-app-success"
                      : passwordStrength.score >= 2
                      ? "bg-app-primaryStrong"
                      : "bg-app-primary";

                  return (
                    <View
                      key={index}
                      className={`h-1 flex-1 rounded-full ${isActive ? barClass : "bg-app-border"}`}
                    />
                  );
                })}
              </View>
              {passwordStrength.labelKey ? (
                <Text className={`self-end text-xs font-semibold ${passwordStrength.colorClass}`}>
                  {t(passwordStrength.labelKey)}
                </Text>
              ) : null}
            </View>

            <View className="mb-4">
              <AppDatePicker
                label={t("auth.signup.dateOfBirthLabel")}
                value={dateOfBirth}
                placeholder={t("auth.signup.dateOfBirthPlaceholder")}
                initialDate={new Date(2000, 0, 1)}
                maximumDate={new Date()}
                iosTitle={t("auth.signup.dateOfBirthLabel")}
                cancelLabel={t("common.cancel")}
                doneLabel={t("common.done")}
                onChange={setDateOfBirth}
              />
            </View>

            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-app-textPrimary">{t("auth.signup.mainCurrencyLabel")}</Text>
              <View className="relative">
                <Pressable
                  onPress={() => setIsCurrencyPickerOpen((previous) => !previous)}
                  className="h-14 flex-row items-center justify-between rounded-2xl border border-app-border bg-app-cardSoft px-4"
                >
                  <Text className="text-base text-app-textPrimary">
                    {mainCurrencyCode} - {selectedCurrencyLabel}
                  </Text>
                  <AppIcon name={isCurrencyPickerOpen ? "ChevronUp" : "ChevronDown"} size={18} color="#8A85AD" />
                </Pressable>

                {isCurrencyPickerOpen ? (
                  <View
                    className="absolute left-0 right-0 bottom-full mb-2 max-h-72 overflow-hidden rounded-2xl border border-app-border bg-app-bgSecondary z-50"
                    style={{ elevation: 24 }}
                  >
                    <View className="px-3 py-3 border-b border-app-border">
                      <View className="flex-row items-center rounded-xl border border-app-border bg-app-surface px-3 py-2">
                        <AppIcon name="Search" size={15} color={APP_COLORS.textSecondary} />
                        <TextInput
                          value={currencySearchText}
                          onChangeText={setCurrencySearchText}
                          placeholder={t("auth.signup.currencySearchPlaceholder")}
                          placeholderTextColor={APP_COLORS.textMuted}
                          autoCapitalize="none"
                          className="ml-2 flex-1 text-sm text-app-textPrimary"
                        />
                      </View>
                    </View>

                    <ScrollView nestedScrollEnabled>
                      {filteredCurrencyOptions.map((currency) => {
                        const isSelected = currency.code === mainCurrencyCode;
                        return (
                          <Pressable
                            key={currency.code}
                            onPress={() => {
                              setMainCurrencyCode(currency.code);
                              setIsCurrencyPickerOpen(false);
                              setCurrencySearchText("");
                            }}
                            className="flex-row items-center justify-between border-b border-app-border px-4 py-3"
                          >
                            <Text className={`text-sm ${isSelected ? "text-app-primary font-semibold" : "text-app-textPrimary"}`}>
                              {currency.code} - {currency.name}
                            </Text>
                            {isSelected ? <AppIcon name="Check" size={14} color={APP_COLORS.actionPrimary} /> : null}
                          </Pressable>
                        );
                      })}

                      {filteredCurrencyOptions.length === 0 ? (
                        <View className="px-4 py-4">
                          <Text className="text-center text-sm text-app-textSecondary">{t("auth.signup.noCurrenciesFound")}</Text>
                        </View>
                      ) : null}
                    </ScrollView>
                  </View>
                ) : null}
              </View>
            </View>

            <Text className="mb-8 text-sm text-app-textSecondary">
              {t("auth.signup.termsPrefix")} <Text className="font-semibold text-app-primaryStrong">{t("auth.signup.termsOfService")}</Text> {t("auth.signup.and")}
              <Text className="font-semibold text-app-primaryStrong"> {t("auth.signup.privacyPolicy")}</Text>
            </Text>

            {authMessage ? (
              <Text className="mb-4 text-center text-sm font-medium text-app-textPrimary">{authMessage}</Text>
            ) : null}

            <AuthPrimaryButton
              label={isSubmitting ? t("auth.signup.creatingAccount") : t("auth.signup.createAccount")}
              colors={APP_GRADIENTS.actionSecondary}
              onPress={handleSignUp}
              disabled={isSubmitting || passwordStrength.score < 2 || !dateOfBirth.trim()}
            />
          </>
        )}

        <View className="mt-8">
          <Text className="mb-4 text-center text-sm text-app-textSecondary">{t("auth.signup.orContinueWith")}</Text>
          <View className="mb-8 flex-row gap-3">
            <AuthSocialButton label="Google" />
            <AuthSocialButton label="Apple" />
          </View>

          <Text className="text-center text-sm text-app-textSecondary">
            {t("auth.signup.alreadyHaveAccount")} {" "}
            <Link href="/" className="font-bold text-app-primaryStrong">
              {t("auth.signup.signIn")}
            </Link>
          </Text>
        </View>
      </View>
    </AuthScreenFrame>
  );
}

