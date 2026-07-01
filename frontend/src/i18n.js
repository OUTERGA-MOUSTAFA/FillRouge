import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

export const SUPPORTED_LANGUAGES = ["fr", "en", "ar"];
const RTL_LANGUAGES = ["ar"];

// Fusion profonde (les sous-objets sont combinés, pas écrasés)
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    const val = source[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      target[key] = deepMerge(
        target[key] && typeof target[key] === "object" ? target[key] : {},
        val
      );
    } else {
      target[key] = val;
    }
  }
  return target;
}

// Charge automatiquement TOUS les fichiers de traduction :
//   - ./locales/<lang>.json            (base commune : nav, common, card…)
//   - ./locales/<lang>/<namespace>.json (un fichier par page/section)
// Chaque fichier contient déjà ses clés sous leur namespace (ex: { "home": { … } }).
const baseFiles = import.meta.glob("./locales/*.json", { eager: true });
const pageFiles = import.meta.glob("./locales/*/*.json", { eager: true });

const resources = {};

function addFile(path, mod) {
  const content = mod?.default ?? mod;
  // path: ./locales/fr.json  ou  ./locales/fr/home.json
  const rel = path.replace("./locales/", "").replace(/\.json$/, "");
  const lang = rel.split("/")[0];
  if (!SUPPORTED_LANGUAGES.includes(lang)) return;
  resources[lang] = resources[lang] || { translation: {} };
  deepMerge(resources[lang].translation, content);
}

for (const path in baseFiles) addFile(path, baseFiles[path]);
for (const path in pageFiles) addFile(path, pageFiles[path]);

// Applique la direction (RTL/LTR) et l'attribut lang sur <html>
const applyDirection = (lng) => {
  const base = (lng || "fr").split("-")[0];
  const dir = RTL_LANGUAGES.includes(base) ? "rtl" : "ltr";
  if (typeof document !== "undefined") {
    document.documentElement.lang = base;
    document.documentElement.dir = dir;
  }
};

i18n
  .use(LanguageDetector) // détecte la langue (localStorage puis navigateur)
  .use(initReactI18next) // passe i18n à react-i18next
  .init({
    resources,
    fallbackLng: "fr",
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true, // "fr-FR" -> "fr"
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false, // React échappe déjà
    },
    react: {
      useSuspense: false, // ressources chargées en synchrone, pas besoin de <Suspense>
    },
  });

// Direction au démarrage puis à chaque changement de langue
applyDirection(i18n.language);
i18n.on("languageChanged", applyDirection);

export default i18n;
