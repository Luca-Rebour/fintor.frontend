import Toast from "react-native-toast-message";

export function showSuccessToast(title: string, message?: string) {
  Toast.show({
    type: "success",
    text1: title,
    text2: message,
    position: "bottom",
    visibilityTime: 2600,
  });
}

export function showErrorToast(title: string, message?: string) {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
    position: "bottom",
    visibilityTime: 3200,
  });
}
