import { ReactNode } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { APP_GRADIENTS } from "../../constants/colors";

type AuthScreenFrameProps = {
  variant: "login" | "signup";
  children: ReactNode;
};

export function AuthScreenFrame({ variant, children }: AuthScreenFrameProps) {
  const backgroundColors =
    variant === "login" ? APP_GRADIENTS.surfaceDark : APP_GRADIENTS.surfaceViolet;

  return (
    <View className="flex-1">
      <LinearGradient colors={backgroundColors} style={StyleSheet.absoluteFill} />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="min-h-full px-6 py-6"
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
