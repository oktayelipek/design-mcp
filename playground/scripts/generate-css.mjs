import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. JSON Verisini Oku
const colorsJson = JSON.parse(fs.readFileSync(path.join(__dirname, "../../src/data/tokens/colors.json"), "utf8"));
const kriptoDark = colorsJson.modes["Kripto Dark"];

// 2. CSS Değişkenleri Üretmek İçin Recursive Fonksiyon
let cssRoot = `:root {\n`;

function traverseAndCreateCSSVars(obj, prefix = "") {
  for (const key in obj) {
    if (typeof obj[key] === "object") {
      traverseAndCreateCSSVars(obj[key], `${prefix}${key.replace(/ /g, "-")}-`);
    } else {
      cssRoot += `  --${prefix}${key.replace(/ /g, "-")}: ${obj[key]};\n`;
    }
  }
}

// Orijinal Tasarım Tokenlarını Ekle
cssRoot += `  /* Core BTCTurk Tokens (Kripto Dark) */\n`;
traverseAndCreateCSSVars(kriptoDark);

// Semantic Mapping (Bileşenlerin Kodlarında Kullandığımız Diğer Alias/Mantıksal Adlandırmalar)
cssRoot += `\n  /* Semantic Button Tokens */
  --button-solid: var(--button-primary);
  --button-solid-text: var(--inverse-pureWhite);
  --button-muted: var(--button-secondary);
  --button-muted-text: var(--text-focus);
  --semantic-on-color: var(--inverse-pureWhite);

  /* Semantic Form/Radio/Input Tokens */
  --form-background-default: var(--level-surface);
  --form-background-disabled: var(--level-basement);
  --form-background-focus: var(--level-basement);
  --form-border-default: var(--text-tertiary);
  --form-border-focus: var(--brand-primary);
  --form-border-disabled: var(--level-elevation-+1);
  --semantic-success-border: var(--actions-action-01);
  --semantic-warning-border: var(--actions-action-03);
  --semantic-error-border: var(--actions-action-02);

  /* Semantic Text Tokens */
  --text-primary: var(--text-focus);
  --text-secondary: var(--text-secondary);
  --text-tertiary: var(--text-tertiary);
  --text-quaternary: #3d4a5c; /* form placeholder */
  
  /* Semantic Icon */
  --icon-tertiary: var(--icon-disabled);
}\n
`;

// Tema tabanı (vücut arka planı ve metin rengini ayarla)
cssRoot += `
body {
  background-color: var(--level-basement);
  color: var(--text-primary);
}
`;

// Tailwind V4 yapısıyla birlikte index.css dosyasını güncelle
const cssFinal = `@import "tailwindcss";\n\n${cssRoot}`;

fs.writeFileSync(path.join(__dirname, "../src/index.css"), cssFinal);
console.log("✅ CSS Tokenları Playground index.css dosyasına başarıyla gömüldü!");
