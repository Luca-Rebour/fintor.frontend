import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./resources/en";
import es from "./resources/es";

export const SUPPORTED_LANGUAGES = ["en", "es"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_STORAGE_KEY = "app.language";

const resources = {
  en: { translation: en },
  es: { translation: es },
} as const;

function normalizeLanguage(language: string | null | undefined): SupportedLanguage {
  const normalized = (language ?? "").toLowerCase().split("-")[0];

  if (SUPPORTED_LANGUAGES.includes(normalized as SupportedLanguage)) {
    return normalized as SupportedLanguage;
  }

  return "en";
}

const languageDetector = {
  type: "languageDetector" as const,
  async: true,
  init: () => {},
  detect: async (callback: (language: string) => void) => {
    try {
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

      if (storedLanguage) {
        callback(normalizeLanguage(storedLanguage));
        return;
      }

      const locale = Localization.getLocales()[0];
      const deviceLanguage = locale?.languageCode ?? locale?.languageTag;
      callback(normalizeLanguage(deviceLanguage));
    } catch {
      callback("en");
    }
  },
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, normalizeLanguage(language));
    } catch {
      // noop
    }
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(languageDetector as any)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      supportedLngs: [...SUPPORTED_LANGUAGES],
      defaultNS: "translation",
      ns: ["translation"],
      interpolation: {
        escapeValue: false,
      },
      returnNull: false,
      react: {
        useSuspense: false,
      },
    });
}

export async function setAppLanguage(language: SupportedLanguage) {
  await i18n.changeLanguage(language);
}

export function getAppLanguage(): SupportedLanguage {
  return normalizeLanguage(i18n.resolvedLanguage ?? i18n.language);
}

export default i18n;
