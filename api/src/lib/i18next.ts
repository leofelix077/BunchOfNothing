import i18next from "i18next";
import { LanguageDetector } from "i18next-express-middleware";

import pt from "../strings/pt";
import en from "../strings/en";

i18next.use(LanguageDetector).init({
  fallbackLng: "en",
  debug: true,
  react: {
    wait: true,
  },
  resources: {
    pt,
    en,
  },
});

export default i18next;
