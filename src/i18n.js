import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Initialize i18n without HTTP backend to avoid console errors
i18n
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false, // Not needed for React as it escapes by default
    },
    resources: {
      en: {
        translation: {},
      },
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
