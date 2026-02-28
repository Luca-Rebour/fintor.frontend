import { Link, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { AuthInput } from "../components/auth/AuthInput";
import { AuthPrimaryButton } from "../components/auth/AuthPrimaryButton";
import { AuthScreenFrame } from "../components/auth/AuthScreenFrame";
import { AuthSocialButton } from "../components/auth/AuthSocialButton";
import { AppIcon } from "../components/shared/AppIcon";
import { APP_GRADIENTS } from "../constants/colors";
import { CurrencyOption, loadCurrencyOptions } from "../services/currencies.service";
import { signUpWithEmail } from "../services/auth.service";

function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (password.length === 0) {
    return { score: 0, label: "", colorClass: "text-app-textSecondary" };
  }

  if (score <= 1) {
    return { score: 1, label: "Weak", colorClass: "text-app-primary" };
  }

  if (score === 2) {
    return { score: 2, label: "Medium", colorClass: "text-app-primaryStrong" };
  }

  if (score === 3) {
    return { score: 3, label: "Strong", colorClass: "text-app-primaryStrong" };
  }

  return { score: 4, label: "Very Strong", colorClass: "text-app-success" };
}

export default function SignupScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dateOfBirthValue, setDateOfBirthValue] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
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

  function formatDate(value: Date) {
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, "0");
    const day = `${value.getDate()}`.padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (event.type === "dismissed") {
      setIsDatePickerOpen(false);
      return;
    }

    if (selectedDate) {
      setDateOfBirthValue(selectedDate);
      setDateOfBirth(formatDate(selectedDate));
    }

    if (Platform.OS === "android") {
      setIsDatePickerOpen(false);
    }
  }

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
      setAuthMessage("❌ Completa nombre, apellido y email válido para continuar");
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

      setAuthMessage(`✅ Account created for ${displayName}`);
      router.replace("/tabs/home");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create account";
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
                setIsDatePickerOpen(false);
                return;
              }

              router.back();
            }}
            className="h-10 w-10 items-center justify-center"
          >
            <AppIcon name="ArrowLeft" size={22} color="#FFFFFF" />
          </Pressable>
          <Text className="text-xl font-bold text-app-textPrimary">Sign Up</Text>
          <View className="w-10" />
        </View>

        <View className="mb-6 flex-row justify-center gap-2">
          <View className={`h-2 rounded-full ${step === 1 ? "w-7 bg-app-primaryStrong" : "w-2 bg-app-border"}`} />
          <View className={`h-2 rounded-full ${step === 2 ? "w-7 bg-app-primaryStrong" : "w-2 bg-app-border"}`} />
        </View>

        {step === 1 ? (
          <>
            <Text className="text-4xl font-bold text-app-textPrimary">Create Your Account</Text>
            <Text className="mt-3 mb-8 text-base leading-6 text-app-textSecondary">
              Start tracking your finances with neon precision today.
            </Text>

            <AuthInput
              label="Nombre"
              placeholder="Ex. John"
              icon="User"
              value={firstName}
              onChangeText={setFirstName}
            />

            <AuthInput
              label="Apellido"
              placeholder="Ex. Doe"
              icon="User"
              value={lastName}
              onChangeText={setLastName}
            />

            <AuthInput
              label="Email Address"
              placeholder="name@example.com"
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
              label="Siguiente"
              colors={APP_GRADIENTS.actionSecondary}
              onPress={handleGoToStepTwo}
              disabled={!canGoToStepTwo}
            />
          </>
        ) : (
          <>
            <Text className="text-4xl font-bold text-app-textPrimary">Security & Currency</Text>
            <Text className="mt-3 mb-8 text-base leading-6 text-app-textSecondary">
              Define tu contraseña, fecha de nacimiento y moneda principal.
            </Text>

            <AuthInput
              label="Password"
              placeholder="••••••••"
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
              {passwordStrength.label ? (
                <Text className={`self-end text-xs font-semibold ${passwordStrength.colorClass}`}>
                  {passwordStrength.label}
                </Text>
              ) : null}
            </View>

            <View className="relative mb-1">
              <AuthInput
                label="Date of birth"
                placeholder="YYYY-MM-DD"
                icon="Calendar"
                value={dateOfBirth}
                onChangeText={() => undefined}
              />

              <Pressable
                onPress={() => setIsDatePickerOpen(true)}
                className="absolute left-0 right-0 bottom-0 h-14"
              />
            </View>

            {isDatePickerOpen ? (
              <View className="mb-4 rounded-2xl border border-[#1E2A47] bg-[#0C1830] px-3 py-2">
                <DateTimePicker
                  value={dateOfBirthValue ?? new Date(2000, 0, 1)}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  themeVariant={Platform.OS === "ios" ? "dark" : undefined}
                  textColor={Platform.OS === "ios" ? "#E2E8F0" : undefined}
                  accentColor={Platform.OS === "ios" ? "#18C8FF" : undefined}
                />

                {Platform.OS === "ios" ? (
                  <Pressable
                    onPress={() => setIsDatePickerOpen(false)}
                    className="mt-2 self-end rounded-lg border border-[#1E2A47] px-3 py-1"
                  >
                    <Text className="text-sm text-app-primary">Done</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-app-textPrimary">Main currency</Text>
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
                    className="absolute left-0 right-0 bottom-full mb-2 max-h-72 overflow-hidden rounded-2xl border border-app-border bg-[#111C33] z-50"
                    style={{ elevation: 24 }}
                  >
                    <View className="px-3 py-3 border-b border-[#1E2A47]">
                      <View className="flex-row items-center rounded-xl border border-[#1E2A47] bg-[#0C1830] px-3 py-2">
                        <AppIcon name="Search" size={15} color="#94A3B8" />
                        <TextInput
                          value={currencySearchText}
                          onChangeText={setCurrencySearchText}
                          placeholder="Buscar por código o nombre"
                          placeholderTextColor="#64748B"
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
                            className="flex-row items-center justify-between border-b border-[#1E2A47] px-4 py-3"
                          >
                            <Text className={`text-sm ${isSelected ? "text-app-primary font-semibold" : "text-app-textPrimary"}`}>
                              {currency.code} - {currency.name}
                            </Text>
                            {isSelected ? <AppIcon name="Check" size={14} color="#18C8FF" /> : null}
                          </Pressable>
                        );
                      })}

                      {filteredCurrencyOptions.length === 0 ? (
                        <View className="px-4 py-4">
                          <Text className="text-center text-sm text-app-textSecondary">No se encontraron monedas</Text>
                        </View>
                      ) : null}
                    </ScrollView>
                  </View>
                ) : null}
              </View>
            </View>

            <Text className="mb-8 text-sm text-app-textSecondary">
              I agree to the <Text className="font-semibold text-app-primaryStrong">Terms of Service</Text> and
              <Text className="font-semibold text-app-primaryStrong"> Privacy Policy</Text>
            </Text>

            {authMessage ? (
              <Text className="mb-4 text-center text-sm font-medium text-app-textPrimary">{authMessage}</Text>
            ) : null}

            <AuthPrimaryButton
              label={isSubmitting ? "Creating Account..." : "Create Account"}
              colors={APP_GRADIENTS.actionSecondary}
              onPress={handleSignUp}
              disabled={isSubmitting || passwordStrength.score < 2 || !dateOfBirth.trim()}
            />
          </>
        )}

        <View className="mt-8">
          <Text className="mb-4 text-center text-sm text-app-textSecondary">Or continue with</Text>
          <View className="mb-8 flex-row gap-3">
            <AuthSocialButton label="Google" />
            <AuthSocialButton label="Apple" />
          </View>

          <Text className="text-center text-sm text-app-textSecondary">
            Already have an account?{" "}
            <Link href="/" className="font-bold text-app-primaryStrong">
              Sign In
            </Link>
          </Text>
        </View>
      </View>
    </AuthScreenFrame>
  );
}
