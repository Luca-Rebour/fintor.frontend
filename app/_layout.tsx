import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";
import "../global.css";

function LayoutWithInsets() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  
  // Función para obtener el color de fondo según la ruta actual
  const getBackgroundColor = () => {

    if (pathname === "/") {
      return "#043342"; // Mismo color inicial del gradient del login
    }

    if (pathname === "/signup") {
      return "#1C0631"; // Mismo color inicial del gradient del signup
    }
    
    if (pathname.includes("/profile")) {
      return "#062027"; // Color de profile
    }
    
    return "#060F24"; // Color de home
  };
  
  return (
    <View 
      style={{ 
        flex: 1,
        backgroundColor: getBackgroundColor(),
        paddingTop: insets.top,
      }}
    >
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LayoutWithInsets />
    </SafeAreaProvider>
  );
}