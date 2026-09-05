import type { SupportedLanguage } from "@/types";

export type HomeShellProps = Record<string, never>;

export type LanguageSelectorProps = {
  value: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
};
