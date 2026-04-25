import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import bn from "./locales/bn.json";
import en from "./locales/en.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      bn: { translation: bn },
    },
    lng: "bn",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  })
  .catch((err) => console.error("Error initializing i18n", err));

export default i18n;
