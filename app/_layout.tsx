import { Stack, usePathname } from "expo-router";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";
import "../global.css";

function LayoutWithInsets() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  
  // Función para obtener el color de fondo según la ruta actual
  const getBackgroundColor = () => {
    // Si estamos en login
    if (pathname === "/") {
      return "#043342"; // Mismo color inicial del gradient del login
    }

    // Si estamos en signup
    if (pathname === "/signup") {
      return "#1C0631"; // Mismo color inicial del gradient del signup
    }
    
    // Si estamos en el tab de profile
    if (pathname.includes("/profile")) {
      return "#062027"; // Color de profile
    }
    
    // Default: color del home y otras pantallas
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