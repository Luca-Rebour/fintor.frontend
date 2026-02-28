import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

import { AuthInput } from "../components/auth/AuthInput";
import { AuthPrimaryButton } from "../components/auth/AuthPrimaryButton";
import { AuthScreenFrame } from "../components/auth/AuthScreenFrame";
import { AppIcon } from "../components/shared/AppIcon";
import { APP_GRADIENTS } from "../constants/colors";
import { signInWithEmail } from "../services/auth.service";

export default function Index() {
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
          console.log("Attempting sign in with email:", email, "and password:", password ? "[REDACTED]" : "[EMPTY]");
      const session = await signInWithEmail(email, password);
      console.log("Sign in successful, received session:", session);
      router.replace("/tabs/home");
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in";
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

          <Text className="text-center text-4xl font-bold text-app-textPrimary">Secure Login</Text>
          <Text className="mt-3 text-center text-base text-app-textSecondary">
            Welcome back to your financial hub.
          </Text>
          <Text className="mt-2 text-center text-xs text-app-textSecondary">
            Demo: emilys / emilyspass
          </Text>

          <View className="mt-10">
            <AuthInput
              label="Email Address"
              placeholder="john@finance.com"
              icon="Mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
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
          </View>

          <Text className="mb-7 text-right text-sm font-semibold text-app-primary">Forgot Password?</Text>

          {authMessage ? (
            <Text className="mb-4 text-center text-sm font-medium text-app-textPrimary">{authMessage}</Text>
          ) : null}

          <AuthPrimaryButton
            label={isSubmitting ? "Signing In..." : "Sign In"}
            colors={APP_GRADIENTS.actionPrimary}
            iconRight={isSubmitting ? null : <AppIcon name="ArrowRight" size={18} color="#FFFFFF" />}
            onPress={handleSignIn}
            disabled={isSubmitting}
          />
        </View>

        <View className="mt-10">
          <View className="mb-6 flex-row items-center">
            <View className="h-px flex-1 bg-app-border" />
            <Text className="mx-4 text-sm text-app-textSecondary">Or sign in with</Text>
            <View className="h-px flex-1 bg-app-border" />
          </View>

          <View className="mb-7 items-center">
            <View className="mb-2 h-14 w-14 items-center justify-center rounded-full border border-app-border bg-app-cardSoft">
              <AppIcon name="Shield" size={22} color="#19C7FF" />
            </View>
            <Text className="text-app-textSecondary">Face ID</Text>
          </View>

          <Text className="text-center text-sm text-app-textSecondary">
            Don’t have an account?{" "}
            <Link href="/signup" className="font-bold text-app-primary">
              Sign Up
            </Link>
          </Text>
        </View>
      </View>
    </AuthScreenFrame>
  );
}