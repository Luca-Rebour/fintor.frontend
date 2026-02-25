import { Feather } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { AuthInput } from "../components/auth/AuthInput";
import { AuthPrimaryButton } from "../components/auth/AuthPrimaryButton";
import { AuthScreenFrame } from "../components/auth/AuthScreenFrame";
import { AuthSocialButton } from "../components/auth/AuthSocialButton";
import { APP_GRADIENTS } from "../constants/colors";
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
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  async function handleSignUp() {
    setIsSubmitting(true);
    setAuthMessage("");

    try {
      const session = await signUpWithEmail(fullName, email, password);
      
      Alert.alert(
        "Account created!",
        `Welcome ${session.user.name}! Your account has been created successfully.`,
        [
          {
            text: "Continue",
            onPress: () => {
              setAuthMessage(`✅ Account created for ${session.user.name}!`);
            },
          },
        ]
      );
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
          <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center">
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </Pressable>
          <Text className="text-xl font-bold text-app-textPrimary">Sign Up</Text>
          <View className="w-10" />
        </View>

        <View className="mb-6 flex-row justify-center gap-2">
          <View className="h-2 w-7 rounded-full bg-app-primaryStrong" />
          <View className="h-2 w-2 rounded-full bg-app-border" />
          <View className="h-2 w-2 rounded-full bg-app-border" />
        </View>

        <Text className="text-4xl font-bold text-app-textPrimary">Create Your Account</Text>
        <Text className="mt-3 mb-8 text-base leading-6 text-app-textSecondary">
          Start tracking your finances with neon precision today.
        </Text>

        <AuthInput
          label="Full Name"
          placeholder="Ex. John Doe"
          icon="user"
          value={fullName}
          onChangeText={setFullName}
        />
        <AuthInput
          label="Email Address"
          placeholder="name@example.com"
          icon="mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <AuthInput
          label="Password"
          placeholder="••••••••"
          icon="lock"
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
          disabled={isSubmitting || passwordStrength.score < 2}
        />

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
